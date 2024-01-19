import { Channel } from 'amqplib'
import { validateMessage } from './messageValidator'

import { Request, Response } from 'express'

const API_KEY = process.env.API_KEY

function sendAndRespond(
    data: Record<string, any>,
    res: Response,
    channel: Channel,
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

export function validateAndSend(
    req: Request,
    res: Response,
    validOperationIds: string[],
    channel: Channel,
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
        return res.status(400).send({ error: 'No data was sent' })
    }
    if (req.get('Content-Type') !== 'application/json') {
        return res
            .status(400)
            .send({ error: 'The content must be a JSON object' })
    }
    if (!data.operationId) {
        return res.status(400).send({
            error: 'The content must contain the operationId property',
        })
    }
    if (validOperationIds.includes(data.operationId)) {
        if (!data.message) {
            return res.status(400).send({
                error: 'The content must contain the message property',
            })
        }
        const validation = validateMessage(data.operationId, data.message)
        if (!validation.isValid) {
            return res.status(400).send({ error: validation.errorMessage })
        }
    } else {
        return res.status(400).send({ error: 'Invalid operationId' })
    }
    sendAndRespond(data, res, channel, queueName, topic)
}
