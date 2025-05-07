const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const adminValidation = require('../../validations/admin.validation');
const adminController = require('../../controllers/admin.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management
 */

/**
 * @swagger
 * /v1/admin/users:
 *   post:
 *     summary: Create a new user or admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - country
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *             example:
 *               firstName: Jane
 *               lastName: Doe
 *               email: jane.doe@example.com
 *               country: UK
 *               password: Test1234
 *               role: user
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden
 */

/**
 * @swagger
 * /v1/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router
  .route('/users')
  .post(
    auth(), // must be logged in
    validate(adminValidation.createUser),
    adminController.createUser
  )
  .get(
    auth(), // must be an admin
    adminController.getUsers
  );

module.exports = router;
