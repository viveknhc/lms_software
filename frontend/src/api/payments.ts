import client from "./client";

export interface Order {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  amount: string;
  currency: string;
  status: string;
  stripe_session_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentResult {
  status: string;
  course_slug?: string;
  course_title?: string;
  amount?: string;
  message?: string;
}

export const paymentsApi = {
  createCheckoutSession: (courseId: number) =>
    client.post<{ session_id: string; session_url: string; order_id: number }>(
      "/payments/checkout/",
      { course_id: courseId }
    ),

  listOrders: (params?: Record<string, string>) =>
    client.get<Order[]>("/payments/orders/", { params }),

  getOrder: (id: number) =>
    client.get<Order>(`/payments/orders/${id}/`),

  getPaymentStatus: (sessionId: string) =>
    client.get<PaymentResult>("/payments/status/", { params: { session_id: sessionId } }),
};
