import fs from “fs”;
import path from “path”;

const STATE_PATH = path.join(process.cwd(), “state.json”);

export default async function handler(req, res) {

// ===== 監視店舗 =====

const shops = [
{
name: “TSUTAYA金沢店”,
url: “https://gashapon.jp/shop/shop.php?shop_code=S90001298”
},
{
name: “店舗2”,
url: “https://gashapon.jp/shop/shop.php?shop_code=S90000814”
},
{
name: “店舗3”,
url: “https://gashapon.jp/shop/shop.php?shop_code=S90001036”
}
];

// ===== 監視商品 =====

const target = “カードキャプターさくら”;

// ===== Discord =====

const DISCORD_WEBHOOK_URL = “https://discord.com/api/webhooks/1507021887686053949/5IpB-uO9tlYZ-pZ4pSONuW7be7nXLD_VZjaAG2fTP1lhxj-vL6AKsWDfZ8IKw5kMHkgo";

try {

// ===== 前回状態読み込み =====
let shopStates = {};
if (fs.existsSync(STATE_PATH)) {
  const raw = fs.readFileSync(
    STATE_PATH,
    "utf-8"
  );
  shopStates = JSON.parse(raw);
}
const results = [];
const notifications = [];
for (const shop of shops) {
  // 店舗ページ取得
  const response = await fetch(shop.url);
  const html = await response.text();
  // 商品存在判定
  const found = html.includes(target);
  // 前回状態
  const previous =
    shopStates[shop.name];
  // ===== 初回 =====
  if (previous === undefined) {
    notifications.push(
      `👀 ${shop.name}\n現在: ${found ? "在庫あり" : "在庫なし"}`
    );
  }
  // ===== 入荷 =====
  else if (
    previous === false &&
    found === true
  ) {
    notifications.push(
      `🟢 入荷\n${shop.name}`
    );
  }
  // ===== 削除 =====
  else if (
    previous === true &&
    found === false
  ) {
    notifications.push(
      `🔴 削除\n${shop.name}`
    );
  }
  // 状態更新
  shopStates[shop.name] =
    found;
  results.push({
    shop: shop.name,
    found,
    previous
  });
}
// ===== state.json 保存 =====
fs.writeFileSync(
  STATE_PATH,
  JSON.stringify(
    shopStates,
    null,
    2
  )
);
// ===== Discord通知 =====
if (notifications.length > 0) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content:
        `【${target} 監視】\n\n` +
        notifications.join("\n\n")
    })
  });
}
return res.status(200).json({
  success: true,
  target,
  results,
  notifications
});

} catch (e) {

return res.status(500).json({
  error: e.toString()
});

}

}