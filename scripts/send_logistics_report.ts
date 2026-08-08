import { readFile } from "node:fs/promises";
import { sendLogisticsReport } from "../src/report_mailer.ts";

const to = process.env.LOGISTICS_EMAIL_TO;
const pdfPath = process.env.LOGISTICS_PDF_PATH;
if (!to || !pdfPath) throw new Error("LOGISTICS_EMAIL_TO and LOGISTICS_PDF_PATH are required");

const pdfBase64 = (await readFile(pdfPath)).toString("base64");
const result = await sendLogisticsReport(to, "daily-dispatch", pdfBase64, `daily-dispatch-${new Date().toISOString().slice(0, 10)}`);
console.log(`sent logistics report: ${result.message_id}`);
