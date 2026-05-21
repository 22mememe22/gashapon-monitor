export default async function handler(req, res) {
  const keyword = req.query.keyword;
  const target = req.query.target || "";

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

        // ❌ 最低限のノイズ除去だけ
        if (
          name.includes("ログイン") ||
          name.includes("会員") ||
          name.includes("LINE") ||
          name.includes("利用規約") ||
          name.length < 5
        ) {
          return;
        }

        // 🎯 ここが“完成の核”
        if (target && !name.includes(target)) {
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
      target,
      items
    });

  } catch (e) {
    return res.status(500).json({
      error: e.toString()
    });
  }
}