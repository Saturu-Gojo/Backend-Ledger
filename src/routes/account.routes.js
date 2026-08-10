const express = require("express");
const accountController = require("../controllers/account.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", accountController.createAccount);
router.get("/me", accountController.getMyAccounts);
router.get("/all", roleMiddleware("admin"), accountController.getAllAccounts);
router.get("/:id", accountController.getAccountById);

router.patch(
  "/:id/freeze",
  roleMiddleware("admin"),
  accountController.freezeAccount,
);
router.patch(
  "/:id/unfreeze",
  roleMiddleware("admin"),
  accountController.unfreezeAccount,
);

module.exports = router;
