export default async function handler(req, res) {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({
      error: "keyword required"
    });
  }

  const searchUrl =
    "https://gashapon.jp/products/result.php?search=" +
    encodeURIComponent(keyword);

  try {
    const response = await fetch(searchUrl);
    const html = await response.text();

    const items = [];

    const links = html.match(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g);

    if (links) {
      links.forEach((a) => {
        const name = a.replace(/<[^>]*>/g, "").trim();
        const hrefMatch = a.match(/href="([^"]+)"/);

        if (!name || !hrefMatch) return;

        const link = hrefMatch[1];

        // ❌ 完全ノイズ除去
        const badWords = [
          "ログイン",
          "会員",
          "登録",
          "LINE",
          "利用規約",
          "プライバシー",
          "ご利用",
          "よくある",
          "検索条件",
          "Cookies",
          "友だち追加",
          "送る",
          "新規会員",
          "FAQ",
          "アクセス",
          "ガシャポンどこ？",
          "妖怪ウォッチ",
          "クレヨンしんちゃん",
          "ハンターハンター",
          "めじるしアクセサリー"
        ];

        if (
          !name ||
          name.length < 6 ||
          badWords.some((w) => name.includes(w))
        ) {
          return;
        }

        // ❗「商品ページだけ」に限定
        if (!link.includes("/products/result.php")) {
          return;
        }

        // ❗さらに“検索キーワードURL系”は除外
        if (link.includes("?free=") && !name.includes(keyword)) {
          return;
        }

        let finalLink = link;
        if (!finalLink.startsWith("http")) {
          finalLink = "https://gashapon.jp" + finalLink;
        }

        items.push({
          name,
          link: finalLink
        });
      });
    }

    return res.status(200).json({
      success: true,
      keyword,
      items
    });

  } catch (e) {
    return res.status(500).json({
      error: e.toString()
    });
  }
}