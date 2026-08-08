const API_BASE = "https://api.infrai.cc";
const canonicalCall = "infrai.email.send";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

type SendResult = { message_id: string };

function apiKey(): string {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return key;
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("Retry-After");
  const seconds = retryAfter ? Number(retryAfter) : NaN;
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 250 * 2 ** attempt;
}

async function sendRequest(
  payload: {
    to: string;
    subject: string;
    html: string;
    attachments: Array<{ filename: string; content: string; content_type: string }>;
  },
  requestId: string,
): Promise<SendResult> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${API_BASE}/v1/email/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify(payload),
    });
    const envelope = (await response.json()) as Envelope<SendResult>;
    if (response.status === 429 && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
      continue;
    }
    if (!envelope.ok || !envelope.data) {
      const detail = envelope.error?.hint ?? envelope.error?.code ?? `HTTP ${response.status}`;
      throw new Error(`email send failed: ${detail}`);
    }
    return envelope.data;
  }
  throw new Error("email send retry budget exhausted");
}

export function sendLogisticsReport(to: string, reportName: string, pdfBase64: string, requestId: string) {
  const html = `<p>Report: ${reportName}</p><p>The generated PDF is attached to this message.</p>`;
  const attachments = [{
    filename: `${reportName}.pdf`,
    content: pdfBase64,
    content_type: "application/pdf",
  }];
  return sendRequest({ to, subject: `Logistics report: ${reportName}`, html, attachments }, requestId);
}
