const { Customer } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all customers with optional search on name or email.
 * @param {{ search?: string }} query
 * @returns {Promise<Customer[]>}
 */
const getCustomers = async ({ search } = {}) => {
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  return Customer.findAll({ where, order: [['createdAt', 'DESC']] });
};

/**
 * Create a new customer.
 * @param {object} data
 * @returns {Promise<Customer>}
 */
const createCustomer = async (data) => {
  return Customer.create(data);
};

/**
 * Update an existing customer by ID.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<Customer>}
 */
const updateCustomer = async (id, data) => {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }
  await customer.update(data);
  return customer;
};

/**
 * Delete a customer by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
const deleteCustomer = async (id) => {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const err = new Error('Customer not found');
    err.statusCode = 404;
    throw err;
  }
  await customer.destroy();
};

/**
 * Get aggregate customer statistics.
 * @returns {Promise<object>}
 */
const getCustomerStats = async () => {
  const total = await Customer.count();
  const active = await Customer.count({ where: { status: 'active' } });
  const totalSpent = (await Customer.sum('totalSpent')) || 0;
  return { total, active, totalSpent };
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerStats };
