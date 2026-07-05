import client from "./client";

export const paymentsApi = {
  createCheckoutSession: (courseId: number) =>
    client.post<{ session_id: string; session_url: string; order_id: number }>(
      "/payments/checkout/",
      { course_id: courseId }
    ),
};
