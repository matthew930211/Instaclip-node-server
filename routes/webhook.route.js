import express from "express"
import User from "../models/User.model.js"
import Stripe from 'stripe';
import Subscription from '../models/Subscription.model.js';
const stripe = new Stripe(
    'sk_test_51O7yEaFTcxNo8mrkCqN2KL7Yun2jDzCQcOApJFq7B60D7rdkA1rFtV7sD5VqX2uDdTYewqJsH5rxHhSeDfdOZwxZ002L2BLFfS'
);

const router = express.Router();

router.post("/clerk-webhook", async (req, res) => {
    const body = req.body;

    console.log("webhook received ab : ", body);

    if (body.type === "user.created") {
        try {

            const userId = body.data.id;
            const email_address = body.data.email_addresses[0].email_address;
            const username = body.data.first_name + " " + body.data.last_name;
            const profile_image_url = body.data.profile_image_url;

            const existedUser = await User.findOne({ email: email_address });
            console.log({
                clerk_user_id: userId,
                username: username,
                email: email_address,
                image: profile_image_url,
            });
            if (!existedUser) {
                await User.updateOne({
                    email: email_address
                }, {
                    clerk_user_id: userId,
                    username: username,
                    email: email_address,
                    image: profile_image_url,
                }, {
                    upsert: true
                });

                res.end();
            }
        } catch (err) {
            console.log(
                "error occured in clerk-webhook while creating the user => ",
                err
            );
        }
    }

    if (body.type === "user.updated") {
        try {
            connectToDB();

            const clerk_user_id = body.data.id;
            const email_address = body.data.email_addresses[0].email_address;
            const username = body.data.first_name + " " + body.data.last_name;
            const profile_image_url = body.data.profile_image_url;

            const existedUser = await User.findOne({ email: email_address });

            const data = {
                clerk_user_id,
                email: email_address,
                username,
                image: profile_image_url,
            };
            if (existedUser) {
                const updateUser = await User.findByIdAndUpdate(existedUser._id, data, {
                    new: true,
                });
            }
            console.log(body);

            res.end();
        } catch (err) {
            console.log(
                "error occured in clerk webhook while updating user => ",
                err
            );
        }
    }

    if (body.type === "user.deleted") {
        try {
            const user = await User.findOne({ clerk_user_id: body.data.id });

            if (user) {
                await User.findByIdAndDelete(user._id);
                res.end();
            }
        } catch (err) {
            console.log("error in clerk webhook while deleting the user => ", err);
        }
    }
})

const deleteSubscription = async(id) => {
    await Subscription.findOneAndDelete({ stripeSubscriptionId: id });
  }

router.post("/stripe-webhook",  express.raw({ type: "application/json" }), (req, res) => {
    let data;
    // console.log(req.body);
    // console.log("headers => ", req.headers);
    let eventType;
    const sig = req.headers["stripe-signature"];
    let endpointSecret;
    if (endpointSecret) {
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(
          JSON.stringify(req.body),
          sig,
          endpointSecret
        );
        console.log("webhook verified");
      } catch (err) {
        console.log(`Stripe Webhook Error: ${err.message}`);
        response.status(400).send(`Stripe Webhook Error: ${err.message}`);
        return;
      }
  
      data = event.data.object;
      // console.log("data in webhook -> ", data);
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }
    // Handle the event
    if (eventType === "checkout.session.completed") {
      console.log("checkout session completed data => ", data);
      console.log("data.subsciption => ", data.subscription);
      stripe.subscriptions
        .retrieve(data.subscription)
        .then((subscription) => {
          // createOrder(customer, data);
          console.log("subscription created => ", subscription);
          const newUser = new Subscription({
            email: data?.metadata?.email,
            userId: data?.metadata?.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          });
  
          newUser.save();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  
    // if plan renewed or canceled
    if (eventType === "invoice.payment_succeeded") {
      const subscription = stripe.subscriptions
        .retrieve(data.subscription)
        .then((subscription) => {
          const userSubscription = Subscription.findOneAndUpdate(
            { stripeCustomerId: subscription.id },
            {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
            { new: true }
          );
        });
    }
  
    // delete subscription from database on subscripiion deleted
    if(eventType === "customer.subscription.deleted"){
      console.log("subscription deleted => ", data);
      
      deleteSubscription(data.id);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  })

export default router