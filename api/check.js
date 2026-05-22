export default async function handler(req, res) {

  // ===== 監視店舗 =====

  const shops = [
    {
      name: "TSUTAYA金沢店",
      url: "https://gashapon.jp/shop/shop.php?shop_code=S90001298"
    },
    {
      name: "店舗2",
      url: "https://gashapon.jp/shop/shop.php?shop_code=S90000814"
    },
    {
      name: "店舗3",
      url: "https://gashapon.jp/shop/shop.php?shop_code=S90001036"
    }
  ];

  // ===== 監視商品 =====

  const target = "カードキャプターさくら";

  // ===== Discord =====

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1507021887686053949/5IpB-uO9tlYZ-pZ4pSONuW7be7nXLD_VZjaAG2fTP1lhxj-vL6AKsWDfZ8IKw5kMHkgo";

  try {

    const results = [];

    for (const shop of shops) {

      const response = await fetch(shop.url);
      const html = await response.text();

      const found = html.includes(target);

      results.push({
        shop: shop.name,
        found
      });

    }

    // ===== Discord通知 =====

    const message =
      results.map(r =>
        `${r.found ? "⭕" : "❌"} ${r.shop}`
      ).join("\n");

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content:
          `【${target} 店舗監視】\n\n${message}`
      })
    });

    return res.status(200).json({
      success: true,
      target,
      results
    });

  } catch (e) {

    return res.status(500).json({
      error: e.toString()
    });

  }

}