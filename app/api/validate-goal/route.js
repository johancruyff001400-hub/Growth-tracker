export async function POST(req) {
  const { goalName, lang } = await req.json();

  const prompt = `Пользователь хочет добавить цель для личного развития: "${goalName}".

Твоя задача — пропускать почти всё. Отклоняй ТОЛЬКО если цель:
- явный спам или набор случайных символов (например "asdasdasd", "123123")
- оскорбительная, содержит нецензурную брань или ненависть
- откровенно про незаконные/опасные для здоровья действия

Любая обычная цель — включая короткие и простые формулировки вроде "читать книги", "качать пресс", "спать больше", "меньше нервничать", "выучить язык" — ВСЕГДА valid=true. Не придирайся к формулировке, не требуй конкретики или деталей. Если сомневаешься — считай valid=true.

Ответь ТОЛЬКО в JSON без markdown: {"valid": true или false, "reason": "если valid=false — короткое дружелюбное объяснение на языке ${
    lang === "ru" ? "русском" : "английском"
  }, почему цель не подходит; если valid=true — пустая строка"}`;

  try {
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

    // Если Gemini вернул ошибку (неверный ключ, лимит, недоступная модель и т.п.) —
    // логируем и пропускаем цель, а не блокируем пользователя молча.
    if (!response.ok || data.error) {
      console.error("Gemini API error (validate-goal):", response.status, data.error || data);
      return Response.json({ valid: true, reason: "" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(clean);

    // Защита: если модель вернула JSON без поля valid (или не boolean) —
    // не считаем это отказом, пропускаем цель.
    if (typeof parsed.valid !== "boolean") {
      return Response.json({ valid: true, reason: "" });
    }

    return Response.json(parsed);
  } catch (e) {
    console.error("validate-goal route failed:", e);
    // Любая техническая ошибка (сеть, парсинг и т.п.) — пропускаем цель, а не блокируем.
    return Response.json({ valid: true, reason: "" });
  }
}
