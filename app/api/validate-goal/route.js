export async function POST(req) {
  const { goalName, lang, langName } = await req.json();
  // langName приходит с фронта (например "Spanish", "Hindi") — так промпт
  // не завязан на конкретный список языков и работает для всех 50.
  const targetLanguage = langName || "Russian";

  const prompt = `Пользователь хочет добавить цель для личного развития: "${goalName}".

Твоя задача — пропускать почти всё. Отклоняй ТОЛЬКО если цель:
- явный спам или набор случайных символов (например "asdasdasd", "123123")
- оскорбительная, содержит нецензурную брань или ненависть
- откровенно про незаконные/опасные для здоровья действия

Любая обычная цель — включая короткие и простые формулировки вроде "читать книги", "качать пресс", "спать больше", "меньше нервничать", "выучить язык" — ВСЕГДА valid=true. Не придирайся к формулировке, не требуй конкретики или деталей. Если сомневаешься — считай valid=true.

Ответь ТОЛЬКО в JSON без markdown: {"valid": true или false, "reason": "если valid=false — короткое дружелюбное объяснение на языке ${targetLanguage}, почему цель не подходит; если valid=true — пустая строка"}`;

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
      console.error("Gemini API error (validate-goal):", response.status, data.error || data);
      return Response.json({ valid: true, reason: "" });
    }

    // Если сам промпт заблокирован фильтром безопасности Gemini (или ответ
    // остановлен по причине SAFETY) — это почти всегда значит, что цель
    // содержит недопустимый контент (мат/оскорбления). В этом случае
    // отклоняем, а не пропускаем "по умолчанию".
    const candidate = data.candidates?.[0];
    if (data.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
      console.warn("validate-goal blocked by safety filter:", data.promptFeedback?.blockReason || candidate?.finishReason);
      return Response.json({ valid: false, reason: "" });
    }

    const text = candidate?.content?.parts?.[0]?.text || "";
    if (!text) {
      // Пустой ответ без признаков safety-блокировки — считаем техническим
      // сбоем и пропускаем цель, чтобы не блокировать пользователя зря.
      return Response.json({ valid: true, reason: "" });
    }
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.valid !== "boolean") {
      return Response.json({ valid: true, reason: "" });
    }

    return Response.json(parsed);
  } catch (e) {
    console.error("validate-goal route failed:", e);
    return Response.json({ valid: true, reason: "" });
  }
}
