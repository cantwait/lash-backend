const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/category.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listCategories,
  createCategory,
  replaceCategory,
  updateCategory,
} = require('../validations/category.validation')

const router = express.Router()

/**
 * Load user when API with userId route parameter is hit
 */
// router.param('catId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/categories List Category
   * @apiDescription Get a list of categories
   * @apiVersion 1.0.0
   * @apiName ListCategories
   * @apiGroup Category
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Categories per page
   * @apiParam  {String}             [name]       Categry's name
   *
   * @apiSuccess {Object[]} categories List of categories.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated categories can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(ADMIN), validate(listCategories), controller.list)
  /**
   * @api {post} v1/categories Create Category
   * @apiDescription Create a new category
   * @apiVersion 1.0.0
   * @apiName CreateCategory
   * @apiGroup Category
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    Category's name
   *
   * @apiSuccess (Created 201) {String}  id         Category's id
   * @apiSuccess (Created 201) {String}  name       Category's name
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(ADMIN), validate(createCategory), controller.create);

router
  .route('/:catId')
  /**
   * @api {get} v1/categories/:id Get Category
   * @apiDescription Get category information
   * @apiVersion 1.0.0
   * @apiName GetCategry
   * @apiGroup Category
   * @apiPermission user
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess {String}  id         Category's id
   * @apiSuccess {String}  name       Category's name
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can access the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can access the data
   * @apiError (Not Found 404)    NotFound     Category does not exist
   */
  .get(authorize(LOGGED_USER), controller.get)
  /**
   * @api {put} v1/categories/:id Replace Category
   * @apiDescription Replace the whole category document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceCategory
   * @apiGroup Category
   * @apiPermission categorh
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    Category's name
   *
   * @apiSuccess {String}  id         Category's id
   * @apiSuccess {String}  name       Category's name
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Category does not exist
   */
  .put(authorize(LOGGED_USER), validate(replaceCategory), controller.replace)
  /**
   * @api {patch} v1/categories/:id Update Category
   * @apiDescription Update some fields of a category document
   * @apiVersion 1.0.0
   * @apiName UpdateCategory
   * @apiGroup Category
   * @apiPermission category
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    Category's name
   * (You must be an admin to change the user's role)
   *
   * @apiSuccess {String}  id         Category's id
   * @apiSuccess {String}  name       Category's name
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Category does not exist
   */
  .patch(authorize(LOGGED_USER), validate(updateCategory), controller.update)
  /**
   * @api {patch} v1/categories/:id Delete Category
   * @apiDescription Delete a category
   * @apiVersion 1.0.0
   * @apiName DeleteCategory
   * @apiGroup Category
   * @apiPermission category
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
   * @apiError (Not Found 404)    NotFound      Category does not exist
   */
  .delete(authorize(LOGGED_USER), controller.remove);

router
  .route('/:catId/products')
    .get(authorize(LOGGED_USER), controller.getProductsPerCat);


module.exports = router;