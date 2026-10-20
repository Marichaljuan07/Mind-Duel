Mind Duel Fusion 3.12.22

Cambios:
- Panel de secuencia más compacto en móvil. La sugerencia grande queda oculta en online; se conserva la lectura de la pregunta y el estado de espera.
- El contador del Descubridor cuenta preguntas enviadas. El contador del Cerebro cuenta respuestas enviadas: son independientes y asíncronos.
- Si la conexión se cierra, aparece un aviso y una opción para reintentar conexión usando el identificador del rival conocido. Al abrirse de nuevo, se comparte estado básico (inicio, contadores e intentos).

Limitación: la reconexión requiere que la instancia Peer del otro dispositivo siga activa y que su conexión PeerJS esté disponible. Si Android cerró la página o se destruyó el Peer, puede ser necesario crear una sala nueva y volver a unir ambos dispositivos. El progreso guardado localmente no puede por sí solo restablecer una conexión destruida.
