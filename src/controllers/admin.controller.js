// src/controllers/admin.controller.js
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const userService = require('../services/user.service');
const logger = require('../config/logger'); // adjust path as needed

/**
 * POST /v1/admin/users
 * Create a new user (or admin), only accessible by admins.
 */
const createUser = catchAsync(async (req, res) => {
  const { role = 'user', ...userBody } = req.body;

  // Authorization check
  if (role === 'admin' && req.user.role !== 'admin') {
    logger.warn('User %s attempted to create admin account without permission', req.user.email);
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can create other admins');
  }

  // Create and log
  const user = await userService.createUser({ ...userBody, role });
  logger.info('User %s created new %s account: %s', req.user.email, role, user.email);

  res.status(httpStatus.CREATED).send(user);
});

/**
 * GET /v1/admin/users
 * List all users (or admins).
 */
const getUsers = catchAsync(async (req, res) => {
  const result = await userService.queryUsers();
  logger.info('User %s fetched user list (count: %d)', req.user.email, result.results.length);
  res.send(result);
});

module.exports = {
  createUser,
  getUsers,
};
