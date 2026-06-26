export default function handler(_request, response) {
  response.status(200).json({
    ok: true,
    service: "angebote-helfer-web-api",
    timestamp: new Date().toISOString(),
  });
}
