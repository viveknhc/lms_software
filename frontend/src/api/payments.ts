import client from "./client";

export interface Order {
  id: number;
  user: number;
  user_name: string;
  course: number;
  course_title: string;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
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
};
