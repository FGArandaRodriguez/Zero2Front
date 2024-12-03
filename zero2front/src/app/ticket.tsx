'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import router, { useRouter } from 'next/router'

interface Ticket {
  id_ticket: number
  id_pedido: number
  id_metodo_pago: number
  total: number
  pedido: Pedido
  metodo_pago: MetodoPago
}

interface Pedido {
  id:number
  fecha: string
  Pago: Pago[]
  DetallePedido: DetallePedido[]
}

interface Pago {
  total: number
  fecha_pago: string
}

interface DetallePedido {
  cantidad: number
  subtotal: number
  Menu: Menu
}

interface Menu {
  nombre: string
  precio: number
}

interface MetodoPago {
  nombre: string
}

interface TicketProps {
  id_ticket: string; // Asegúrate de que el tipo coincida con el tipo que estás pasando
}

export default function Ticket({ id_ticket }: TicketProps) {
  const [order, setOrder] = useState<Ticket | null>(null);

  useEffect(() => {
    if (id_ticket) {
      fetch(`http://localhost:3001/api/tickets?id_ticket=${id_ticket}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setOrder(data);
        })
        .catch((err) => {
          console.error('Error al cargar el ticket:', err.message);
        });
    }
  }, [id_ticket]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!order) {
    return <div>Loading...</div>;
  }
  return (
<div className="min-h-screen flex items-center justify-center  p-4">
  <Card className="w-1/3 max-w-2xlshadow-lg">
    <CardHeader className="p-4 border-b">
      <h2 className="text-xl font-bold text-center">TASTE BRINGERS</h2>
      <p className="text-center text-sm text-gray-500">¡Gracias por tu compra!</p>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-4">
        {/* Información del establecimiento */}
        <div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Ubicación:</span>
            <span className="text-sm text-right">
              Carretera Cancún-Aeropuerto, S.M 299-km. 11.5, 77565 Q.R
            </span>
          </div>
        </div>
        <p className="text-center my-5">------------------------------------------</p>

        {/* Información del pedido */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Fecha y Hora:</span>
            <span className="text-sm">{order.pedido.fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Número de Pedido:</span>
            <span className="text-sm">#{order.pedido.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Método de Pago:</span>
            <span className="text-sm">{order.metodo_pago.nombre}</span> 
            {/*{order.pagos.map((Pago, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b"
            >
              <span>
                {Pago.Menu.nombre} x {Pago.cantidad}
              </span>
              <span>${(Pago.Menu.precio * Pago.cantidad).toFixed(2)}</span>
            </div>
          ))}*/}
          </div>
        </div>
        <p className="text-center my-5">------------------------------------------</p>

        {/* Pago de productos */}
        <div>
          <h3 className="text-2xl font-bold mb-2">Productos</h3>
          <div className="flex justify-between text-lg font-semibold py-2 border-b">
            <span>Cantidad Total:</span>
            <span>5</span>
          </div>
          {order.pedido.DetallePedido.map((detalle, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b"
            >
              <span>
                {detalle.Menu.nombre} x {detalle.cantidad}
              </span>
              <span>${(detalle.Menu.precio * detalle.cantidad).toFixed(2)}</span>
            </div>
          ))}

          {/* Totales */}
          <div className="flex justify-between items-center py-2 font-semibold border-t">
            <span>Subtotal:</span>
            <span>
              $
              {order.pedido.DetallePedido.reduce(
                (acc, detalle) => acc + detalle.Menu.precio * detalle.cantidad,
                0
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Propina:</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Cargo adicional:</span>
            <span>$0.00</span>
          </div>
        </div>
        <p className="text-center my-5">------------------------------------------</p>

        {/* Total final */}
        <div className="flex justify-between items-center py-4 text-lg font-bold border-t">
          <span>Total:</span>
          <span>${order.total.toFixed(2)}</span>
        </div>

        {/* Mensaje de despedida */}
        <div className="text-center text-sm text-gray-600">
          <p>¡Esperamos verte pronto!</p>
          <p>Para cualquier duda, contáctanos al (998) 3932746.</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

  )
}
