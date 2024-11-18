'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import * as material from '@mui/material'
import { AccessTime, CheckCircle, Restaurant } from '@mui/icons-material'

interface Order {
    id_ordenes_cocina: number
    id_pedidos: number
    id_menu: number
    cantidad: number
    estado: boolean
    createdAt: string
    menu_name?: string
    pedido_details?: string
}

const API_URL = '/api/orders'

const theme = material.createTheme({
    palette: {
        primary: {
            main: '#EC8439',
        },
        background: {
            default: '#FAB677',
        },
    },
})

// Nuevo componente para el Select de estado de la orden
function SelectEstadoOrden({ 
    idOrden, 
    estado, 
    onCambioEstado 
}: { 
    idOrden: number
    estado: boolean
    onCambioEstado: (idOrden: number, nuevoEstado: boolean) => void 
}) {
    const manejarCambio = (evento: material.SelectChangeEvent) => {
    onCambioEstado(idOrden, evento.target.value === 'true')
    }

    return (
    <material.Select
        value={estado ? 'true' : 'false'}
        onChange={manejarCambio}
        sx={{ width: 180 }}
    >
        <material.MenuItem value="false">Pendiente</material.MenuItem>
        <material.MenuItem value="true">Lista</material.MenuItem>
    </material.Select>
    )
}

export default function Cocina() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await axios.get<Order[]>(API_URL)
            setOrders(response.data)
        } catch (error) {
            console.error('Error al obtener las órdenes:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: number, newStatus: boolean) => {
        try {
            await axios.patch(`${API_URL}/${orderId}`, { estado: newStatus })
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id_ordenes_cocina === orderId ? { ...order, estado: newStatus } : order
                )
            )
        } catch (error) {
            console.error(`Error al actualizar el estado de la orden ${orderId}:`, error)
        }
    }

    const getStatusIcon = (status: boolean) => {
        return status ? <CheckCircle sx={{ color: 'success.main' }} /> : <AccessTime sx={{ color: 'warning.main' }} />
    }

    const getStatusColor = (status: boolean) => {
        return status ? 'success' : 'warning'
    }

    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <material.ThemeProvider theme={theme}>
            <material.CssBaseline />
            <material.Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'background.default' }}>
                <material.Card sx={{ maxWidth: '4xl', mx: 'auto' }}>
                    <material.CardHeader
                        title={
                            <material.Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Restaurant />
                                Órdenes de Cocina
                            </material.Typography>
                        }
                        subheader="Gestione las órdenes según el estado actual"
                    />
                    <material.CardContent>
                        {loading ? (
                            <material.CircularProgress />
                        ) : (
                            <material.Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                {orders.map(order => (
                                    <material.Card key={order.id_ordenes_cocina} sx={{ mb: 2 }}>
                                        <material.CardHeader
                                            title={`Pedido: ${order.id_pedidos}`}
                                            subheader={`Menú: ${order.menu_name || 'Desconocido'}`}
                                            action={
                                                <material.Chip
                                                    icon={getStatusIcon(order.estado)}
                                                    label={order.estado ? 'Lista' : 'Pendiente'}
                                                    color={getStatusColor(order.estado)}
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            }
                                        />
                                        <material.CardContent>
                                            <material.Typography>Cantidad: {order.cantidad}</material.Typography>
                                            <material.Typography variant="body2" color="text.secondary">
                                                {order.pedido_details || ''}
                                            </material.Typography>
                                            <material.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                <material.Typography variant="body2" color="text.secondary">
                                                    Creada: {new Date(order.createdAt).toLocaleTimeString()}
                                                </material.Typography>
                                                <SelectEstadoOrden
                                                    idOrden={order.id_ordenes_cocina}
                                                    estado={order.estado}
                                                    onCambioEstado={updateOrderStatus}
                                                />
                                            </material.Box>
                                        </material.CardContent>
                                    </material.Card>
                                ))}
                            </material.Box>
                        )}
                    </material.CardContent>
                </material.Card>
            </material.Box>
        </material.ThemeProvider>
    )
}