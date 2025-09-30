import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './logo.jpg'; // Asegúrate de que tu logo esté en la carpeta src
import NotificationManager from './NotificationManager';


function App() {
  const [activeTab, setActiveTab] = useState('externo');
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([
    // { id: 1, numero: 1, estado: 'disponible', tipo: null, pedidoActual: null },
    // { id: 2, numero: 2, estado: 'disponible', tipo: null, pedidoActual: null },
    // { id: 3, numero: 3, estado: 'disponible', tipo: null, pedidoActual: null },
    // { id: 4, numero: 4, estado: 'disponible', tipo: null, pedidoActual: null },
  ]);
  const [productos, setProductos] = useState([]);

  // En producción, la API estará en la misma URL, bajo la ruta /api
  // En desarrollo, podemos usar un proxy o mantener la URL completa.
  // En producción, la API estará en la misma URL, bajo la ruta /api
  // En desarrollo, podemos usar un proxy o mantener la URL completa.
  const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'  // Si pruebas localmente con un servidor
    : '/api';  // En producción en Vercel

  const fetchData = useCallback(async () => {
    try {
      const [productosRes, mesasRes, pedidosRes] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/mesas`),
        fetch(`${API_URL}/pedidos`),
      ]);

      // Verificar si las respuestas son exitosas y lanzar un error si no lo son
      if (!productosRes.ok) {
        throw new Error(`Error al obtener productos: ${productosRes.status} ${productosRes.statusText}`);
      }
      if (!mesasRes.ok) {
        throw new Error(`Error al obtener mesas: ${mesasRes.status} ${mesasRes.statusText}`);
      }
      if (!pedidosRes.ok) {
        throw new Error(`Error al obtener pedidos: ${pedidosRes.status} ${pedidosRes.statusText}`);
      }

      const productosData = await productosRes.json();
      const mesasData = await mesasRes.json();
      const pedidosData = await pedidosRes.json();

      // Asegurarnos de que siempre asignamos un array
      setProductos(productosData?.data || []);
      setMesas(mesasData?.data || []);
      setPedidos(pedidosData?.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      // Inicializar con arrays vacíos para evitar errores en la UI si la carga inicial falla
      setProductos([]);
      setMesas([]);
      setPedidos([]);

      // Mostrar una alerta más útil al usuario en el entorno de desarrollo
      if (process.env.NODE_ENV === 'development') {
        alert(`Error cargando datos: ${error.message}. Revisa la consola del navegador (F12) y la terminal de tu servidor backend para más detalles.`);
      }
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <NotificationManager pedidos={pedidos} />

      <main className="flex-1 pt-20 pb-24 px-4 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'externo' && (
            <motion.div
              key="externo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PedidoExterno productos={productos} onPedidoConfirmado={fetchData} API_URL={API_URL} />
            </motion.div>
          )}

          {activeTab === 'interno' && (
            <motion.div
              key="interno"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PedidoInterno productos={productos} mesas={mesas} setMesas={setMesas} onPedidoFinalizado={fetchData} API_URL={API_URL} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel productos={productos} setProductos={setProductos} pedidos={pedidos} mesas={mesas} onDataChange={fetchData} API_URL={API_URL} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const Header = ({ activeTab, setActiveTab }) => {
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setFecha(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src={logo} alt="Logo de Carnitas El Güero" className="w-10 h-10 mr-3" />
        <div>
          <h1 className="font-bold text-lg">Carnitas El Güero</h1>
          <p className="text-sm text-gray-500">{formatDate(fecha)}</p>
        </div>
      </div>
    </header>
  );
};

const TabBar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
      <button
        className={`flex flex-col items-center ${activeTab === 'externo' ? 'text-orange-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('externo')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">Externo</span>
      </button>

      <button
        className={`flex flex-col items-center ${activeTab === 'interno' ? 'text-orange-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('interno')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-xs mt-1">Interno</span>
      </button>

      <button
        className={`flex flex-col items-center ${activeTab === 'admin' ? 'text-orange-500' : 'text-gray-500'}`}
        onClick={() => setActiveTab('admin')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs mt-1">Admin</span>
      </button>
    </nav>
  );
};

const GroupedProductSelector = ({ categoria, productos, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(productos.length > 0 ? productos[0].id : '');

  const handleAgregar = () => {
    const productoSeleccionado = productos.find(p => p.id === parseInt(selectedProductId));
    if (productoSeleccionado) {
      onAgregar(productoSeleccionado, cantidad, null, null); // tipo y conVerdura no aplican aquí
      setCantidad(1);
    }
  };

  if (productos.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">{categoria}</h4>
          <p className="text-orange-500 font-bold">
            ${productos.find(p => p.id === parseInt(selectedProductId))?.precio || 0}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            -
          </button>
          <span className="w-10 text-center font-medium">{cantidad}</span>
          <button
            onClick={() => setCantidad(cantidad + 1)}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Opción:</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {productos.map(producto => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAgregar}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
      >
        Agregar al pedido
      </button>
    </div>
  );
};

const PedidoExterno = ({ productos, onPedidoConfirmado, API_URL }) => {
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    tipoEntrega: 'recoger'
  });
  const [carrito, setCarrito] = useState([]);
  const [horaEntrega, setHoraEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [pagoCon, setPagoCon] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showResumen, setShowResumen] = useState(false);
  const [cobrarEnvio, setCobrarEnvio] = useState(false);
  const [costoEnvio, setCostoEnvio] = useState('');

  const agregarAlCarrito = (producto, cantidad, tipo, conVerdura) => {
    if (cantidad <= 0) return;

    const nuevoItem = {
      id: Date.now(),
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      tipo: producto.tipos ? tipo : null,
      conVerdura: producto.categoria === 'taco' || producto.categoria === 'torta' ? conVerdura : null
    };

    setCarrito([...carrito, nuevoItem]);
  };

  const calcularTotal = () => {
    const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const envio = cobrarEnvio && costoEnvio ? parseFloat(costoEnvio) : 0;
    return totalCarrito + envio;
  };

  const calcularCambio = () => {
    if (metodoPago !== 'efectivo' || !pagoCon) return 0;
    return parseFloat(pagoCon) - calcularTotal();
  };

  const confirmarPedido = async () => {
    const nuevoPedidoData = {
      id: Date.now(),
      tipo: 'externo',
      cliente,
      items: carrito,
      total: calcularTotal(),
      costoEnvio: cobrarEnvio && costoEnvio ? parseFloat(costoEnvio) : null,
      horaEntrega,
      metodoPago,
      pagoCon: metodoPago === 'efectivo' ? parseFloat(pagoCon) : null,
      cambio: calcularCambio(),
      observaciones,
      estado: 'pendiente',
      fecha: new Date() // La fecha del pedido es siempre "ahora"
    };

    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoPedidoData),
      });
      if (!response.ok) throw new Error('Network response was not ok');

      // Resetear formulario y actualizar lista de pedidos
      onPedidoConfirmado();
      setCarrito([]);
      setCliente({ nombre: '', telefono: '', direccion: '', tipoEntrega: 'recoger' });
      setHoraEntrega('');
      setMetodoPago('efectivo');
      setPagoCon('');
      setObservaciones('');
      setCobrarEnvio(false);
      setCostoEnvio('');
      setShowResumen(false);
    } catch (error) {
      console.error('Error al confirmar el pedido:', error);
      alert('Hubo un error al confirmar el pedido.');
    }
    alert('¡Pedido confirmado con éxito!');
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">Pedido para Llevar/Domicilio</h2>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Información del Cliente</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={cliente.telefono}
              onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Número de teléfono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de entrega</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={cliente.tipoEntrega === 'recoger'}
                  onChange={() => setCliente({ ...cliente, tipoEntrega: 'recoger' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2">Para recoger</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={cliente.tipoEntrega === 'domicilio'}
                  onChange={() => setCliente({ ...cliente, tipoEntrega: 'domicilio' })}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2">Domicilio</span>
              </label>
            </div>
          </div>

          {cliente.tipoEntrega === 'domicilio' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={cliente.direccion}
                onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="Dirección completa"
              />
            </div>
          )}

          {cliente.tipoEntrega === 'domicilio' && (
            <div className="space-y-3 mt-3">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cobrarEnvio}
                    onChange={(e) => setCobrarEnvio(e.target.checked)}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Cobrar envío</span>
                </label>
              </div>
              {cobrarEnvio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo de envío</label>
                  <input
                    type="number"
                    value={costoEnvio}
                    onChange={(e) => setCostoEnvio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    placeholder="$"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Productos</h3>

        <div className="space-y-4">
          {productos.filter(p => p.categoria === 'taco' || p.categoria === 'torta').map(producto => (
            <ProductoSelector
              key={producto.id}
              producto={producto}
              onAgregar={agregarAlCarrito}
            />
          ))}
          <GroupedProductSelector
            categoria="Carnitas por Kilo"
            productos={productos.filter(p => p.categoria === 'carnitas')}
            onAgregar={agregarAlCarrito}
          />
          <GroupedProductSelector
            categoria="Bebidas"
            productos={productos.filter(p => p.categoria === 'bebida')}
            onAgregar={agregarAlCarrito}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Detalles de Entrega</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora deseada</label>
            <input
              type="datetime-local"
              value={horaEntrega}
              onChange={(e) => setHoraEntrega(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {metodoPago === 'efectivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Con cuánto paga?</label>
              <input
                type="number"
                value={pagoCon}
                onChange={(e) => setPagoCon(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder="$"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              placeholder="Instrucciones especiales para la preparación o entrega"
            />
          </div>
        </div>
      </div>

      {carrito.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{carrito.length} producto(s) en el carrito</p>
              <p className="text-orange-500 font-bold">Total: ${calcularTotal()}</p>
            </div>
            <button
              onClick={() => setShowResumen(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Ver Resumen
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showResumen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResumen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-orange-500">Resumen del Pedido</h3>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Cliente:</h4>
                <p>{cliente.nombre} - {cliente.telefono}</p>
                {cliente.tipoEntrega === 'domicilio' && <p>{cliente.direccion}</p>}
                <p className="capitalize">{cliente.tipoEntrega}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Productos:</h4>
                <ul className="space-y-2">
                  {carrito.map(item => (
                    <li key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.cantidad}x {item.nombre}</span>
                        {item.tipo && <span className="text-sm text-gray-500"> ({item.tipo})</span>}
                        {item.conVerdura !== null && (
                          <span className="text-sm text-gray-500"> - {item.conVerdura ? 'Con verdura' : 'Sin verdura'}</span>
                        )}
                      </div>
                      <span>${item.precio * item.cantidad}</span>
                    </li>
                  ))}
                </ul>
                {cobrarEnvio && costoEnvio > 0 && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium">Costo de envío</span>
                    <span>${parseFloat(costoEnvio)}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Detalles:</h4>
                <p>
                  Hora de entrega: {horaEntrega
                    ? new Date(horaEntrega).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                    : 'Lo antes posible'}
                </p>
                <p>Pago: {metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</p>
                {metodoPago === 'efectivo' && pagoCon && (
                  <p>Cambio: ${calcularCambio()}</p>
                )}
                {observaciones && (
                  <p className="mt-2">Observaciones: {observaciones}</p>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${calcularTotal()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResumen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold"
                >
                  Modificar
                </button>
                <button
                  onClick={confirmarPedido}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductoSelector = ({ producto, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(producto.tipos ? producto.tipos[0] : '');
  const [conVerdura, setConVerdura] = useState(true);

  const handleAgregar = () => {
    onAgregar(producto, cantidad, tipoSeleccionado, conVerdura);
    setCantidad(1);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">{producto.nombre}</h4>
          <p className="text-orange-500 font-bold">${producto.precio}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            -
          </button>
          <span className="w-10 text-center font-medium">{cantidad}</span>
          <button
            onClick={() => setCantidad(cantidad + 1)}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {producto.tipos && (
        <div className="mb-2">
          <label className="block text-sm text-gray-600 mb-1">Tipo:</label>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {producto.tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      )}

      {(producto.categoria === 'taco' || producto.categoria === 'torta') && (
        <div className="flex items-center mb-3">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={conVerdura}
              onChange={(e) => setConVerdura(e.target.checked)}
              className="text-orange-500 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm">Con verdura (cebolla, cilantro)</span>
          </label>
        </div>
      )}

      <button
        onClick={handleAgregar}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
      >
        Agregar al pedido
      </button>
    </div>
  );
};

const PedidoInterno = ({ productos, mesas, setMesas, onPedidoFinalizado, API_URL }) => {
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [showResumen, setShowResumen] = useState(false);

  const seleccionarMesa = async (mesa) => {
    if (mesa.estado === 'disponible') {
      try {
        // Actualizar la mesa en el backend
        const response = await fetch(`${API_URL}/mesas?id=${mesa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estado: 'ocupada',
            pedidoActual: 'activo'
          })
        });

        if (!response.ok) throw new Error('Error al actualizar mesa');

        // Actualizar el estado local
        setMesaSeleccionada(mesa.id);
        setMesas(mesas.map(m =>
          m.id === mesa.id ? { ...m, estado: 'ocupada', pedidoActual: 'activo' } : m
        ));
      } catch (error) {
        console.error('Error al seleccionar mesa:', error);
        alert('Error al seleccionar la mesa');
      }
    } else {
      setMesaSeleccionada(mesa.id);
    }
  };

  const agregarAlCarrito = (producto, cantidad, tipo, conVerdura) => {
    if (cantidad <= 0) return;

    const nuevoItem = {
      id: Date.now(),
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      tipo: producto.tipos ? tipo : null,
      conVerdura: producto.categoria === 'taco' || producto.categoria === 'torta' ? conVerdura : null
    };

    setCarrito([...carrito, nuevoItem]);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const finalizarPedido = async () => {
    if (!mesaSeleccionada || carrito.length === 0) return;

    const nuevoPedidoData = {
      id: Date.now(),
      tipo: 'interno',
      mesaId: mesaSeleccionada, // ← Asegúrate que esto sea el ID correcto
      items: carrito,
      total: calcularTotal(),
      estado: 'pendiente',
      fecha: new Date(),
      cliente: null,
      horaEntrega: null,
      metodoPago: null,
      pagoCon: null,
      cambio: null,
      observaciones: null,
    };

    console.log('📦 Enviando pedido interno:', nuevoPedidoData); // ← Agrega este log

    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPedidoData),
      });
      if (!response.ok) throw new Error('Error al registrar el pedido');

      onPedidoFinalizado(); // Recarga todos los datos
      setCarrito([]);
      setShowResumen(false); // Cierra el modal de resumen
    } catch (error) {
      console.error('Error al finalizar pedido:', error);
      alert('Hubo un error al registrar el pedido para la mesa.');
    }

    alert('Pedido registrado para la mesa');
  };

  const liberarMesa = async () => {
    try {
      // Actualizar la mesa en el backend
      const response = await fetch(`${API_URL}/mesas?id=${mesaSeleccionada}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'disponible',
          pedidoActual: null
        })
      });

      if (!response.ok) throw new Error('Error al liberar mesa');

      // Actualizar el estado local
      setMesas(mesas.map(m =>
        m.id === mesaSeleccionada ? { ...m, estado: 'disponible', pedidoActual: null } : m
      ));
      setMesaSeleccionada(null);
      setCarrito([]);
    } catch (error) {
      console.error('Error al liberar mesa:', error);
      alert('Error al liberar la mesa');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">Pedidos Internos</h2>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Mesas</h3>

        <div className="grid grid-cols-2 gap-3">
          {mesas.map(mesa => (
            <div
              key={mesa.id}
              onClick={() => seleccionarMesa(mesa)}
              className={`p-4 rounded-lg border-2 text-center cursor-pointer ${mesaSeleccionada === mesa.id
                ? 'border-orange-500 bg-orange-50'
                : mesa.estado === 'ocupada'
                  ? 'border-red-500 bg-red-50'
                  : 'border-green-500 bg-green-50'
                }`}
            >
              <div className="text-lg font-bold">Mesa {mesa.numero}</div>
              <div className="text-sm capitalize">
                {mesa.estado === 'disponible' ? 'Disponible' : 'Ocupada'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {mesaSeleccionada && (
        <>
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="font-semibold mb-3 text-gray-800">Productos para Mesa {mesas.find(m => m.id === mesaSeleccionada).numero}</h3>

            <div className="space-y-4">
              {productos.filter(p => p.categoria === 'taco' || p.categoria === 'torta').map(producto => (
                <ProductoSelector
                  key={producto.id}
                  producto={producto}
                  onAgregar={agregarAlCarrito}
                />
              ))}
              <GroupedProductSelector
                categoria="Carnitas por Kilo"
                productos={productos.filter(p => p.categoria === 'carnitas')}
                onAgregar={agregarAlCarrito}
              />
              <GroupedProductSelector
                categoria="Bebidas"
                productos={productos.filter(p => p.categoria === 'bebida')}
                onAgregar={agregarAlCarrito}
              />
            </div>
          </div>

          {carrito.length > 0 && !showResumen && (
            <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="flex justify-between items-center max-w-md mx-auto">
                <div>
                  <p className="font-semibold">{carrito.length} producto(s) en el carrito</p>
                  <p className="text-orange-500 font-bold">Total: ${calcularTotal()}</p>
                </div>
                <button
                  onClick={() => setShowResumen(true)}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Ver Resumen
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showResumen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowResumen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4 text-orange-500">Resumen de la Mesa</h3>
                  <ul className="space-y-2 mb-4">
                    {carrito.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.cantidad}x {item.nombre}</span>
                          {item.tipo && <span className="text-sm text-gray-500"> ({item.tipo})</span>}
                          {item.conVerdura !== null && (
                            <span className="text-sm text-gray-500"> - {item.conVerdura ? 'Con verdura' : 'Sin verdura'}</span>
                          )}
                        </div>
                        <span>${item.precio * item.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span>${calcularTotal()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setShowResumen(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold">Modificar</button>
                    <button onClick={finalizarPedido} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold">Finalizar Pedido</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={liberarMesa}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold"
            >
              Liberar Mesa
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const AdminPanel = ({ productos, setProductos, pedidos, mesas, onDataChange, API_URL }) => {
  console.log('📊 Pedidos:', pedidos);
  console.log('🍽️ Mesas:', mesas);
  const [filtroPedidos, setFiltroPedidos] = useState('todos');
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [editedProductData, setEditedProductData] = useState({ nombre: '', precio: '' });
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    categoria: 'taco',
    tipos: '',
    disponible: true
  });

  const pedidosFiltrados = filtroPedidos === 'todos'
    ? pedidos
    : pedidos.filter(p => p.tipo === filtroPedidos);

  const handleEditClick = (producto) => {
    setEditingProductId(producto.id);
    setEditedProductData({ nombre: producto.nombre, precio: producto.precio });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditedProductData({ nombre: '', precio: '' });
  };

  const handleSaveEdit = async (id) => {
    const productoOriginal = productos.find(p => p.id === id);
    const updatedProduct = {
      ...productoOriginal,
      nombre: editedProductData.nombre,
      precio: parseFloat(editedProductData.precio)
    };

    try {
      await fetch(`${API_URL}/productos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      onDataChange(); // Recargar datos
      handleCancelEdit();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert('Error al guardar el producto. Revisa la consola para más detalles.');
    }
  };

  const toggleDisponibilidad = async (id) => {

    const producto = productos.find(p => p.id === id);

    const updatedProduct = { ...producto, disponible: !producto.disponible };

    try {
      await fetch(`${API_URL}/productos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      onDataChange(); // Recargar datos
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      alert('Error al cambiar la disponibilidad. Revisa la consola para más detalles.');
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.nombre || !newProduct.precio || !newProduct.categoria) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    // El backend se encargará del ID
    const productoACrear = { ...newProduct, precio: parseFloat(newProduct.precio) };

    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoACrear),
      });
      if (!response.ok) throw new Error('Error al crear producto');

      onDataChange(); // Recargar datos
      setNewProduct({ nombre: '', precio: '', categoria: 'taco', tipos: '', disponible: true }); // Reset form
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert('Hubo un error al crear el producto.');
    }


    alert('¡Producto creado con éxito!');
  };

  const cambiarEstadoPedido = async (e, id, nuevoEstado) => {
    e.stopPropagation();
    console.log('🔧 Cambiando estado del pedido:', { id, nuevoEstado });

    try {
      // Usar query parameter como espera el backend
      const response = await fetch(`${API_URL}/pedidos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Estado cambiado exitosamente:', result);

      onDataChange(); // Recargar datos

    } catch (error) {
      console.error("❌ Error al cambiar el estado del pedido:", error);
      alert('Error al actualizar el estado. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">Panel de Administración</h2>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Control de Pedidos</h3>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFiltroPedidos('todos')}
            className={`px-3 py-1 text-sm rounded-full ${filtroPedidos === 'todos' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroPedidos('externo')}
            className={`px-3 py-1 text-sm rounded-full ${filtroPedidos === 'externo' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            Externos
          </button>
          <button
            onClick={() => setFiltroPedidos('interno')}
            className={`px-3 py-1 text-sm rounded-full ${filtroPedidos === 'interno' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            Internos
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {pedidosFiltrados.map(pedido => (
            <div
              key={pedido.id}
              className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedPedido(pedido)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">
                    {pedido.tipo === 'externo' ? 'Pedido Externo' : `Mesa ${mesas.find(m => m.id === pedido.mesaid)?.numero || 'N/A'}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {pedido.hora_entrega ?
                      new Date(pedido.hora_entrega).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      }) :
                      new Date(pedido.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                    }
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${pedido.estado === 'entregado'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
                  }`}>
                  {pedido.estado}
                </span>
              </div>

              <div className="text-sm mb-2">
                {pedido.tipo === 'externo' && (
                  <p>{pedido.cliente.nombre} - {pedido.cliente.telefono}</p>
                )}
                <p>{pedido.items.length} producto(s) - ${pedido.total}</p>
              </div>

              <div className="flex space-x-2">
                <select
                  value={pedido.estado}
                  onChange={(e) => cambiarEstadoPedido(e, pedido.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()} // ← Esta línea resuelve el problema
                  className="text-xs p-1 border rounded"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="preparacion">En preparación</option>
                  <option value="listo">Listo</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </div>
          ))}

          {pedidosFiltrados.length === 0 && (
            <p className="text-center text-gray-500 py-4">No hay pedidos</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Gestión de Mesas</h3>

        <div className="grid grid-cols-2 gap-3">
          {mesas.map(mesa => (
            <div
              key={mesa.id}
              className={`p-3 rounded-lg border text-center ${mesa.estado === 'ocupada'
                ? 'border-red-500 bg-red-50'
                : 'border-green-500 bg-green-50'
                }`}
            >
              <div className="font-bold">Mesa {mesa.numero}</div>
              <div className="text-sm capitalize">{mesa.estado}</div>
              {mesa.pedidoActual && (
                <div className="text-xs mt-1 text-orange-600">Con pedido activo</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Crear Nuevo Producto</h3>
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="nombre" value={newProduct.nombre} onChange={handleNewProductChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" name="precio" value={newProduct.precio} onChange={handleNewProductChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select name="categoria" value={newProduct.categoria} onChange={handleNewProductChange} className="w-full p-2 border border-gray-300 rounded-lg">
                <option value="taco">Taco</option>
                <option value="carnitas">Carnitas</option>
                <option value="torta">Torta</option>
                <option value="bebida">Bebida</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipos (separados por coma)</label>
            <input type="text" name="tipos" value={newProduct.tipos} onChange={handleNewProductChange} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Ej: Maciza, Cuerito, Surtida" />
            <p className="text-xs text-gray-500 mt-1">Dejar en blanco si no aplica (ej. bebidas).</p>
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold">
            Crear Producto
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-800">Gestión de Menú</h3>

        <div className="space-y-3">
          {productos.map(producto =>
            editingProductId === producto.id ? (
              <div key={producto.id} className="p-3 border border-orange-300 rounded-lg bg-orange-50">
                <div className="flex items-center mb-2">
                  <input type="text" value={editedProductData.nombre} onChange={(e) => setEditedProductData({ ...editedProductData, nombre: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-center mb-3">
                  <span className="mr-2">$</span>
                  <input type="number" value={editedProductData.precio} onChange={(e) => setEditedProductData({ ...editedProductData, precio: e.target.value })} className="w-24 p-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleSaveEdit(producto.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold">Guardar</button>
                  <button onClick={handleCancelEdit} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold">Cancelar</button>
                </div>
              </div>
            ) : (
              <div key={producto.id} className="flex justify-between items-center p-2 border-b border-gray-100">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleDisponibilidad(producto.id)}
                    className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 ${producto.disponible ? 'bg-green-500' : 'bg-red-500'}`}
                    aria-label={`Marcar ${producto.nombre} como ${producto.disponible ? 'no disponible' : 'disponible'}`}
                  ></button>
                  <span className={!producto.disponible ? 'line-through text-gray-400' : ''}>
                    {producto.nombre}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span>${producto.precio}</span>
                  <button onClick={() => handleEditClick(producto)} className="text-sm text-blue-600 hover:underline">Editar</button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPedido && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPedido(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-orange-500">Resumen del Pedido</h3>

              {selectedPedido.tipo === 'externo' && selectedPedido.cliente && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Cliente:</h4>
                  <p>{selectedPedido.cliente.nombre} - {selectedPedido.cliente.telefono}</p>
                  {selectedPedido.cliente.tipoEntrega === 'domicilio' && <p>{selectedPedido.cliente.direccion}</p>}
                  <p className="capitalize">{selectedPedido.cliente.tipoEntrega}</p>
                </div>
              )}

              {selectedPedido.tipo === 'interno' && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Mesa:</h4>
                  {/* Cambia mesaId por mesaid */}
                  <p>Mesa {mesas.find(m => m.id === selectedPedido.mesaid)?.numero}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Productos:</h4>
                <ul className="space-y-2">
                  {selectedPedido.items.map(item => (
                    <li key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.cantidad}x {item.nombre}</span>
                        {item.tipo && <span className="text-sm text-gray-500"> ({item.tipo})</span>}
                        {item.conVerdura !== null && (
                          <span className="text-sm text-gray-500"> - {item.conVerdura ? 'Con verdura' : 'Sin verdura'}</span>
                        )}
                      </div>
                      <span>${item.precio * item.cantidad}</span>
                    </li>
                  ))}
                </ul>
                {selectedPedido.costo_envio > 0 && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-medium">Costo de envío</span>
                    <span>${parseFloat(selectedPedido.costo_envio)}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Detalles:</h4>
                {selectedPedido.hora_entrega ? (
                  <p>Hora de entrega: {new Date(selectedPedido.hora_entrega).toLocaleString('es-MX', {
                    dateStyle: 'short', timeStyle: 'short'
                  })}</p>
                ) : (
                  <p>Fecha del pedido: {new Date(selectedPedido.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</p>
                )}
                {selectedPedido.metodo_pago && <p>Método de Pago: {selectedPedido.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}</p>}
                {selectedPedido.metodo_pago === 'efectivo' && selectedPedido.pago_con && (
                  <p>Paga con: ${selectedPedido.pago_con}</p>
                )}
                {selectedPedido.metodoPago === 'efectivo' && selectedPedido.cambio && (
                  <p>Cambio: ${selectedPedido.cambio}</p>
                )}
                {selectedPedido.observaciones && (
                  <p className="mt-2">Observaciones: {selectedPedido.observaciones}</p>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${selectedPedido.total}</span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};


export default App;
