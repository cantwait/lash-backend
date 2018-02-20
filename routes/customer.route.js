const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/customer.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listCustomers,
  createCustomer,
  replaceCustomer,
  updateCustomer,
} = require('../validations/customer.validation')

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/customers List Customers
   * @apiDescription Get a list of Customers
   * @apiVersion 1.0.0
   * @apiName ListCustomers
   * @apiGroup Customer
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Customers per page
   * @apiParam  {String}             [name]       Customer's name
   * @apiParam  {String}             [email]      Customer's email
   * @apiParam  {String=Customer,admin}  [role]       Customer's role
   *
   * @apiSuccess {Object[]} Customers List of Customers.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Customers can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(LOGGED_USER), validate(listCustomers), controller.list)
  /**
   * @api {post} v1/Customers Create Customer
   * @apiDescription Create a new Customer
   * @apiVersion 1.0.0
   * @apiName CreateCustomer
   * @apiGroup Customer
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String{7..12}}      phone]    Customer's phone
   *
   * @apiSuccess (Created 201) {String}  id         Customer's id
   * @apiSuccess (Created 201) {String}  name       Customer's name
   * @apiSuccess (Created 201) {String}  email      Customer's email
   * @apiSuccess (Created 201) {String}  phone      Customer's phone
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated Customers can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createCustomer), controller.create);


router
  .route('/:customerId')
  /**
   * @api {get} v1/Customers/:id Get Customer
   * @apiDescription Get Customer information
   * @apiVersion 1.0.0
   * @apiName GetCustomer
   * @apiGroup Customer
   * @apiPermission Customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  phone       Customer's phone
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated Customers can access the data
   * @apiError (Forbidden 403)    Forbidden    Only Customer with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .get(authorize(LOGGED_USER), controller.get)
  /**
   * @api {put} v1/Customers/:id Replace Customer
   * @apiDescription Replace the whole Customer document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceCustomer
   * @apiGroup Customer
   * @apiPermission Customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String{7..12}}  [phone]    Customer's phone
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  phone       Customer's phone
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated Customers can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only Customer with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .put(authorize(LOGGED_USER), validate(replaceCustomer), controller.replace)
  /**
   * @api {patch} v1/Customers/:id Update Customer
   * @apiDescription Update some fields of a Customer document
   * @apiVersion 1.0.0
   * @apiName UpdateCustomer
   * @apiGroup Customer
   * @apiPermission Customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiParam  {String}             email     Customer's email
   * @apiParam  {String{6..128}}     password  Customer's password
   * @apiParam  {String{..128}}      [name]    Customer's name
   * @apiParam  {String{7..12}}  [phone]    Customer's phone
   * (You must be an admin to change the Customer's role)
   *
   * @apiSuccess {String}  id         Customer's id
   * @apiSuccess {String}  name       Customer's name
   * @apiSuccess {String}  email      Customer's email
   * @apiSuccess {String}  phone       Customer's phone
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated Customers can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only Customer with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Customer does not exist
   */
  .patch(authorize(LOGGED_USER), validate(updateCustomer), controller.update)
  /**
   * @api {patch} v1/Customers/:id Delete Customer
   * @apiDescription Delete a Customer
   * @apiVersion 1.0.0
   * @apiName DeleteCustomer
   * @apiGroup Customer
   * @apiPermission Customer
   *
   * @apiHeader {String} Athorization  Customer's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated Customers can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only Customer with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Customer does not exist
   */
  .delete(authorize(LOGGED_USER), controller.remove);


module.exports = router;