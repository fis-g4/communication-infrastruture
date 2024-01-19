interface ValidationResult {
    isValid: boolean
    errorMessage?: string
}

export function validateMessage(
    operationId: string,
    message: any
): ValidationResult {
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
    if (!Array.isArray(message.usernames) || message.usernames.length === 0) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestAppUsers. Missing usernames',
        }
    }
    return { isValid: true }
}

function validateNotificationNewPlanPayment(message: any): ValidationResult {
    if (
        !message.username ||
        !message.plan ||
        !['FREE', 'ADVANCED', 'PRO'].includes(message.plan)
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationNewPlanPayment. Missing username or plan, or invalid value for plan (FREE, ADVANCED, PRO)',
        }
    }
    return { isValid: true }
}
function validateNotificationUserDeletion(message: any): ValidationResult {
    if (!message.username) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationUserDeletion. Missing username',
        }
    }
    return { isValid: true }
}
function validatePublishNewCourseAccess(message: any): ValidationResult {
    if (!message.username || !message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: publishNewCourseAccess. Missing username or courseId.',
        }
    }
    return { isValid: true }
}

function validatePublishNewMaterialAccess(message: any): ValidationResult {
    if (!message.username || !message.materialId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: publishNewMaterialAccess. Missing username or materialId',
        }
    }
    return { isValid: true }
}

function validateResponseAppClassesAndMaterials(
    message: any
): ValidationResult {
    if (!message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. Missing courseId.',
        }
    }

    if (!Array.isArray(message.classIds) || message.classIds.length === 0) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. Missing classIds.',
        }
    }

    if (
        !Array.isArray(message.materialIds) ||
        message.materialIds.length === 0
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppClassesAndMaterials. Missing materialIds.',
        }
    }

    return { isValid: true }
}

function validateNotificationNewClass(message: any): ValidationResult {
    if (!message.classId || !message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationNewClass. Missing classId or courseId.',
        }
    }
    return { isValid: true }
}

function validateNotificationDeleteClass(message: any): ValidationResult {
    if (!message.classId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteClass. Missing classId.',
        }
    }
    return { isValid: true }
}
function validateNotificationAssociateMaterial(message: any): ValidationResult {
    if (!message.materialId || !message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationAssociateMaterial. Missing materialId or courseId.',
        }
    }
    return { isValid: true }
}

function validateNotificationDisassociateMaterial(
    message: any
): ValidationResult {
    if (!message.materialId || !message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDisassociateMaterial. Missing materialId or courseId.',
        }
    }
    return { isValid: true }
}
function validateRequestMaterialReviews(message: any): ValidationResult {
    if (!message.materialId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestMaterialReviews. Missing materialId',
        }
    }
    return { isValid: true }
}

function validateResponseMaterialReviews(message: any): ValidationResult {
    if (!message.materialId || !message.review) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseMaterialReviews. Missing materialId or review',
        }
    }
    if (
        !(
            message.review === null ||
            (Number.isInteger(message.review) &&
                message.review >= 1 &&
                message.review <= 5)
        )
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseMaterialReviews. Invalid review value (must be an integer between 1 and 5 or null)',
        }
    }

    return { isValid: true }
}

function validateResponseAppUsers(message: any): ValidationResult {
    if (!Array.isArray(message.users) || message.users.length === 0) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppUsers. Missing users.',
        }
    }

    if (
        !message.users.every(
            (user: any) =>
                user.firstName &&
                user.lastName &&
                user.username &&
                user.email &&
                user.profilePicture &&
                user.plan &&
                ['FREE', 'ADVANCED', 'PRO'].includes(user.plan)
        )
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: responseAppUsers. Missing properties in user object (firstName, lastName, username, email, profilePicture, plan) or invalid plan value (must be FREE, ADVANCED or PRO).',
        }
    }
    return { isValid: true }
}

function validateRequestAppClassesAndMaterials(message: any): ValidationResult {
    if (!message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: requestAppClassesAndMaterials. Missing courseId',
        }
    }
    return { isValid: true }
}

function validateNotificationDeleteCourse(message: any): ValidationResult {
    if (!message.courseId) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. Missing courseId.',
        }
    }

    if (!Array.isArray(message.classIds) || message.classIds.length === 0) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. Missing classIds.',
        }
    }

    if (
        !Array.isArray(message.materialIds) ||
        message.materialIds.length === 0
    ) {
        return {
            isValid: false,
            errorMessage:
                'Invalid message for operationId: notificationDeleteCourse. Missing materialIds.',
        }
    }

    return { isValid: true }
}
