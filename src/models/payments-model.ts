import db from "../db/connection";
import { Payment } from "../db/tableTypes";

export const selectPaymentById = async (
  payment_id: number
): Promise<Payment> => {
  const result = await db.query<Payment>(
    `SELECT payment_id, user_id, event_id, amount, status, created_at FROM payments WHERE payment_id = $1`,
    [payment_id]
  );
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Payment not found" });
  }
  const payment = result.rows[0];
  payment.amount = Number(payment.amount); // Ensure amount is a number
  return payment;
};

export const selectPaymentsByUser = async (
  user_id: number
): Promise<Payment[]> => {
  const result = await db.query<Payment>(
    `SELECT payment_id, user_id, event_id, amount, status, created_at FROM payments WHERE user_id = $1`,
    [user_id]
  );
  return result.rows.map((payment) => ({
    ...payment,
    amount: Number(payment.amount), // Ensure amount is a number
  }));
};

export const insertPayment = async (
  paymentData: Partial<Payment>
): Promise<Payment> => {
  const { user_id, event_id, amount, status } = paymentData;

  if (!user_id || !event_id || amount === undefined) {
    throw { status: 400, msg: "user_id, event_id, and amount are required" };
  }

  const result = await db.query<Payment>(
    `INSERT INTO payments (user_id, event_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING payment_id, user_id, event_id, amount, status, created_at`,
    [user_id, event_id, amount, status || "pending"]
  );
  return result.rows[0];
};

export const updatePaymentStatus = async (
  payment_id: number,
  status: string
): Promise<Payment> => {
  const result = await db.query<Payment>(
    `UPDATE payments SET status = $1 WHERE payment_id = $2 RETURNING payment_id, user_id, event_id, amount, status, created_at`,
    [status, payment_id]
  );
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Payment not found" });
  }
  const payment = result.rows[0];
  payment.amount = Number(payment.amount); // Ensure amount is a number
  return payment;
};
