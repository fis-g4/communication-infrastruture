interface ValidationResult {
    isValid: boolean
    errorMessage?: string
}

export function validateMessage(
    operationId: string,
    message: any
): ValidationResult {
    if (typeof message === 'string') {
        message = JSON.parse(message)
    }

    switch (operationId) {
        case 'requestAppUsers':
            return validateRequestAppUsers(message)
        case 'notificationNewPlanPayment':
            return validateNotificationNewPlanPayment(message)
        case 'notificationUserDeletion':
            return validateNotificationUserDeletion(message)
        case 'publishNewCourseAccess':
            return validatePublishNewCourseAccess(message)
        case 'publishNewMaterialAccess':
            return validatePublishNewMaterialAccess(message)
        case 'responseAppClassesAndMaterials':
            return validateResponseAppClassesAndMaterials(message)
        case 'notificationNewClass':
            return validateNotificationNewClass(message)
        case 'notificationDeleteClass':
            return validateNotificationDeleteClass(message)
        case 'notificationAssociateMaterial':
            return validateNotificationAssociateMaterial(message)
        case 'notificationDisassociateMaterial':
            return validateNotificationDisassociateMaterial(message)
        case 'requestMaterialReviews':
            return validateRequestMaterialReviews(message)
        case 'responseMaterialReviews':
            return validateResponseMaterialReviews(message)
        case 'responseAppUsers':
            return validateResponseAppUsers(message)
        case 'requestAppClassesAndMaterials':
            return validateRequestAppClassesAndMaterials(message)
        case 'notificationDeleteCourse':
            return validateNotificationDeleteCourse(message)
        default:
            return {
                isValid: false,
                errorMessage: 'Invalid operationId',
            }
    }
}

function validateRequestAppUsers(message: any): ValidationResult {
    if (
        !message['usernames'] ||
        !Array.isArray(message['usernames']) ||
        message['usernames'].length === 0
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestAppUsers. Missing usernames or usernames is not an array or is empty.',
        }
    }
    return { isValid: true }
}

function validateNotificationNewPlanPayment(message: any): ValidationResult {
    if (
        !message['username'] ||
        !message['plan'] ||
        !['BASIC', 'ADVANCED', 'PRO'].includes(message['plan'])
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationNewPlanPayment. Missing username or plan, or invalid value for plan (BASIC, ADVANCED, PRO).',
        }
    }
    return { isValid: true }
}
function validateNotificationUserDeletion(message: any): ValidationResult {
    if (!message['username']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationUserDeletion. Missing username.',
        }
    }
    return { isValid: true }
}
function validatePublishNewCourseAccess(message: any): ValidationResult {
    if (!message['username'] || !message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: publishNewCourseAccess. username and courseId are required.',
        }
    }
    return { isValid: true }
}

function validatePublishNewMaterialAccess(message: any): ValidationResult {
    if (!message['username'] || !message['materialId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: publishNewMaterialAccess. username and materialId are required.',
        }
    }
    return { isValid: true }
}

function validateResponseAppClassesAndMaterials(
    message: any
): ValidationResult {
    if (!message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. Missing courseId.',
        }
    }

    if (message['classIds'] && !Array.isArray(message['classIds'])) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. classIds must be an array.',
        }
    }
    if (message['materialIds'] && !Array.isArray(message['materialIds'])) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. materialIds must be an array.',
        }
    }

    return { isValid: true }
}

function validateNotificationNewClass(message: any): ValidationResult {
    if (!message['classId'] || !message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationNewClass. classId and courseId are required.',
        }
    }
    return { isValid: true }
}

function validateNotificationDeleteClass(message: any): ValidationResult {
    if (!message['classId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteClass. Missing classId.',
        }
    }
    return { isValid: true }
}
function validateNotificationAssociateMaterial(message: any): ValidationResult {
    if (!message['materialId'] || !message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationAssociateMaterial. materialId and courseId are required.',
        }
    }
    return { isValid: true }
}

function validateNotificationDisassociateMaterial(
    message: any
): ValidationResult {
    if (!message['materialId'] || !message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDisassociateMaterial. materialId and courseId are required.',
        }
    }
    return { isValid: true }
}
function validateRequestMaterialReviews(message: any): ValidationResult {
    if (!message['materialId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestMaterialReviews. Missing materialId.',
        }
    }
    return { isValid: true }
}

function validateResponseMaterialReviews(message: any): ValidationResult {
    if (!message['materialId'] || !message['review']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseMaterialReviews. materialId and review are required.',
        }
    }
    if (
        !(
            message['review'] === null ||
            (typeof message['review'] === 'number' &&
                message['review'] >= 1 &&
                message['review'] <= 5)
        )
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseMaterialReviews. Invalid review value (must be a number between 1 and 5 or null).',
        }
    }

    return { isValid: true }
}

function validateResponseAppUsers(message: any): ValidationResult {
    if (
        !message['users'] ||
        !Array.isArray(message['users']) ||
        message['users'].length === 0
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppUsers. users must be an array with at least one element.',
        }
    }

    if (
        !message.users.every(
            (user: any) =>
                user['firstName'] &&
                user['lastName'] &&
                user['username'] &&
                user['email'] &&
                user['profilePicture'] &&
                user['plan'] &&
                ['BASIC', 'ADVANCED', 'PRO'].includes(user['plan'])
        )
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be BASIC, ADVANCED or PRO).',
        }
    }
    return { isValid: true }
}

function validateRequestAppClassesAndMaterials(message: any): ValidationResult {
    if (!message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestAppClassesAndMaterials. Missing courseId.',
        }
    }
    return { isValid: true }
}

function validateNotificationDeleteCourse(message: any): ValidationResult {
    if (!message['courseId']) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. Missing courseId.',
        }
    }

    if (message['classIds'] && !Array.isArray(message['classIds'])) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. classIds must be an array.',
        }
    }

    if (message['materialIds'] && !Array.isArray(message['materialIds'])) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. materialIds must be an array.',
        }
    }

    return { isValid: true }
}
