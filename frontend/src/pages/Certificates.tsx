import { useEffect, useState } from "react";
import { Award, ExternalLink, Search } from "lucide-react";
import toast from "react-hot-toast";
import { certificatesApi } from "../api/certificates";
import type { Certificate } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<Record<string, unknown> | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    certificatesApi
      .myCertificates()
      .then((res) => setCertificates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await certificatesApi.verifyCertificate(verifyCode.trim());
      setVerifyResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      toast.error(msg);
      setVerifyResult({ is_valid: false, message: "Certificate not found or revoked." });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <p className="text-gray-500">Your earned certificates and verification</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* My Certificates */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Certificates</h2>
          {certificates.length === 0 ? (
            <EmptyState
              title="No certificates yet"
              description="Complete courses to earn certificates"
              actionLabel="Browse Courses"
              actionTo="/courses"
            />
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cert.course_title}</p>
                      <p className="text-xs text-gray-500">
                        Issued {new Date(cert.issued_at).toLocaleDateString()}
                        {" · "}
                        Code: {cert.verification_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cert.pdf_file && (
                      <a
                        href={cert.pdf_file}
                        target="_blank"
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verify Certificate */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Verify Certificate</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600 mb-4">
              Enter a verification code to check if a certificate is authentic.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter code..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={handleVerify}
                disabled={verifying || !verifyCode.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {verifying ? "..." : "Verify"}
              </button>
            </div>

            {verifyResult && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${
                verifyResult.is_valid
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {verifyResult.is_valid ? (
                  <div>
                    <p className="font-medium">✓ Valid Certificate</p>
                    <p className="mt-1 text-xs opacity-75">
                      Issued to {verifyResult.student_name as string} for {verifyResult.course_title as string}
                    </p>
                  </div>
                ) : (
                  <p>✗ {verifyResult.message as string}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
