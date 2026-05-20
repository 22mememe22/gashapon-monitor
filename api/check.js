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
        const text = a.replace(/<[^>]*>/g, "").trim();
        const hrefMatch = a.match(/href="([^"]+)"/);

        if (text && text.length > 5 && hrefMatch) {
          let link = hrefMatch[1];

          if (!link.startsWith("http")) {
            link = "https://gashapon.jp" + link;
          }

          items.push({
            name: text,
            link
          });
        }
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