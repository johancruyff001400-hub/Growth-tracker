export async function POST(req) {
  const { goalName, log, lang } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Вот записи пользователя за последнюю неделю по цели "${goalName}":\n${log}\n\nНапиши короткий еженедельный отчёт на языке ${
            lang === "ru" ? "русском" : "английском"
          } (3-4 предложения): заметь паттерны, прогресс, и дай один конкретный совет на следующую неделю. Пиши тепло, без канцелярита. Ответь ТОЛЬКО текстом отчёта, без JSON и разметки.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.map((c) => c.text || "").join("").trim() || "";
  return Response.json({ text });
}
