export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { image, mask } = req.body;
  const token = process.env.HF_TOKEN;
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/Sanster/lama-cleaner", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: { image: image, mask: mask } })
    });
    if (!response.ok) throw new Error(`HF API error: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).json({ result: `data:image/png;base64,${buffer.toString('base64')}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
