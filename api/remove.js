export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { image, mask } = req.body;
  const token = process.env.REPLICATE_TOKEN;
  try {
    let r = await fetch("https://api.replicate.com/v1/models/zsxkib/refining-lama/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: { image: image, mask: mask }
      })
    });
    let pred = await r.json();
    if (pred.error) throw new Error(pred.error);
    while (pred.status !== 'succeeded' && pred.status !== 'failed' && pred.status !== 'canceled') {
      await new Promise(x => setTimeout(x, 2500));
      r = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      pred = await r.json();
    }
    if (pred.status !== 'succeeded') throw new Error(pred.error || 'Failed');
    const outputUrl = Array.isArray(pred.output) ? pred.output[0] : pred.output;
    const imgRes = await fetch(outputUrl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    res.status(200).json({ result: `data:image/png;base64,${buf.toString('base64')}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
