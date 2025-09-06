import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { createUserSchema, updateUserSchema, idParamSchema, paginationSchema } from '@shared/types';

const router = Router();
const userController = new UserController();

router.get('/', validateQuery(paginationSchema), userController.getUsers);
router.get('/:id', validateParams(idParamSchema), userController.getUserById);
router.post('/', validateBody(createUserSchema), userController.createUser);
router.put('/:id', validateParams(idParamSchema), validateBody(updateUserSchema), userController.updateUser);
router.delete('/:id', validateParams(idParamSchema), userController.deleteUser);

export default router;