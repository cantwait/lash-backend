const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/product.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listProducts,
  createProduct,
  replaceProduct,
  updateProduct,
} = require('../validations/product.validation')

const router = express.Router()

/**
 * Load user when API with userId route parameter is hit
 */
// router.param('catId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/products List Product
   * @apiDescription Get a list of products
   * @apiVersion 1.0.0
   * @apiName ListProducts
   * @apiGroup Product
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Categories per page
   * @apiParam  {String}             [name]       Categry's name
   *
   * @apiSuccess {Object[]} users List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(ADMIN), validate(listProducts), controller.list)
  /**
   * @api {post} v1/users Create User
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateUser
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   *
   * @apiSuccess (Created 201) {String}  id             Product's id
   * @apiSuccess (Created 201) {String}  name           Product's name
   * @apiSuccess (Created 201) {String}  description    Product's description
   * @apiSuccess (Created 201) {String}  category       Product's category
   * @apiSuccess (Created 201) {Array}   pictures       Product's pictures
   * @apiSuccess (Created 201) {Float}   price          Product's price
   * @apiSuccess (Created 201) {Date}    createdAt      Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createProduct), controller.create);

router
  .route('/:pId')
  /**
   * @api {get} v1/products/:pId Get Product
   * @apiDescription Get Product information
   * @apiVersion 1.0.0
   * @apiName GetProduct
   * @apiGroup Product
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess {String}  id             Product's id
   * @apiSuccess {String}  name           Product's name
   * @apiSuccess {String}  description    Product's description
   * @apiSuccess {String}  category       Product's category
   * @apiSuccess {Array}   pictures       Product's pictures
   * @apiSuccess {Float}   price          Product's price
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .get(authorize(LOGGED_USER), controller.get)
  /**
   * @api {patch} v1/products/:pId Update Product
   * @apiDescription Update some fields of a product document
   * @apiVersion 1.0.0
   * @apiName UpdateProduct
   * @apiGroup Product
   * @apiPermission product
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    User's name
   * (You must be an admin to change the user's role)
   *
   * @apiSuccess {String}  id             Product's id
   * @apiSuccess {String}  name           Product's name
   * @apiSuccess {String}  description    Product's description
   * @apiSuccess {String}  category       Product's category
   * @apiSuccess {Array}   pictures       Product's pictures
   * @apiSuccess {Float}   price          Product's price
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(LOGGED_USER), validate(updateProduct), controller.update)
  /**
   * @api {patch} v1/products/:pId Delete Product
   * @apiDescription Delete a PRoduct
   * @apiVersion 1.0.0
   * @apiName DeleteProduct
   * @apiGroup Product
   * @apiPermission product
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(authorize(LOGGED_USER), controller.remove);


module.exports = router;