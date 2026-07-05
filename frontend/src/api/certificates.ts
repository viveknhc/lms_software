import type { Certificate } from "../types";
import client from "./client";

export const certificatesApi = {
  listCertificates: (params?: Record<string, string>) =>
    client.get<Certificate[]>("/certificates/certificates/", { params }),

  myCertificates: () =>
    client.get<Certificate[]>("/certificates/certificates/my_certificates/"),

  verifyCertificate: (code: string) =>
    client.post("/certificates/certificates/verify/", {
      verification_code: code,
    }),
};
