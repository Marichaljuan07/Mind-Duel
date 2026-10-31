-- Ejecutar una sola vez en Supabase > SQL Editor antes de desplegar 3.13.92.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE TABLE IF NOT EXISTS public.knowledge_votes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
 attribute_key text NOT NULL, value boolean NOT NULL, device_hash text NOT NULL, source_note text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(character_id,attribute_key,device_hash)
);
CREATE INDEX IF NOT EXISTS knowledge_votes_lookup_idx ON public.knowledge_votes(character_id,attribute_key);
ALTER TABLE public.knowledge_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.knowledge_votes FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.submit_knowledge_batch(p_votes jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public,extensions AS $$
DECLARE item jsonb; nm text; norm text; slug_value text; attr text; val boolean; latest_val boolean; dh text; note text; cid uuid; yes_count int; no_count int; old_value boolean; old_votes int; state text; saved_count int:=0; created_count int:=0;
BEGIN
 IF jsonb_typeof(p_votes)<>'array' OR jsonb_array_length(p_votes)<1 OR jsonb_array_length(p_votes)>50 THEN RAISE EXCEPTION 'Lote inválido: debe contener de 1 a 50 aportes'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_votes) LOOP
  nm:=left(trim(coalesce(item->>'character','')),120); attr:=trim(coalesce(item->>'attribute_key','')); dh:=trim(coalesce(item->>'device_hash','')); note:=left(trim(coalesce(item->>'source_note','')),500);
  IF nm='' OR attr='' OR jsonb_typeof(item->'value')<>'boolean' OR length(dh)<>64 THEN CONTINUE; END IF;
  val:=(item->>'value')::boolean; norm:=lower(regexp_replace(unaccent(nm),'[^a-z0-9]+','','g'));
  PERFORM pg_advisory_xact_lock(hashtext('character:'||norm));
  SELECT c.id INTO cid FROM public.characters c WHERE lower(regexp_replace(unaccent(c.name),'[^a-z0-9]+','','g'))=norm OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(to_jsonb(c.aliases))='array' THEN to_jsonb(c.aliases) ELSE '[]'::jsonb END) a(alias) WHERE lower(regexp_replace(unaccent(a.alias),'[^a-z0-9]+','','g'))=norm) ORDER BY CASE WHEN lower(regexp_replace(unaccent(c.name),'[^a-z0-9]+','','g'))=norm THEN 0 ELSE 1 END LIMIT 1;
  IF cid IS NULL THEN
   slug_value:=trim(both '-' from regexp_replace(norm,'[^a-z0-9]+','-','g')); IF slug_value='' THEN slug_value:='personaje'; END IF;
   IF EXISTS(SELECT 1 FROM public.characters WHERE slug=slug_value) THEN slug_value:=slug_value||'-'||substr(md5(nm),1,6); END IF;
   INSERT INTO public.characters(name,slug,aliases,description,attributes,status) VALUES(nm,slug_value,'[]'::jsonb,'','{}'::jsonb,'candidate') RETURNING id INTO cid; created_count:=created_count+1;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(cid::text),hashtext(attr));
  INSERT INTO public.knowledge_votes(character_id,attribute_key,value,device_hash,source_note,updated_at) VALUES(cid,attr,val,dh,note,now()) ON CONFLICT(character_id,attribute_key,device_hash) DO UPDATE SET value=EXCLUDED.value,source_note=EXCLUDED.source_note,updated_at=now();
  saved_count:=saved_count+1;
  SELECT count(*) FILTER(WHERE value=true),count(*) FILTER(WHERE value=false) INTO yes_count,no_count FROM public.knowledge_votes WHERE character_id=cid AND attribute_key=attr;
  SELECT value,independent_votes INTO old_value,old_votes FROM public.knowledge_claims WHERE character_id=cid AND attribute_key=attr AND status='verified' ORDER BY independent_votes DESC LIMIT 1;
  IF yes_count>0 AND no_count>0 THEN state:='disputed';
  ELSIF old_value IS NOT NULL AND ((old_value=true AND no_count>0) OR (old_value=false AND yes_count>0)) THEN state:='disputed';
  ELSIF old_value IS NOT NULL THEN state:='verified';
  ELSIF greatest(yes_count,no_count)>=3 THEN state:='verified'; ELSE state:='proposed'; END IF;
  SELECT value INTO latest_val FROM public.knowledge_votes WHERE character_id=cid AND attribute_key=attr ORDER BY updated_at DESC LIMIT 1;
  DELETE FROM public.knowledge_claims WHERE character_id=cid AND attribute_key=attr;
  IF yes_count+no_count>0 THEN INSERT INTO public.knowledge_claims(character_id,attribute_key,value,status,source_type,source_note,independent_votes) VALUES(cid,attr,CASE WHEN state='verified' AND old_value IS NOT NULL THEN old_value ELSE COALESCE(latest_val,val) END,state,'player',CASE WHEN state='disputed' THEN 'Hay respuestas contradictorias; no usar como hecho.' ELSE 'Consenso por dispositivos anónimos; identidad no verificada.' END,CASE WHEN state='verified' AND old_value IS NOT NULL THEN greatest(COALESCE(old_votes,0),CASE WHEN old_value THEN yes_count ELSE no_count END) ELSE greatest(yes_count,no_count) END); END IF;
  IF (SELECT status FROM public.characters WHERE id=cid)='candidate' AND (SELECT count(DISTINCT device_hash) FROM public.knowledge_votes WHERE character_id=cid)>=3 THEN UPDATE public.characters SET status='active' WHERE id=cid AND status='candidate'; END IF;
 END LOOP;
 RETURN jsonb_build_object('ok',true,'saved',saved_count,'createdCharacters',created_count);
END; $$;
REVOKE ALL ON FUNCTION public.submit_knowledge_batch(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_knowledge_batch(jsonb) TO service_role;
