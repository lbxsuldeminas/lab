export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { nome, valor } = req.body;

    const token = process.env.MP_TOKEN;

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: `Inscrição LBX - ${nome}`,
        payment_method_id: "pix",
        payer: {
          email: "teste@teste.com"
        }
      })
    });

    const data = await response.json();

console.log(data); // 🔥 MOSTRA ERRO REAL

if (!data.point_of_interaction) {
  return res.status(400).json({
    erro: data
  });
}

return res.status(200).json({
  qr_base64: data.point_of_interaction.transaction_data.qr_code_base64
});

  } catch (err) {
    return res.status(500).json({
      erro: err.message
    });
  }
}
