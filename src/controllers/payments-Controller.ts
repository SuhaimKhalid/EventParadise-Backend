import { Request, Response, NextFunction } from "express";
import {
  selectPaymentById,
  selectPaymentsByUser,
  insertPayment,
  updatePaymentStatus,
} from "../models/payments-model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-09-30.clover",
});

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, event_id, amount } = req.body;

    if (!user_id || !event_id || !amount) {
      res
        .status(400)
        .json({ msg: "user_id, event_id and amount are required" });
      return;
    }

    // Convert amount in pounds to pence for Stripe
    const amountInPence = Math.round(Number(amount) * 100);

    const payment = await insertPayment({
      user_id,
      event_id,
      amount: Number(amount), // store original amount in GBP in DB
      status: "pending",
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // you can add "google_pay" if supported
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Event #${event_id} Payment`,
            },
            unit_amount: amountInPence, // send in pence
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?payment_id=${payment.payment_id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    // Send back the Checkout URL to the frontend
    res.status(201).json({ payment, checkout_url: session.url });
  } catch (err) {
    next(err);
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment_id = Number(req.params.id);
    if (isNaN(payment_id) || payment_id <= 0) {
      res.status(400).json({ msg: "Invalid payment ID" });
      return;
    }

    const payment = await selectPaymentById(payment_id);
    res.status(200).json({ payment });
  } catch (err) {
    next(err);
  }
};

export const getUserPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = Number(req.params.id);
    if (isNaN(user_id) || user_id <= 0) {
      res.status(400).json({ msg: "Invalid user ID" });
      return;
    }

    const payments = await selectPaymentsByUser(user_id);
    res.status(200).json({ payments });
  } catch (err) {
    next(err);
  }
};

export const patchPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment_id = Number(req.params.id);
    if (isNaN(payment_id) || payment_id <= 0) {
      res.status(400).json({ msg: "Invalid payment ID" });
      return;
    }

    const { status } = req.body;
    if (!status || status !== "success") {
      res.status(400).json({ msg: "Status must be 'success'" });
      return;
    }

    const payment = await selectPaymentById(payment_id);
    if (payment.status !== "pending") {
      res.status(400).json({
        msg: "Payment status can only be updated from 'pending' to 'success'",
      });
      return;
    }

    const updatedPayment = await updatePaymentStatus(payment_id, status);
    res.status(200).json({ payment: updatedPayment });
  } catch (err) {
    next(err);
  }
};
