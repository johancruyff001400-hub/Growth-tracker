export async function POST(req) {
  const { goalName, checkinText, lang } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Пользователь работает над целью "${goalName}". Отчёт за сегодня: "${checkinText}". Ответь ТОЛЬКО в JSON без markdown: {"score": число 1-5, "comment": "короткий тёплый комментарий на языке ${
            lang === "ru" ? "русском" : "английском"
          }, 1-2 предложения"}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.map((c) => c.text || "").join("") || "{}";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ score: 3, comment: "Отмечено." });
  }
}
