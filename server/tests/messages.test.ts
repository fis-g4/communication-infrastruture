import request from 'supertest'
import 'dotenv/config'
import { RabbitMQConnector } from '../utils/rabbitmqConnector'
import amqplib from 'amqplib'

const app = require('../app')

const URL_BASE = '/v1/messages'

// ENV variables

const API_KEY = process.env.API_KEY

// Endpoints to test

const healthCheckEndpoint = `${URL_BASE}/check`
const usersMicroserviceEndpoint = `${URL_BASE}/users-microservice`
const coursesMicroserviceEndpoint = `${URL_BASE}/courses-microservice`
const paymentsMicroserviceEndpoint = `${URL_BASE}/payments-microservice`
const learningMicroserviceEndpoint = `${URL_BASE}/learning-microservice`
const userDeletionEndpoint = `${URL_BASE}/user/notification`

// Mocks

jest.mock('amqplib', () => {
    return {
        connect: jest.fn().mockResolvedValue({
            createChannel: jest.fn().mockResolvedValue({
                assertExchange: jest.fn(),
                publish: jest.fn().mockResolvedValue(true),
                sendToQueue: jest.fn().mockResolvedValue(true),
            }),
        }),
    }
})

// Tests

describe('RabbitMQConnector', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should successfully connect to RabbitMQ', async () => {
        await RabbitMQConnector.connect()

        expect(amqplib.connect).toHaveBeenCalledWith(
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:5672`
        )
        expect(RabbitMQConnector.getChannel()).toBeDefined()
    })

    it('should throw an error on connection failure', async () => {
        ;(amqplib.connect as jest.Mock).mockRejectedValue(
            new Error('Connection error')
        )

        await expect(RabbitMQConnector.connect()).rejects.toThrow(
            'Connection error'
        )
    })
})

describe('Messages API', () => {
    describe('GET /v1/messages/check', () => {
        it('should return 200 OK', async () => {
            const response = await request(app).get(healthCheckEndpoint)
            expect(response.status).toBe(200)
        })
    })

    describe('POST /v1/messages/users-microservice', () => {
        let messageContent
        const endpoint = usersMicroserviceEndpoint

        it('should return 201: OK', async () => {
            messageContent = {
                operationId: 'requestAppUsers',
                message: {
                    usernames: [
                        'testuser1',
                        'testuser2',
                        'testuser3',
                        'testuser4',
                    ],
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 400: The content must be a JSON object', async () => {
            messageContent = ''
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must be a JSON object',
            })
        })

        it('should return 400: The content must contain the operationId property', async () => {
            messageContent = {
                message: {
                    usernames: [
                        'testuser1',
                        'testuser2',
                        'testuser3',
                        'testuser4',
                    ],
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the operationId property',
            })
        })

        it('should return 400: The content must contain the message property', async () => {
            messageContent = {
                operationId: 'requestAppUsers',
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the message property',
            })
        })

        it('should return 400: Invalid operation ids', async () => {
            messageContent = {
                operationId: 'requestAppUsersInvalid',
                message: {
                    usernames: [
                        'testuser1',
                        'testuser2',
                        'testuser3',
                        'testuser4',
                    ],
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid operationId',
            })
        })

        it('should return 403: Unauthorized', async () => {
            messageContent = {
                operationId: 'requestAppUsers',
                message: {
                    usernames: [
                        'testuser1',
                        'testuser2',
                        'testuser3',
                        'testuser4',
                    ],
                },
            }

            const response = await request(app)
                .post(endpoint)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(403)
            expect(response.body).toEqual({
                error: 'Unauthorized. You need a valid API key',
            })
        })
    })

    describe('POST /v1/messages/courses-microservice', () => {
        let messageContent
        const endpoint = coursesMicroserviceEndpoint

        it('should return 201: OK', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccess',
                message: {
                    username: 'testuser',
                    courseId: '3h4uf8h8f',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 400: The content must be a JSON object', async () => {
            messageContent = ''
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must be a JSON object',
            })
        })

        it('should return 400: The content must contain the operationId property', async () => {
            messageContent = {
                message: {
                    username: 'testuser',
                    courseId: '3h4uf8h8f',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the operationId property',
            })
        })

        it('should return 400: The content must contain the message property', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccess',
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the message property',
            })
        })

        it('should return 400: Invalid operation ids', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccessInvalid',
                message: {
                    username: 'testuser',
                    courseId: '3h4uf8h8f',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid operationId',
            })
        })

        it('should return 403: Unauthorized', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccess',
                message: {
                    username: 'testuser',
                    courseId: '3h4uf8h8f',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(403)
            expect(response.body).toEqual({
                error: 'Unauthorized. You need a valid API key',
            })
        })
    })

    describe('POST /v1/messages/payments-microservice', () => {
        let messageContent
        const endpoint = paymentsMicroserviceEndpoint

        it('should return 201: OK', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 400: The content must be a JSON object', async () => {
            messageContent = ''
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must be a JSON object',
            })
        })

        it('should return 400: The content must contain the operationId property', async () => {
            messageContent = {
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the operationId property',
            })
        })

        it('should return 400: The content must contain the message property', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the message property',
            })
        })

        it('should return 400: Invalid operation ids', async () => {
            messageContent = {
                operationId: 'notificationUserDeletionInvalid',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid operationId',
            })
        })

        it('should return 403: Unauthorized', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(403)
            expect(response.body).toEqual({
                error: 'Unauthorized. You need a valid API key',
            })
        })
    })

    describe('POST /v1/messages/user/notification', () => {
        let messageContent
        const endpoint = userDeletionEndpoint

        it('should return 201: OK', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 400: The content must be a JSON object', async () => {
            messageContent = ''
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must be a JSON object',
            })
        })

        it('should return 400: The content must contain the operationId property', async () => {
            messageContent = {
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the operationId property',
            })
        })

        it('should return 400: The content must contain the message property', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'The content must contain the message property',
            })
        })

        it('should return 400: Invalid operation ids', async () => {
            messageContent = {
                operationId: 'notificationUserDeletionInvalid',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid operationId',
            })
        })

        it('should return 403: Unauthorized', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
                message: {
                    username: 'testuser',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(403)
            expect(response.body).toEqual({
                error: 'Unauthorized. You need a valid API key',
            })
        })
    })
})
