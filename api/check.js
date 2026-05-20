export default async function handler(req, res) {

  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({
      error: "keyword required"
    });
  }

  const url =
    "https://gashapon.jp/products/result.php?search=" +
    encodeURIComponent(keyword);

  return res.status(200).json({
    success: true,
    keyword,
    url
  });

}