import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField } from '@mui/material';
import { Button } from '@mui/material';
import { Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';

interface Empleado {
  id: number;
  nombre: string;
  puesto: string;
  salario: number;
}

const API_URL = 'http://localhost:3000/api/empleados'; // Asegúrate de que la URL del API es correcta

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch empleados al cargar el componente
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Error HTTP! status: ${response.status}`);
        }
        const data = await response.json();
        setEmpleados(data);
      } catch (error) {
        console.error('Error al cargar los empleados:', error);
      }
    };
    fetchEmpleados();
  }, []);

  // Agregar empleado
  const handleAddEmpleado = async (newEmpleado: Omit<Empleado, 'id'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmpleado),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      const addedEmpleado = await response.json();
      setEmpleados([...empleados, addedEmpleado]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al agregar empleado:', error);
    }
  };

  // Actualizar empleado
  const handleUpdateEmpleado = async (updatedEmpleado: Empleado) => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmpleado),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      const updatedData = await response.json();
      setEmpleados(
        empleados.map((empleado) =>
          empleado.id === updatedEmpleado.id ? updatedData : empleado
        )
      );
      setEditingEmpleado(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
    }
  };

  // Eliminar empleado
  const handleDeleteEmpleado = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error HTTP! status: ${response.status}`);
      }
      setEmpleados(empleados.filter((empleado) => empleado.id !== id));
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
    }
  };

  // Filtrar empleados según el término de búsqueda
  const filteredEmpleados = empleados.filter((empleado) =>
    Object.values(empleado).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  


  return (
    <div className="">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Typography variant="h5">Gestión de Empleados</Typography>
          <Typography variant="body2" color="textSecondary">Administra la información de los empleados del restaurante</Typography>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <TextField
              label="Buscar empleados..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm"
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#FF5722',  // Color naranja fuerte
                '&:hover': {
                  backgroundColor: '#E64A19', // Color naranja más oscuro al pasar el mouse
                },
              }}
              onClick={() => setIsDialogOpen(true)}
            >
              Agregar Empleado
            </Button>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Puesto</TableCell>
                <TableCell>Salario</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmpleados.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell>{empleado.id}</TableCell>
                  <TableCell>{empleado.nombre}</TableCell>
                  <TableCell>{empleado.puesto}</TableCell>
                  <TableCell>${empleado.salario}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        sx={{
                          color: '#FF5722', // Color naranja fuerte para el texto
                          borderColor: '#FF5722',
                          '&:hover': {
                            backgroundColor: '#FF5722',
                            color: 'white',
                          },
                        }}
                        onClick={() => {
                          setEditingEmpleado(empleado);
                          setIsDialogOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{
                          backgroundColor: '#FF5722',  // Color naranja fuerte
                          '&:hover': {
                            backgroundColor: '#E64A19', // Naranja oscuro al pasar el mouse
                          },
                        }}
                        onClick={() => handleDeleteEmpleado(empleado.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {editingEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editingEmpleado
              ? 'Modifica la información del empleado.'
              : 'Completa los datos para agregar un nuevo empleado.'}
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const empleadoData = {
                nombre: formData.get('nombre') as string,
                puesto: formData.get('puesto') as string,
                salario: parseFloat(formData.get('salario') as string),
              };
              if (editingEmpleado) {
                handleUpdateEmpleado({ ...empleadoData, id: editingEmpleado.id });
              } else {
                handleAddEmpleado(empleadoData);
              }
            }}
          >
            <TextField
              name="nombre"
              label="Nombre"
              defaultValue={editingEmpleado?.nombre}
              fullWidth
              required
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': { color: '#FF5722' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#FF5722',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF5722',
                  },
                },
              }}
            />
            <TextField
              name="puesto"
              label="Puesto"
              defaultValue={editingEmpleado?.puesto}
              fullWidth
              required
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': { color: '#FF5722' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#FF5722',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF5722',
                  },
                },
              }}
            />
            <TextField
              name="salario"
              label="Salario"
              type="number"
              defaultValue={editingEmpleado?.salario}
              fullWidth
              required
              margin="normal"
              sx={{
                '& .MuiInputLabel-root': { color: '#FF5722' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#FF5722',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF5722',
                  },
                },
              }}
            />
            <DialogActions>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#FF5722', // Naranja fuerte
                  '&:hover': {
                    backgroundColor: '#E64A19', // Naranja más oscuro
                  },
                }}
              >
                {editingEmpleado ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} color="secondary">
                Cancelar
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
