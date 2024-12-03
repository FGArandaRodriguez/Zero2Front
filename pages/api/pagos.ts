import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Inicializa el middleware de CORS
const cors = Cors({
    origin: 'http://localhost:3000', // Cambia al puerto de tu frontend
    methods: ['GET', 'POST'], // Métodos permitidos
});

// Helper para usar middleware de forma compatible con Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

type PagoRequest = {
    id_pedido: number;
    id_metodo_pago: number;
    monto_pago: number;
    fecha_pago?: string;
};

type ApiResponse = {
    success: boolean;
    message: string;
    data?: any;
};

async function handlePago(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    // Aplica CORS antes de cualquier lógica
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        const { id_pedido, id_metodo_pago, monto_pago, fecha_pago }: PagoRequest = req.body;

        if (!id_pedido || !id_metodo_pago || !monto_pago) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos',
            });
        }

        if (monto_pago <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto del pago debe ser mayor a 0',
            });
        }

        try {
            const pagos = await prisma.pago.findMany({
                where: { id_pedido },
            });

            const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto_pago, 0);
            const nuevoTotalPagado = totalPagado + monto_pago;

            const pedido = await prisma.pedidos.findUnique({
                where: { id: id_pedido },
            });

            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado',
                });
            }

            if (nuevoTotalPagado > pedido.total && id_metodo_pago === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto total ya ha sido alcanzado o la cantidad exede la cantidad total .',
                });
            }

            const nuevoPago = await prisma.pago.create({
                data: {
                    pedido: { connect: { id: id_pedido } },
                    metodo_pago: { connect: { id: id_metodo_pago } },
                    monto_pago,
                    fecha_pago: fecha_pago ? new Date(fecha_pago) : new Date(),
                    total: pedido.total,
                },
            });
            let newTicket
            const montoFaltante = pedido.total - nuevoTotalPagado;
            const total = pedido.total;
            if (montoFaltante <= 50) {
                    newTicket = await prisma.ticket.create({
                    data: {
                      id_pedido: Number(id_pedido),
                      id_metodo_pago: 1,
                      total,
                    },
                  });
            }
            return res.status(200).json({
                success: true,
                message: 'Pago registrado exitosamente',
                data: {
                    nuevoPago,
                    totalPagado: nuevoTotalPagado,
                    montoFaltante,
                    newTicket: newTicket ? newTicket.id_ticket : null 
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al registrar el pago',
                data: (error as Error).message,
            });
        }
    } else if (req.method === 'GET') {
        const { id_pedido } = req.query;
        if (!id_pedido) {
            return res.status(400).json({
                success: false,
                message: 'id_pedido es requerido en la consulta',
            });
        }

        try {
            const pagos = await prisma.pago.findMany({
                where: { id_pedido: Number(id_pedido) },
                include: {
                    metodo_pago: true,
                },
            });

            const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto_pago, 0);
            const pedido = await prisma.pedidos.findUnique({
                where: { id: Number(id_pedido) },
            });

            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado',
                });
            }
            const montoFaltante = pedido.total - totalPagado;
            const pagadoCompleto = totalPagado >= pedido.total;
            
            return res.status(200).json({
                success: true,
                message: 'Pagos obtenidos exitosamente',
                data: {
                    pagos,
                    totalPagado,
                    montoFaltante,
                    pagadoCompleto,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los pagos',
                data: (error as Error).message,
            });
        }
    } else if (req.method === 'PUT') {
    
    }
    else {
        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}

export default handlePago;