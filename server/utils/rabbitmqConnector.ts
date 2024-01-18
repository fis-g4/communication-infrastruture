import amqplib, { Channel, Connection } from 'amqplib'

export class RabbitMQConnector {
    private static channel: Channel
    private static connection: Connection

    static async connect() {
        try {
            const amqpServer = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672`
            this.connection = await amqplib.connect(amqpServer)
            this.channel = await this.connection.createChannel()
            await this.channel.assertExchange('communication_exchange', 'topic')
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    static getChannel(): Channel {
        return this.channel
    }
}
