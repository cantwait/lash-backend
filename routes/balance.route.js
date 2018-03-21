const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/balance.controller')
const { authorize, ADMIN, LOGGED_USER } = require('../middlewares/auth')
const {
  listBalances,
  createBalance,
  updateBalance,
} = require('../validations/balance.validation')

const router = express.Router()

router
  .route('/')
  .get(authorize(ADMIN), validate(listBalances), controller.list)
  .post(authorize(ADMIN), validate(createBalance), controller.create);

router
  .route('/:balId')
  .get(authorize(ADMIN), controller.get)
  .patch(authorize(ADMIN), validate(updateBalance), controller.update)
  .delete(authorize(ADMIN), controller.remove);

module.exports = router;
