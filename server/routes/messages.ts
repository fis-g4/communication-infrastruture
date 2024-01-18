import express, { Request, Response } from 'express'
import amqplib, { Channel, Connection } from 'amqplib'

const router = express.Router()

let channel: Channel, connection: Connection
const API_KEY = process.env.API_KEY

connect()

async function connect() {
    try {
        const amqpServer = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672`
        connection = await amqplib.connect(amqpServer)
        channel = await connection.createChannel()
        await channel.assertExchange('communication_exchange', 'topic')
    } catch (error) {
        console.error(error)
        throw error
    }
}

function sendAndRespond(
    data: Record<string, any>,
    res: Response,
    queueName?: string,
    topic?: string
) {
    const message = { ...data, date: new Date() }
    const buffer = Buffer.from(JSON.stringify(message))

    if (queueName) {
        channel.sendToQueue(queueName, buffer)
    } else if (topic) {
        channel.publish('communication_exchange', topic, buffer)
    } else {
        return res.status(400).send('You must specify a queue or a topic')
    }

    return res.status(201).json({ message: 'Message sent successfully' })
}

function validateAndSend(
    req: Request,
    res: Response,
    validOperationIds: string[],
    queueName?: string,
    topic?: string
) {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== API_KEY) {
        return res
            .status(403)
            .json({ error: 'Unauthorized. You need a valid API key' })
    }
    const data = req.body
    if (data.length === 0) {
        return res.status(400).send('No data was sent')
    }
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(400).send('The content must be a JSON object')
    }
    if (!data.operationId) {
        return res
            .status(400)
            .send('The content must contain the operationId property')
    }

    if (validOperationIds.includes(data.operationId)) {
        if (!data.message) {
            return res
                .status(400)
                .send('The content must contain the message property')
        }
    } else {
        return res.status(400).send('Invalid operationId')
    }
    sendAndRespond(data, res, queueName, topic)
}

function handleMicroserviceRoute(
    routeName: string,
    queueName: string,
    validOperationIds: string[]
) {
    router.post(`/${routeName}`, (req: Request, res: Response) => {
        validateAndSend(req, res, validOperationIds, queueName)
    })
}

router.get('/check', async (req: Request, res: Response) => {
    return res
        .status(200)
        .json({ message: 'The communication service is working properly!' })
})

router.post('/user/notification', (req: Request, res: Response) => {
    validateAndSend(
        req,
        res,
        ['notificationUserDeletion'],
        undefined,
        'userRemoved'
    )
})

handleMicroserviceRoute('users-microservice', 'users_microservice', [
    'notificationNewPlanPayment',
    'requestAppUsers',
])

handleMicroserviceRoute('courses-microservice', 'courses_microservice', [
    'publishNewCourseAccess',
    'responseAppClassesAndMaterials',
    'notificationNewClass',
    'notificationDeleteClass',
    'notificationAssociateMaterial',
    'notificationDisassociateMaterial',
    'requestMaterialReviews',
    'notificationUserDeletion',
])

handleMicroserviceRoute('payment-microservice', 'payment_microservice', [
    'notificationUserDeletion',
])

handleMicroserviceRoute('learning-microservice', 'learning_microservice', [
    'responseMaterialReviews',
    'requestAppClassesAndMaterials',
    'publishNewMaterialAccess',
    'notificationDeleteCourse ',
    'responseAppUsers',
])

export default router
