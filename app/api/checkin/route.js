export async function POST(req) {
  const { goalName, checkinText, lang } = await req.json();

  const prompt = `Пользователь работает над целью "${goalName}". Отчёт за сегодня: "${checkinText}". Ответь ТОЛЬКО в JSON без markdown и без обратных кавычек: {"score": число 1-5, "comment": "короткий тёплый комментарий на языке ${
    lang === "ru" ? "русском" : "английском"
  }, 1-2 предложения"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ score: 3, comment: "Отмечено." });
  }
}
