'use client'

import { useState, useEffect } from 'react'
import { Loader2, CreditCard, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import router from 'next/router'
import Ticket from './ticket'
interface OrderItem {
  id_detalle_pedido: number
  nombre_menu: string
  cantidad: number
  precio: number
  subtotal: number
}

interface PaymentDetails {
  method: number
  customAmount: number | null
}

export default function PaymentPage() {
  const [order, setOrder] = useState<OrderItem[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 1,
    customAmount: null,
  })
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showCustomAmount, setShowCustomAmount] = useState(false)
  const [montoFaltante, setMontoFaltante] = useState(0)
  const [change, setChange] = useState(0)

  const fetchMontoFaltante = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/pagos?id_pedido=4`)
      const data = await response.json()

      if (response.ok) {
        setMontoFaltante(data.data.montoFaltante)
      } else {
        console.error('Error al obtener el monto faltante:', data.message)
      }
    } catch (err) {
      console.error('Error al conectar con la API de pagos:', err)
    }
    
  }

  useEffect(() => {
    fetchMontoFaltante()
  }, [])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:3001/api/detalle_pedidos`);
      const data = await response.json()

      if (response.ok) {
        setOrder(data)
      } else {
        setError(data.message || 'Error al obtener los detalles del pedido')
      }
    } catch (err) {
      setError('Error al conectar con la API de detalles de pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [])

  const calculateSubtotal = () => {
    return order.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const IVA_RATE = 0.16 // 16% IVA
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const iva = subtotal * IVA_RATE
    return subtotal + iva
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await fetchMontoFaltante()

      const total = calculateTotal()
      const amountToPay = paymentDetails.customAmount !== null ? paymentDetails.customAmount : total

      if (paymentDetails.method === 2 && amountToPay > total) {
        setChange(amountToPay - montoFaltante)
      } else {
        setChange(0)
      }

      const response = await fetch(`http://localhost:3001/api/pagos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_pedido: 4,
          id_metodo_pago: paymentDetails.method,
          monto_pago: amountToPay,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        if (paymentDetails.method === 2 && amountToPay >= montoFaltante) {
          setMontoFaltante(0);
        } else {
          await fetchMontoFaltante();
        }
        if(result.data.newTicket && result.data.newTicket){
          setTicketId(result.data.newTicket)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.warn(err);
      setError('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomAmountChange = (value: number) => {
    setPaymentDetails(prev => ({ ...prev, customAmount: value }))
    if (paymentDetails.method === 2 && value > montoFaltante) {
      setChange(value - montoFaltante)
    } else {
      setChange(0)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAB677] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#EC8439]">Pago del Pedido</CardTitle>
          <CardDescription>Revise su pedido y complete el pago</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Detalles del Pedido</h3>
                  {order.map((item) => (
                    <div key={item.id_detalle_pedido} className="flex justify-between items-center py-2 border-b">
                      <span>{item.nombre_menu} x {item.cantidad}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-semibold">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 font-semibold text-gray-600">
                    <span>IVA (16%)</span>
                    <span>${(calculateSubtotal() * IVA_RATE).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-lg font-bold">
                    <span>Monto Faltante</span>
                    <span>${montoFaltante.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Método de Pago</Label>
                  <Select
                    value={paymentDetails.method.toString()}
                    onValueChange={(value: string) => {
                      const method = parseInt(value, 10);
                      setPaymentDetails(prev => {
                        const newDetails = { ...prev, method };
                        if (method === 2 && newDetails.customAmount && newDetails.customAmount > montoFaltante) {
                          setChange(newDetails.customAmount - montoFaltante);
                        } else {
                          setChange(0);
                        }
                        return newDetails;
                      });
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Seleccione método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tarjeta de Crédito/Débito</SelectItem>
                      <SelectItem value="2">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  className="w-full mt-4 bg-[#EC8439] hover:bg-[#EE9D5E]"
                  onClick={() => setShowCustomAmount(!showCustomAmount)}
                >
                  {showCustomAmount ? 'Ocultar Monto Personalizado' : 'Agregar Monto Personalizado'}
                </Button>

                {showCustomAmount && (
                  <div className="mt-4">
                    <Label htmlFor="customAmount" className="text-lg font-semibold">Monto Personalizado</Label>
                    <Input
                      id="customAmount"
                      name="customAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentDetails.customAmount !== null ? paymentDetails.customAmount.toString() : ''}
                      onChange={(e) => handleCustomAmountChange(parseFloat(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                )}

                {change > 0 && (
                  <Alert className="mt-4">
                    <AlertDescription>Cambio a devolver: ${change.toFixed(2)}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4">
                    <AlertDescription>¡Pago procesado con éxito!</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full mt-6 bg-[#EC8439] hover:bg-[#EE9D5E]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {paymentDetails.method === 1 ? (
                        <CreditCard className="mr-2 h-4 w-4" />
                      ) : (
                        <DollarSign className="mr-2 h-4 w-4" />
                      )}
                      Pagar Ahora
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
          {ticketId != null && <Ticket id_ticket={String(ticketId)} />}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500 text-center w-full">
            Su información de pago está segura y encriptada
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
