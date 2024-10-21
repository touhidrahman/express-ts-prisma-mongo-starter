import { Router } from 'express'
import { checkToken } from '../../middleware/check-token'
import { requireAdmin, requireUser } from '../../middleware/require-user'
import validate from '../../middleware/validate'
import { changeEmail, changeUserRole, confirmEmailChange, createAdminUser, createFirstAdmin, disableUser, forgotPassword, getAccessToken, getUserSessions, getUserUsingToken, login, logout, register, resendVerficiation, resetPassword, verifyEmail } from './auth.controller'
import { authSchema, forgotPasswordSchema, registerSchema, resetPasswordSchema } from './auth.schema'

const router = Router()

router.post('/v1/auth/register', validate(registerSchema), register)
router.post('/v1/auth/login', validate(authSchema), login)
router.delete('/v1/auth/logout', requireUser, logout)
router.get('/v1/auth/sessions', requireUser, getUserSessions)
router.post('/v1/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/v1/auth/reset-password/:token', checkToken('PasswordReset'), validate(resetPasswordSchema), resetPassword)
router.post('/v1/auth/change-password', requireUser, validate(resetPasswordSchema), resetPassword)
router.post('/v1/auth/resend-verification', requireUser, resendVerficiation)
router.post('/v1/auth/verify-email/:token', checkToken('EmailVerification'), verifyEmail)
router.post('/v1/auth/change-user-role/:id', requireAdmin, changeUserRole)
router.post('/v1/auth/disable-user/:id', requireAdmin, disableUser)
router.post('/v1/auth/change-email/:id', requireUser, validate(forgotPasswordSchema), changeEmail)
router.post('/v1/auth/change-email/:id/confirm/:token', checkToken('EmailChange'), confirmEmailChange)
router.post('/v1/auth/create-admin', requireAdmin, validate(registerSchema), createAdminUser)
router.post('/v1/auth/create-first-admin', validate(registerSchema), createFirstAdmin)
router.get('/v1/auth/me', requireUser, getUserUsingToken)
router.get('/v1/auth/refresh', getAccessToken)

export default router
