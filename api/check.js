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

    const ishikawa =
      html.includes("石川県");

    return res.status(200).json({
      success: true,
      keyword,
      ishikawa_found: ishikawa,
      length: html.length
    });

  } catch (e) {

    return res.status(500).json({
      error: e.toString()
    });

  }

}