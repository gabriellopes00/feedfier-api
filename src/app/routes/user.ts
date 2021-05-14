import { Router } from 'express'
import { middlewareAdapter } from '../adapters/express-middlewares'
import { routerAdapter } from '../adapters/express-router'
import { addUserController } from '../builds/controllers/add-user'
import { deleteUserController } from '../builds/controllers/delete-user'
import { signInController } from '../builds/controllers/sign-in'
import { authMiddleware } from '../builds/middlewares/auth-user'

const router = Router()

router.post('/signup', routerAdapter(addUserController))
router.post('/signin', routerAdapter(signInController))
router.delete('/user', middlewareAdapter(authMiddleware), routerAdapter(deleteUserController))

export default router
