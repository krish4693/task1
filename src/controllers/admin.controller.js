const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const userService = require('../services/user.service');

/**
 * POST /v1/admin/users
 * Create a new user (or admin), only accessible by admins.
 */
const createUser = catchAsync(async (req, res) => {
  // req.body: { firstName, lastName, email, country, password, role? }
  const { role = 'user', ...userBody } = req.body;
  // Only allow creating admins if the caller is an admin
  if (role === 'admin' && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can create other admins');
  }
  const user = await userService.createUser({ ...userBody, role });
  res.status(httpStatus.CREATED).send(user);
});

/**
 * GET /v1/admin/users
 * List all users (or admins).
 */
const getUsers = catchAsync(async (req, res) => {
  const result = await userService.queryUsers(); // pagination if you like
  res.send(result);
});

module.exports = {
  createUser,
  getUsers,
};
