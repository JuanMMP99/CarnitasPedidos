// src/NotificationManager.jsx
import { useEffect, useState, useRef } from 'react';

// Sonido de alerta (puedes cambiarlo por cualquier archivo de audio)
import notificationSound from './notification.mp3'; 

// El tiempo en minutos para que la alerta se dispare antes de la hora de entrega
const MINUTOS_ALERTA_PREVIA = 20;

function NotificationManager({ pedidos }) {
  const [permission, setPermission] = useState(Notification.permission);
  const audioRef = useRef(null);
  // Usamos una ref para evitar notificar múltiples veces por el mismo pedido
  const notifiedPedidosRef = useRef(new Set());

  // 1. Solicitar permiso para notificaciones cuando el componente se monta
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  // 2. Lógica principal que se ejecuta cada minuto para revisar los pedidos
  useEffect(() => {
    const checkPedidos = () => {
      if (permission !== 'granted') return;

      const ahora = new Date();
      const umbral = new Date(ahora.getTime() + MINUTOS_ALERTA_PREVIA * 60000);

      const pedidosParaNotificar = pedidos.filter(p => {
        // Filtrar solo pedidos externos, pendientes y con hora de entrega
        if (p.tipo !== 'externo' || p.estado !== 'pendiente' || !p.horaEntrega) {
          return false;
        }
        // Evitar notificar de nuevo si ya se hizo
        if (notifiedPedidosRef.current.has(p.id)) {
            return false;
        }

        const horaEntrega = new Date(p.horaEntrega);
        // Comprobar si la hora de entrega está dentro de nuestro umbral de tiempo
        return horaEntrega > ahora && horaEntrega <= umbral;
      });

      pedidosParaNotificar.forEach(pedido => {
        const minutosParaEntrega = Math.round((new Date(pedido.horaEntrega) - ahora) / 60000);
        const nombreCliente = pedido.cliente?.nombre || 'Cliente';
        
        // 3. Mostrar la notificación
        new Notification('¡Prepara un pedido!', {
          body: `El pedido de ${nombreCliente} se entrega en ${minutosParaEntrega} min.`,
          icon: '/logo.jpg' // Asegúrate que el logo esté en la carpeta `public`
        });
        
        // Reproducir sonido
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error("Error al reproducir sonido:", e));
        }

        // Marcar como notificado para no repetir
        notifiedPedidosRef.current.add(pedido.id);
      });
    };

    // Ejecutar la revisión cada 60 segundos
    const intervalId = setInterval(checkPedidos, 60000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [pedidos, permission]);

  return (
    // Elemento de audio para reproducir el sonido de notificación
    <audio ref={audioRef} src={notificationSound} preload="auto"></audio>
  );
}

export default NotificationManager;
