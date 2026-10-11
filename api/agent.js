import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message, storeInfo, conversation } = req.body;
    const systemPrompt = `You are a helpful AI shopping assistant for Shopify store: ${storeInfo?.name || 'this store'}.
    Store URL: ${storeInfo?.url || ''}.
    Products: ${JSON.stringify(storeInfo?.products || []).slice(0,3000)}
    Be friendly, help customers find products, answer questions. Speak in same language as customer.`;

    const messages = [
      { role: "system", content: systemPrompt },
     ...(conversation || []).slice(-10),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ reply: "Sorry, error: " + e.message });
  }
}
