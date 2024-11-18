'use client'
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    ThemeProvider,
    createTheme,
    CssBaseline
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'

interface Empleado {
    id_empleado: number
    nombre: string
    puesto: string
    salario: number
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
})

const API_URL = 'http://localhost:3000/api/empleados'

export default function Component() {
    const [empleados, setEmpleados] = useState<Empleado[]>([])
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

    useEffect(() => {
        fetchEmpleados()
    }, [])

    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(API_URL);
            setEmpleados(response.data);
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al cargar los empleados', severity: 'error' });
        }
    };

    const handleAddEmpleado = async (newEmpleado: Omit<Empleado, 'id_empleado'>) => {
        try {
            const response = await axios.post(API_URL, newEmpleado);
            const addedEmpleado = response.data;
            setEmpleados([...empleados, addedEmpleado]);
            setIsDialogOpen(false);
            setSnackbar({ open: true, message: `${addedEmpleado.nombre} ha sido agregado exitosamente.`, severity: 'success' });
        } catch (error: any) {
            console.error('Error al agregar empleado:', error);
            setSnackbar({ open: true, message: 'Error al agregar el empleado', severity: 'error' });
        }
    };
    

    const handleUpdateEmpleado = async (updatedEmpleado: Empleado) => {
        try {
            const response = await axios.put(`${API_URL}/${updatedEmpleado.id_empleado}`, updatedEmpleado);
            const updatedData = response.data;
            setEmpleados(empleados.map(e => e.id_empleado === updatedData.id_empleado ? updatedData : e));
            setEditingEmpleado(null);
            setIsDialogOpen(false);
            setSnackbar({ open: true, message: `La información de ${updatedData.nombre} ha sido actualizada.`, severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al actualizar el empleado', severity: 'error' });
        }
    };

    const handleDeleteEmpleado = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setEmpleados(empleados.filter(e => e.id_empleado !== id));
            setSnackbar({ open: true, message: 'El empleado ha sido eliminado exitosamente.', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al eliminar el empleado', severity: 'error' });
        }
    };
    const filteredEmpleados = empleados.filter(empleado =>
        Object.values(empleado).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'background.default' }}>
                <Card sx={{ maxWidth: '4xl', mx: 'auto' }}>
                    <CardHeader
                        title={<Typography variant="h4" color="primary">Gestión de Empleados</Typography>}
                        subheader="Administre la información de los empleados del restaurante"
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <TextField
                                placeholder="Buscar empleados..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setEditingEmpleado(null)
                                    setIsDialogOpen(true)
                                }}
                            >
                                Agregar Empleado
                            </Button>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Puesto</TableCell>
                                        <TableCell>Salario</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredEmpleados.map((empleado) => (
                                        <TableRow key={empleado.id_empleado}>
                                            <TableCell>{empleado.id_empleado}</TableCell>
                                            <TableCell>{empleado.nombre}</TableCell>
                                            <TableCell>{empleado.puesto}</TableCell>
                                            <TableCell>${empleado.salario}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => {
                                                        setEditingEmpleado(empleado)
                                                        setIsDialogOpen(true)
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteEmpleado(empleado.id_empleado)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <DialogTitle>{editingEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {editingEmpleado ? 'Modifique la información del empleado aquí.' : 'Complete la información para agregar un nuevo empleado.'}
                    </DialogContentText>
                    <Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const empleadoData = {
                            nombre: formData.get('nombre') as string,
                            puesto: formData.get('puesto') as string,
                            salario: parseFloat(formData.get('salario') as string),
                        }
                        if (editingEmpleado) {
                            handleUpdateEmpleado({ ...empleadoData, id_empleado: editingEmpleado.id_empleado })
                        } else {
                            handleAddEmpleado(empleadoData)
                        }
                    }} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            defaultValue={editingEmpleado?.nombre}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Puesto"
                            name="puesto"
                            defaultValue={editingEmpleado?.puesto}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Salario"
                            name="salario"
                            type="number"
                            defaultValue={editingEmpleado?.salario}
                            fullWidth
                            required
                        />
                        <DialogActions>
                            <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="contained" color="primary">
                                {editingEmpleado ? 'Guardar Cambios' : 'Agregar Empleado'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </ThemeProvider>
    )
}