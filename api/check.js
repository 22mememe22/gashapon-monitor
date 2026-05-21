export default async function handler(req, res) {
  const list = req.body.list; // [{ title, url }]
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!list || !webhookUrl) {
    return res.status(400).json({
      error: "list or webhook missing"
    });
  }

  // 前回データ（本来はDB、簡易でメモリ想定）
  if (!global.prev) global.prev = {};

  const results = [];

  for (const item of list) {
    try {
      const response = await fetch(item.url);
      const html = await response.text();

      // 店舗名っぽいもの抽出（ここどこ想定）
      const matches = html.match(/<li[^>]*>(.*?)<\/li>/g) || [];

      const stores = matches
        .map(m => m.replace(/<[^>]*>/g, "").trim())
        .filter(Boolean);

      const prevStores = global.prev[item.title] || [];

      // 差分
      const added = stores.filter(x => !prevStores.includes(x));
      const removed = prevStores.filter(x => !stores.includes(x));

      // 保存更新
      global.prev[item.title] = stores;

      // 変化なしはスキップ
      if (added.length === 0 && removed.length === 0) {
        continue;
      }

      // Discordメッセージ作成
      let message = `**${item.title}**\n`;

      if (added.length > 0) {
        message += `🟢 入荷\n` + added.map(s => `+ ${s}`).join("\n") + "\n";
      }

      if (removed.length > 0) {
        message += `🔴 削除\n` + removed.map(s => `- ${s}`).join("\n") + "\n";
      }

      // Discord送信
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: message
        })
      });

      results.push({
        title: item.title,
        added,
        removed
      });

    } catch (e) {
      console.error(e);
    }
  }

  return res.status(200).json({
    success: true,
    results
  });
}