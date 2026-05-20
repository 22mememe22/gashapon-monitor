import * as cheerio from "cheerio";

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

    const $ = cheerio.load(html);

    const items = [];

    // とりあえずリンクベースで商品っぽいものを拾う
    $("a").each((i, el) => {
      const name = $(el).text().trim();
      const link = $(el).attr("href");

      // ノイズ除去（短すぎる文字は無視）
      if (name && name.length > 5 && link) {
        items.push({
          name,
          link: link.startsWith("http")
            ? link
            : "https://gashapon.jp" + link
        });
      }
    });

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