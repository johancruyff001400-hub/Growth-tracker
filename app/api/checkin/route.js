export async function POST(req) {
  const { goalName, checkinText, lang, langName } = await req.json();
  const targetLanguage = langName || "Russian";

  const prompt = `Пользователь работает над целью "${goalName}". Отчёт за сегодня: "${checkinText}".

Сначала определи: этот отчёт реально относится к указанной цели (не полная бессмыслица, не про что-то совсем другое, не пустой набор символов)?

Ответь ТОЛЬКО в JSON без markdown и без обратных кавычек: {"relevant": true или false, "score": число 1-5 (если relevant=false, ставь 0), "comment": "если relevant=true — короткий тёплый комментарий на языке ${targetLanguage}, 1-2 предложения; если relevant=false — вежливо объясни на языке ${targetLanguage}, что запись не похожа на прогресс по цели '${goalName}', и попроси написать, что реально было сделано"}`;

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
      console.error("Gemini API error (checkin):", response.status, data.error || data);
      return Response.json({ relevant: true, score: 3, comment: "" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.relevant !== "boolean") parsed.relevant = true;
    if (typeof parsed.score !== "number") parsed.score = 3;
    if (typeof parsed.comment !== "string") parsed.comment = "";

    return Response.json(parsed);
  } catch (e) {
    console.error("checkin route failed:", e);
    return Response.json({ relevant: true, score: 3, comment: "" });
  }
}
