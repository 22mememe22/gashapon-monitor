export default async function handler(req, res) {

  // ===== 監視設定 =====

  const shop = {
    name: "TSUTAYA金沢店",
    url: "https://gashapon.jp/shop/shop.php?shop_code=S90001298"
  };

  const target = "カードキャプターさくら";

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1507021887686053949/5IpB-uO9tlYZ-pZ4pSONuW7be7nXLD_VZjaAG2fTP1lhxj-vL6AKsWDfZ8IKw5kMHkgo";

  // ===== 前回状態保存用 =====
  global.previousFound =
    global.previousFound ?? null;

  try {

    // 店舗ページ取得
    const response = await fetch(shop.url);
    const html = await response.text();

    // 商品存在判定
    const found = html.includes(target);

    let message = null;

    // ===== 初回 =====
    if (global.previousFound === null) {

      message =
        `【監視開始】\n${shop.name}\n${target}\n現在: ${found ? "在庫あり" : "在庫なし"}`;

    }

    // ===== 入荷 =====
    else if (
      global.previousFound === false &&
      found === true
    ) {

      message =
        `【入荷】\n${shop.name}\n${target}`;

    }

    // ===== 削除 =====
    else if (
      global.previousFound === true &&
      found === false
    ) {

      message =
        `【削除】\n${shop.name}\n${target}`;

    }

    // 状態更新
    global.previousFound = found;

    // Discord通知
    if (message) {

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: message
        })
      });

    }

    return res.status(200).json({
      success: true,
      shop: shop.name,
      target,
      found,
      previousFound: global.previousFound
    });

  } catch (e) {

    return res.status(500).json({
      error: e.toString()
    });

  }

}