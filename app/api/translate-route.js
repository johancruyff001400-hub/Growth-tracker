export async function POST(req) {
  const { langName, strings } = await req.json();
  const target = langName || "English";

  const prompt = `Переведи значения этого JSON-объекта с русского на ${target}
Это тексты интерфейса мобильного приложения-трекера привычек.
Правила:
- Ключи оставь БЕЗ ИЗМЕНЕНИЙ, переводи только значения (строки).
- Плейсхолдеры вида {d}, {g}, {n} переноси в перевод как есть, не переводи и не удаляй их.
- Сохраняй тон: короткий, живой, дружелюбный, без канцелярита.
- Ответь ТОЛЬКО валидным JSON, без markdown и пояснений — просто объект с теми же ключами.

Вот JSON:
${JSON.stringify(strings)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Gemini API error (translate):", response.status, data.error || data);
      return Response.json({ translations: null });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json({ translations: parsed });
  } catch (e) {
    console.error("translate route failed:", e);
    return Response.json({ translations: null });
  }
}
