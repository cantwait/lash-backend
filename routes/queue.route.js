const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/queue.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listQueues,
  createQueue,
} = require('../validations/queue.validation')

const router = express.Router()

/**
 * Load user when API with userId route parameter is hit
 */
// router.param('catId', controller.load);

router
  .route('/')
  /**
   * @api {get} v1/queues List Queue
   * @apiDescription Get a list of queues
   * @apiVersion 1.0.0
   * @apiName ListQueues
   * @apiGroup Category
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Queues per page
   * @apiParam  {String}             [name]       Queue's name
   *
   * @apiSuccess {Object[]} queues List of Queue.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated categories can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(LOGGED_USER), validate(listQueues), controller.list)
  /**
   * @api {post} v1/queues Create Category
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
  .post(authorize(LOGGED_USER), validate(createQueue), controller.create);

router
  .route('/:qId')
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


module.exports = router;