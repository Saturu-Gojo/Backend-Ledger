const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { strictLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  transferSchema,
  depositSchema,
  withdrawSchema,
} = require('../validators/transaction.validator');

const router = express.Router();

router.use(authMiddleware);

router.post('/transfer', strictLimiter, validate(transferSchema), transactionController.transfer);
router.post('/deposit', strictLimiter, validate(depositSchema), transactionController.deposit);
router.post('/withdraw', strictLimiter, validate(withdrawSchema), transactionController.withdraw);

router.get('/account/:accountId', transactionController.getHistory);
router.get('/:reference', transactionController.getByReference);

module.exports = router;
