import { getIAReply } from "@/lib/whatsapp/gpt";
import { menu } from "@/lib/whatsapp/data/menu";
import { getStructuredOrder } from "@/lib/whatsapp/data/structure";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    const reply = await getIAReply({
      message,
      menu,
      structure: getStructuredOrder(menu),
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error en webhook:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
