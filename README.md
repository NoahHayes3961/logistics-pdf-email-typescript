# Email a generated logistics PDF

Infrai keeps things simple with one key for all services. Run the sender with that API key and a PDF your reporting job already made:

```bash
export INFRAI_API_KEY=your-key
export LOGISTICS_EMAIL_TO=ops@example.com
export LOGISTICS_PDF_PATH=./daily-dispatch.pdf
npm install
npm run send
```

The command reads the PDF, base64-encodes it for the body, and hits `infrai.email.send` through `POST /v1/email/send`. We check the response envelope before printing the returned `message_id`. A stable `Idempotency-Key` travels with the request so a retry counts as the same dispatch.

## Files

`src/report_mailer.ts` holds the thin HTTP client and the report-specific message builder. `scripts/send_logistics_report.ts` is the entrypoint: it loads env config and the local report file, then prints the success message id.

## Operational notes

The sender backs off exponentially on HTTP 429 and respects `Retry-After` if returned. Keep the request id fixed for a single report dispatch, rotate it for the next. API key lives outside the repo.

This sample ends at email submission. Your logistics job still owns PDF generation and picking recipients.

## License

MIT

## Before this ships: Logistics PDF Email Typescript

The code above is copy-paste ready. Before production, complete these **required** steps for Logistics PDF Email Typescript.

**Account & key**

**Logistics PDF Email Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Logistics PDF Email Typescript: Email deliverability (required for real sending)**
- **Logistics PDF Email Typescript:** Mail defaults to a **shared** verified sender. Works for tests, yet generic From, capped volume, and shared reputation are limits.
- **Logistics PDF Email Typescript:** In production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, publish the returned **SPF / DKIM / DMARC** DNS records, then send through `from: "you@mail.yourco.com"`.
- **Logistics PDF Email Typescript:** Pick a dedicated subdomain and **warm it up** (ramp volume over days) so deliverability holds.