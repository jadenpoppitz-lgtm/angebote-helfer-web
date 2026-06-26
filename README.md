# Angebote Helfer Web

Lovable/Vite frontend with a small Vercel API backend.

## Backend

- `GET /api/health` checks whether the API is reachable.
- `GET /api/offers` returns filtered recycling offers.
- `POST /api/requests` accepts recycling inquiries from the request dialog.

Set `REQUEST_WEBHOOK_URL` in Vercel to forward incoming inquiries to an external
tool such as Make, Zapier, a CRM, or an email service. Without that variable, the
API still validates the inquiry and logs it in the Vercel function logs.
