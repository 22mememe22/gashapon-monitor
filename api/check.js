export default async function handler(req, res) {

  // ===== 監視設定 =====

  const shop = {
    name: "TSUTAYA金沢店",
    url: "https://gashapon.jp/shop/shop.php?shop_code=S90001298"
  };

  const target = "カードキャプターさくら";

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1507021887686053949/5IpB-uO9tlYZ-pZ4pSONuW7be7nXLD_VZjaAG2fTP1lhxj-vL6AKsWDfZ8IKw5kMHkgo";

  try {

    // 店舗ページ取得
    const response = await fetch(shop.url);
    const html = await response.text();

    // 商品が存在するか判定
    const found = html.includes(target);

    // Discord通知
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content:
          found
            ? `【在庫あり】\n${shop.name}\n${target}`
            : `【在庫なし】\n${shop.name}\n${target}`
      })
    });

    return res.status(200).json({
      success: true,
      shop: shop.name,
      target,
      found
    });

  } catch (e) {

    return res.status(500).json({
      error: e.toString()
    });

  }

}