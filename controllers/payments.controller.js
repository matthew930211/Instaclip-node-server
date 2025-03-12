import Stripe from 'stripe';
import Subscription from '../models/Subscription.model.js';
const stripe = new Stripe(
    'sk_test_51O7yEaFTcxNo8mrkCqN2KL7Yun2jDzCQcOApJFq7B60D7rdkA1rFtV7sD5VqX2uDdTYewqJsH5rxHhSeDfdOZwxZ002L2BLFfS'
);

export const createStripeCheckoutSessionMonthly = async (req, res) => {
    try {
        const { userId, email } = req.body;

        // first time checking out in our app
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: process.env.CLIENT_URL + "/dashboard",
            cancel_url: process.env.CLIENT_URL + "/dashboard/settings/checkout-failed",
            payment_method_types: ["card"],
            billing_address_collection: "auto",
            customer_email: email,
            line_items: [
                {
                    price: "price_1Qds4hFTcxNo8mrknuTXW1h3",
                    quantity: 1,
                },
            ],
            mode: "subscription",
            // payment_method_collection : 'if_required',
            // the metadata is gonna be used to identify which user of ours purchased pro plan
            metadata: {
                userId,
                email,
            },
        });

        return res.status(200).json({
            url: stripeSession.url,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const createStripeCheckoutSessionYearly = async (req, res) => {
    try {
        const { userId, email } = req.body;

        // first time checking out in our app
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: process.env.CLIENT_URL + "/dashboard",
            cancel_url: process.env.CLIENT_URL + "/dashboard/settings/checkout-failed",
            payment_method_types: ["card"],
            billing_address_collection: "auto",
            customer_email: email,
            line_items: [
                {
                    price: "price_1Qdu5uFTcxNo8mrkMvOaddXp",
                    quantity: 1,
                },
            ],
            mode: "subscription",
            // payment_method_collection : 'if_required',
            // the metadata is gonna be used to identify which user of ours purchased pro plan
            metadata: {
                userId,
                email,
            },
        });

        return res.status(200).json({
            url: stripeSession.url,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const manageStripeBillings = async (req, res) => {
    try {
        const { userId } = req.body;

        const userSubscription = await Subscription.findOne({
            userId: userId,
        });

        if (userSubscription && userSubscription.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: process.env.CLIENT_URL + "/dashboard",
            });

            return res.status(200).json({ url: stripeSession.url });
        }
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}

export const checkStripeSubscription = async (req, res) => {
    try {
        const { userId } = req.body;

        const subscription = await Subscription.findOne({
            userId: userId,
        });

        if (!subscription) {
            return res.json({ userSubscription: null });
        }

        console.log("user found => ", subscription);
        return res.status(200).json({
            userSubscription: subscription,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}