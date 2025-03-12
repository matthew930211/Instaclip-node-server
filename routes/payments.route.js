import express from "express"
import { createStripeCheckoutSessionMonthly, createStripeCheckoutSessionYearly, manageStripeBillings, checkStripeSubscription } from "../controllers/payments.controller.js"

const router = express.Router();

router.post("/stripe/create-checkout-session-monthly", createStripeCheckoutSessionMonthly);
router.post("/stripe/create-checkout-session-yearly", createStripeCheckoutSessionYearly);
router.post("/stripe/manage-billings", manageStripeBillings);
router.post("/stripe/check-subscription", checkStripeSubscription);

export default router