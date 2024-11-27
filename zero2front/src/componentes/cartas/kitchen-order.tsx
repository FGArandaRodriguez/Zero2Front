import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  Badge,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Clock, CheckCircle2, Coffee, Utensils } from 'lucide-react';

interface OrdenesCocina {
  id_ordenes_cocina: number;
  cantidad: number;
  estado: 'pending' | 'preparing' | 'ready';
  menu: Menu[];
  pedidos: Pedido[];
}

interface Menu {
  id_menu: number;
  nombre: string;
  precio: number;
}

interface Pedido {
  id_pedidos: number;
  fecha: string;
  mesa: { numero_mesa: number };
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#EC8439',
    },
    background: {
      default: '#FAB677',
    },
  },
});

export default function Cocinaorden() {
  const [orders, setOrders] = useState<OrdenesCocina[] | null>(null);

  const estadoMap = useMemo(() => ({
    1: 'pending',
    2: 'preparing',
    3: 'ready',
  }), []); // Usamos useMemo para memorizar estadoMap y evitar que cambie en cada renderizado

  useEffect(() => {
    fetch('http://localhost:3000/api/ordenes_cocina')
      .then((response) => response.json())
      .then((data) => {
        // Mapeamos los datos de la API al formato esperado
        const mappedOrders = data.map((order: any, index: number) => ({
          id_ordenes_cocina: index + 1, // o cualquier otro identificador único
          cantidad: order.cantidad,
          estado: order.estado || 'pending', // Mapear el estado
          menu: [
            {
              id_menu: index + 1, // Asignar un ID único o real
              nombre: order.nombre_menu,
              precio: 10.0, // Precio estático o ajustado según lo que necesites
            },
          ],
          pedidos: [
            {
              id_pedidos: index + 1, // Asignar un ID único o real
              fecha: new Date().toLocaleString(), // Fecha actual o ajustada según sea necesario
              mesa: { numero_mesa: order.numero_mesa },
            },
          ],
        }));
        setOrders(mappedOrders);
      })
      .catch((err) => console.error(err));
  }, [estadoMap]); // No es necesario agregar otras dependencias porque estadoMap está memorizado

  const handleStatusChange = async (idOrden: number, nuevoEstado: OrdenesCocina['estado']) => {
    // Primero, actualizamos el estado localmente
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id_ordenes_cocina === idOrden ? { ...order, estado: nuevoEstado } : order
      )
    );

    // Ahora, hacemos la solicitud POST para actualizar el estado en la base de datos
    try {
      const response = await fetch('http://localhost:3000/api/ordenes_cocina', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_ordenes_cocina: idOrden,
          estado: nuevoEstado,
        }), // Enviamos el ID de la orden y el nuevo estado
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la orden en la base de datos');
      }

      const data = await response.json();
      console.log('Orden actualizada correctamente en la base de datos:', data);
    } catch (error) {
      console.error('Error al intentar actualizar el estado de la orden:', error);
      // Si ocurre un error, puedes revertir el estado local o manejar el error de alguna manera
    }
  };

  const getStatusIcon = (estado: OrdenesCocina['estado']) => {
    switch (estado) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'preparing':
        return <Coffee className="h-5 w-5 text-blue-500" />;
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (estado: OrdenesCocina['estado']) => {
    switch (estado) {
      case 'pending':
        return 'warning';
      case 'preparing':
        return 'info';
      case 'ready':
        return 'success';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: 4 }}>
        <Card sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
          <CardHeader
            title={
              <Typography variant="h5" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Utensils className="h-6 w-6" />
                Órdenes de Cocina
              </Typography>
            }
            subheader="Gestione las órdenes pendientes y en preparación"
          />
          <CardContent>
            {orders ? (
              orders.map((order) => (
                <Card key={order.id_ordenes_cocina} sx={{ mb: 2, backgroundColor: 'white' }}>
                  <CardHeader
                    title={`Mesa ${order.pedidos[0]?.mesa.numero_mesa || 'N/A'}`}
                    action={
                      <Badge color={getStatusColor(order.estado)} badgeContent={getStatusIcon(order.estado)} />
                    }
                  />
                  <CardContent>
                    {order.menu.map((item) => (
                      <Typography key={item.id_menu}>
                        {order.cantidad}x {item.nombre} - ${item.precio.toFixed(2)}
                      </Typography>
                    ))}
                  </CardContent>
                  <CardActions>
                    <Select
                      value={order.estado}
                      onChange={(e) => handleStatusChange(order.id_ordenes_cocina, e.target.value as OrdenesCocina['estado'])}
                      sx={{ width: 200 }}
                    >
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="preparing">Preparando</MenuItem>
                      <MenuItem value="ready">Lista</MenuItem>
                    </Select>
                    <Typography variant="caption" sx={{ ml: 'auto' }}>
                      Creada: {order.pedidos[0]?.fecha || 'N/A'}
                    </Typography>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography>Cargando órdenes...</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
