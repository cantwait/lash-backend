const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/session.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listSessions,
  createSession,
  updateSession,
} = require('../validations/session.validation')

const router = express.Router()

router
  .route('/')
  /**
   * @api {get} v1/sessions List Session
   * @apiDescription Get a list of sessions
   * @apiVersion 1.0.0
   * @apiName ListSessions
   * @apiGroup Session
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Sessions per page
   *
   * @apiSuccess {Object[]} Session List of sessions.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated categories can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(LOGGED_USER), validate(listSessions), controller.list)
  /**
   * @api {post} v1/sessions Create Session
   * @apiDescription Create a new sessio
   * @apiVersion 1.0.0
   * @apiName CreateSession
   * @apiGroup Session
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    Category's name
   *
   * @apiSuccess (Created 201) {String}  id         Category's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(LOGGED_USER), validate(createSession), controller.create);

router
  .route('/:sessId')
  /**
   * @api {patch} v1/sessions/:sessId Update Session
   * @apiDescription Update some fields of a session document
   * @apiVersion 1.0.0
   * @apiName UpdateSession
   * @apiGroup Session
   * @apiPermission session
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {String{..128}}      [name]    Category's name
   * (You must be an admin to change the user's role)
   *
   * @apiSuccess {String}  id         Session's id
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
   * @apiError (Not Found 404)    NotFound     Category does not exist
   */
  .patch(authorize(LOGGED_USER), validate(updateSession), controller.update)
  /**
   * @api {patch} v1/sessions/:sessId Delete Session
   * @apiDescription Delete a category
   * @apiVersion 1.0.0
   * @apiName DeleteSession
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
  .delete(authorize(ADMIN), controller.remove);


module.exports = router;