import express, { Request, Response } from 'express'

import { validateAndSend } from '../utils/sendMessage'
import { RabbitMQConnector } from '../utils/rabbitmqConnector'

const router = express.Router()

RabbitMQConnector.connect()

function handleMicroserviceRoute(
    routeName: string,
    queueName: string,
    validOperationIds: string[]
) {
    router.post(`/${routeName}`, (req: Request, res: Response) => {
        const channel = RabbitMQConnector.getChannel()
        validateAndSend(req, res, validOperationIds, channel, queueName)
    })
}

router.get('/check', async (req: Request, res: Response) => {
    return res.status(200).json({
        message: 'The communication microservice is working properly!',
    })
})

router.post('/user/notification', (req: Request, res: Response) => {
    const channel = RabbitMQConnector.getChannel()
    validateAndSend(
        req,
        res,
        ['notificationUserDeletion'],
        channel,
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

handleMicroserviceRoute('payments-microservice', 'payments_microservice', [
    'notificationUserDeletion',
])

handleMicroserviceRoute('learning-microservice', 'learning_microservice', [
    'responseMaterialReviews',
    'requestAppClassesAndMaterials',
    'publishNewMaterialAccess',
    'notificationDeleteCourse ',
    'responseAppUsers',
    'notificationUserDeletion',
])

export default router
