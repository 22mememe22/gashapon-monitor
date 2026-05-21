export default async function handler(req, res) {

  // ===== 設定 =====
  const keyword = "ちいかわ";
  const target = "めじるしアクセサリー";

  const DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/1507021887686053949/5IpB-uO9tlYZ-pZ4pSONuW7be7nXLD_VZjaAG2fTP1lhxj-vL6AKsWDfZ8IKw5kMHkgo";

  // ===== 検索URL =====
  const searchUrl =
    "https://gashapon.jp/products/result.php?search=" +
    encodeURIComponent(keyword);

  try {

    // ガシャポンサイト取得
    const response = await fetch(searchUrl);
    const html = await response.text();

    // aタグ全部取得
    const links =
      html.match(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g) || [];

    const items = [];

    links.forEach((a) => {

      const name =
        a.replace(/<[^>]*>/g, "").trim();

      const hrefMatch =
        a.match(/href="([^"]+)"/);

      if (!hrefMatch) return;

      let link = hrefMatch[1];

      // 相対URL対応
      if (!link.startsWith("http")) {
        link = "https://gashapon.jp" + link;
      }

      // ターゲット商品だけ残す
      if (!name.includes(target)) return;

      // 商品ページだけ残す
      if (!link.includes("/products/")) return;

      items.push({
        name,
        link
      });

    });

    // ===== Discord通知 =====
    if (items.length > 0) {

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content:
            `【ガシャポン検知】\n` +
            `キーワード: ${keyword}\n` +
            `商品: ${target}\n\n` +
            items.map(i =>
              `・${i.name}\n${i.link}`
            ).join("\n\n")
        })
      });

    }

    // ===== 結果返却 =====
    return res.status(200).json({
      success: true,
      keyword,
      target,
      items
    });

  } catch (e) {

    return res.status(500).json({
      error: e.toString()
    });

  }

}