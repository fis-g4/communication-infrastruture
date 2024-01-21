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

        it('should return 201: OK - requestAppUsers', async () => {
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

        it('should return 201: OK - notificationNewPlanPayment', async () => {
            messageContent = {
                operationId: 'notificationNewPlanPayment',
                message: {
                    username: 'testUser',
                    plan: 'FREE',
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

        it('should return 400: Invalid usernames type - requestAppUsers', async () => {
            messageContent = {
                operationId: 'requestAppUsers',
                message: {
                    usernames: 'testuser1',
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
                error: 'Invalid message for operationId: requestAppUsers. Missing usernames or usernames is not an array or is empty.',
            })
        })

        it('should return 400: No username - requestAppUsers', async () => {
            messageContent = {
                operationId: 'requestAppUsers',
                message: {
                    usernames: [],
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
                error: 'Invalid message for operationId: requestAppUsers. Missing usernames or usernames is not an array or is empty.',
            })
        })

        it('should return 400: Missing username - notificationNewPlanPayment', async () => {
            messageContent = {
                operationId: 'notificationNewPlanPayment',
                message: {
                    plan: 'FREE',
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
                error: 'Invalid message for operationId: notificationNewPlanPayment. Missing username or plan, or invalid value for plan (FREE, ADVANCED, PRO).',
            })
        })

        it('should return 400: Missing plan - notificationNewPlanPayment', async () => {
            messageContent = {
                operationId: 'notificationNewPlanPayment',
                message: {
                    username: 'testUser',
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
                error: 'Invalid message for operationId: notificationNewPlanPayment. Missing username or plan, or invalid value for plan (FREE, ADVANCED, PRO).',
            })
        })

        it('should return 400: Missing username - notificationNewPlanPayment', async () => {
            messageContent = {
                operationId: 'notificationNewPlanPayment',
                message: {
                    username: 'testUser',
                    plan: 'FREEE',
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
                error: 'Invalid message for operationId: notificationNewPlanPayment. Missing username or plan, or invalid value for plan (FREE, ADVANCED, PRO).',
            })
        })

        it('should return 403: Unauthorized - requestAppUsers', async () => {
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

        it('should return 201: OK - publishNewCourseAccess', async () => {
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

        it('should return 201: OK - responseAppClassesAndMaterials', async () => {
            messageContent = {
                operationId: 'responseAppClassesAndMaterials',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                    classIds: ['fnsjdkh', '8927fhjkd'],
                    materialIds: ['fnsjdkh', '8927fhjkd'],
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - notificationNewClass', async () => {
            messageContent = {
                operationId: 'notificationNewClass',
                message: {
                    classId: 'nfjwknfwklejnfwekljnfwe',
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - notificationDeleteClass', async () => {
            messageContent = {
                operationId: 'notificationDeleteClass',
                message: {
                    classId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - notificationAssociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationAssociateMaterial',
                message: {
                    materialId: 'nfjwknfwklejnfwekljnfwe',
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - notificationDisassociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationDisassociateMaterial',
                message: {
                    materialId: 'nfjwknfwklejnfwekljnfwe',
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - requestMaterialReviews', async () => {
            messageContent = {
                operationId: 'requestMaterialReviews',
                message: {
                    materialId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

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

        it('should return 400: Missing username - publishNewCourseAccess', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccess',
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
                error: 'Invalid message for operationId: publishNewCourseAccess. username and courseId are required.',
            })
        })

        it('should return 400: Missing courseId - publishNewCourseAccess', async () => {
            messageContent = {
                operationId: 'publishNewCourseAccess',
                message: {
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
                error: 'Invalid message for operationId: publishNewCourseAccess. username and courseId are required.',
            })
        })

        it('should return 400: Missing courseId - responseAppClassesAndMaterials', async () => {
            messageContent = {
                operationId: 'responseAppClassesAndMaterials',
                message: {
                    classIds: ['fnsjdkh', '8927fhjkd'],
                    materialIds: ['fnsjdkh', '8927fhjkd'],
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
                error: 'Invalid message for operationId: responseAppClassesAndMaterials. Missing courseId.',
            })
        })

        it('should return 400: Missing classId - notificationNewClass', async () => {
            messageContent = {
                operationId: 'notificationNewClass',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationNewClass. classId and courseId are required.',
            })
        })

        it('should return 400: Missing courseId - notificationNewClass', async () => {
            messageContent = {
                operationId: 'notificationNewClass',
                message: {
                    classId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationNewClass. classId and courseId are required.',
            })
        })

        it('should return 400: Missing classId - notificationDeleteClass', async () => {
            messageContent = {
                operationId: 'notificationDeleteClass',
                message: {},
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationDeleteClass. Missing classId.',
            })
        })

        it('should return 400: Missing courseId - notificationAssociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationAssociateMaterial',
                message: {
                    materialId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationAssociateMaterial. materialId and courseId are required.',
            })
        })

        it('should return 400: Missing materialId - notificationAssociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationAssociateMaterial',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationAssociateMaterial. materialId and courseId are required.',
            })
        })

        it('should return 400: Missing classId - notificationDisassociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationDisassociateMaterial',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationDisassociateMaterial. materialId and courseId are required.',
            })
        })

        it('should return 400: Missing courseId - notificationDisassociateMaterial', async () => {
            messageContent = {
                operationId: 'notificationDisassociateMaterial',
                message: {
                    materialId: 'nfjwknfwklejnfwekljnfwe',
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: notificationDisassociateMaterial. materialId and courseId are required.',
            })
        })

        it('should return 400: Missing materialId - requestMaterialReviews', async () => {
            messageContent = {
                operationId: 'requestMaterialReviews',
                message: {},
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: requestMaterialReviews. Missing materialId.',
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

        it('should return 201: OK - notificationUserDeletion', async () => {
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

        it('should return 400: Missing username - notificationUserDeletion', async () => {
            messageContent = {
                operationId: 'notificationUserDeletion',
                message: {
                    usernam3: 'testuser',
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
                error: 'Invalid message for operationId: notificationUserDeletion. Missing username.',
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

    describe('POST /v1/messages/learning-microservice', () => {
        let messageContent
        const endpoint = learningMicroserviceEndpoint

        it('should return 201: OK - responseMaterialReviews', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
                    review: 4,
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

        it('should return 201: OK - requestAppClassesAndMaterials', async () => {
            messageContent = {
                operationId: 'requestAppClassesAndMaterials',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                    classIds: ['fnsjdkh', '8927fhjkd'],
                    materialIds: ['fnsjdkh', '8927fhjkd'],
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - publishNewMaterialAccess', async () => {
            messageContent = {
                operationId: 'publishNewMaterialAccess',
                message: {
                    username: 'testuser',
                    materialId: '3h4uf8h8f',
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - notificationDeleteCourse', async () => {
            messageContent = {
                operationId: 'notificationDeleteCourse',
                message: {
                    courseId: 'nfjwknfwklejnfwekljnfwe',
                    classIds: ['fnsjdkh', '8927fhjkd'],
                    materialIds: ['fnsjdkh', '8927fhjkd'],
                },
            }
            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

            expect(response.status).toBe(201)
            expect(response.body).toEqual({
                message: 'Message sent successfully',
            })
        })

        it('should return 201: OK - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREE',
                        },
                    ],
                },
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)

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
                    materialId: 'n4hf8vjsd78xdj',
                    review: 4,
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
                operationId: 'responseMaterialReviews',
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
                operationId: 'responseMaterialReviewsInvalid',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
                    review: 4,
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

        it('should return 400: Missing materialId - responseMaterialReviews', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    review: 4,
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
                error: 'Invalid message for operationId: responseMaterialReviews. materialId and review are required.',
            })
        })

        it('should return 400: Missing review - responseMaterialReviews', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
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
                error: 'Invalid message for operationId: responseMaterialReviews. materialId and review are required.',
            })
        })

        it('should return 400: Invalid review value - responseMaterialReviews', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
                    review: '4',
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
                error: 'Invalid message for operationId: responseMaterialReviews. Invalid review value (must be a number between 1 and 5 or null).',
            })
        })

        it('should return 400: Invalid review range - responseMaterialReviews', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
                    review: 8,
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
                error: 'Invalid message for operationId: responseMaterialReviews. Invalid review value (must be a number between 1 and 5 or null).',
            })
        })

        it('should return 400: Missing courseId - requestAppClassesAndMaterials', async () => {
            messageContent = {
                operationId: 'requestAppClassesAndMaterials',
                message: {
                    cours3Id: 'fsdjkfhsd98f7sdnskjld',
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
                error: 'Invalid message for operationId: requestAppClassesAndMaterials. Missing courseId.',
            })
        })

        it('should return 400: Missing username - publishNewMaterialAccess', async () => {
            messageContent = {
                operationId: 'publishNewMaterialAccess',
                message: {
                    username: 'test-user',
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
                error: 'Invalid message for operationId: publishNewMaterialAccess. username and materialId are required.',
            })
        })

        it('should return 400: Missing materialId - publishNewMaterialAccess', async () => {
            messageContent = {
                operationId: 'publishNewMaterialAccess',
                message: {
                    materialId: 'fdg54hsd98f7sdnskjld',
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
                error: 'Invalid message for operationId: publishNewMaterialAccess. username and materialId are required.',
            })
        })

        it('should return 400: Missing courseId - notificationDeleteCourse', async () => {
            messageContent = {
                operationId: 'notificationDeleteCourse',
                message: {
                    classIds: ['fnsjdkh', '8927fhjkd'],
                    materialIds: ['fnsjdkh', '8927fhjkd'],
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
                error: 'Invalid message for operationId: notificationDeleteCourse. Missing courseId.',
            })
        })

        it('should return 400: Missing users - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {},
            }

            const response = await request(app)
                .post(endpoint)
                .set('x-api-key', `${API_KEY}`)
                .send(messageContent)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(response.status).toBe(400)
            expect(response.body).toEqual({
                error: 'Invalid message for operationId: responseAppUsers. users must be an array with at least one element.',
            })
        })

        it('should return 400: Missing user firstName - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Missing user lastName - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Missing user email - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Missing user username - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Missing user profilePicture - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            plan: 'FREE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Missing user plan - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 400: Invalid user plan - responseAppUsers', async () => {
            messageContent = {
                operationId: 'responseAppUsers',
                message: {
                    users: [
                        {
                            firstName: 'Test',
                            lastName: 'User',
                            email: 'testuser@mail.com',
                            username: 'testuser',
                            profilePicture: 'https://testuser.com',
                            plan: 'FREEE',
                        },
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
                error: 'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
            })
        })

        it('should return 403: Unauthorized', async () => {
            messageContent = {
                operationId: 'responseMaterialReviews',
                message: {
                    materialId: 'n4hf8vjsd78xdj',
                    review: 4,
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

        it('should return 201: OK - notificationUserDeletion', async () => {
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
