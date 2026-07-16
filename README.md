# Angebote Helfer Web

Lovable/Vite frontend with a small Vercel API backend.

## Backend

- `GET /api/health` checks whether the API is reachable.
- `GET /api/offers` returns filtered recycling offers.
- `POST /api/requests` accepts recycling inquiries from the request dialog.

Set `REQUEST_WEBHOOK_URL` in Vercel to forward incoming inquiries to an external
tool such as Make, Zapier, a CRM, or an email service. Without that variable, the
API still validates the inquiry and logs it in the Vercel function logs.

## Demo Day monitoring

`POST /api/demo-day-tracking` records anonymous demo visits and serial-number
lookups. `GET /api/demo-day-tracking` returns the password-protected internal
dashboard data. No IP addresses, names, cookies, or browser fingerprints are
stored by this endpoint.

Set these environment variables in Vercel before enabling production tracking:

- `DEMO_DAY_ADMIN_PASSWORD`: password for the internal monitoring dialog.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`: REST credentials for a Vercel
  Marketplace Redis store. `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are supported as alternatives.
- `DEMO_DAY_TRACKING_KEY_PREFIX` (optional): separates multiple demo events in
  the same store.

The local Vite preview uses browser storage and the development password
`leaftronics-demo`; production never accepts that fallback password.
