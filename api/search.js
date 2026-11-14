export default async function handler(req, res) {
  const { city = "", type = "" } = req.query;
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing API key" });

  const query = `${type} في ${city}`.trim();
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.nationalPhoneNumber,places.websiteUri"
    },
    body: JSON.stringify({ textQuery: query, languageCode: "ar", maxResultCount: 20 })
  });
  const data = await r.json();
  const places = (data.places || []).map(p => ({
    name: p.displayName?.text || "",
    phone: p.nationalPhoneNumber || "",
    website: p.websiteUri || ""
  }));
  res.status(r.ok ? 200 : r.status).json({ places, error: data.error?.message });
}
