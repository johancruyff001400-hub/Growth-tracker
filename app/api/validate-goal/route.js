export async function POST(req) {
  const { goalName, lang } = await req.json();

  const prompt = `Пользователь хочет добавить цель для личного развития: "${goalName}".

Проверь эту цель:
1. Она осмысленная и относится к личному развитию/росту (учёба, здоровье, спорт, навык, привычка, творчество и т.п.)?
2. Она не является оскорбительной, бессмысленным набором символов, спамом или неприемлемым контентом?

Ответь ТОЛЬКО в JSON без markdown: {"valid": true или false, "reason": "если valid=false — короткое дружелюбное объяснение на языке ${
    lang === "ru" ? "русском" : "английском"
  }, почему цель не подходит и как её переформулировать; если valid=true — пустая строка"}`;

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
    // If validation fails technically, default to allowing the goal through
    return Response.json({ valid: true, reason: "" });
  }
}
