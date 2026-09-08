# Tarot Lover V2 · 塔罗直觉缘分地测试

这是一个与原 `zhenhuan` 网站完全独立的 GitHub Pages 静态网站。

## V2 已包含
- 中国缘分版 / 世界缘分版双模式
- 12 道 7 秒限时直觉题
- 6 维关系磁场算法：情感温度、探索欲、稳定需求、浪漫感、独立度、深度连接
- 中国版 18 个城市结果
- 世界版 18 个国家结果
- TOP1 + TOP2 + TOP3 缘分地域
- 结果解释、相遇场景、Ta 的感觉、关键词
- 手机端沉浸式塔罗视觉
- Canvas 生成 750×1000 结果海报，可直接保存
- 测试码 UI 与本地演示验证
- 娱乐测试免责声明

## GitHub Pages 部署
1. 新建仓库 `tarot-lover`
2. 将本目录中的 `index.html`、`style.css`、`app.js` 上传到仓库根目录
3. Settings → Pages → Deploy from a branch → main / root
4. 页面通常会发布为：`https://你的用户名.github.io/tarot-lover/`

## 测试码
默认 `CONFIG.REQUIRE_CODE=false`，方便你先体验测试。
演示码：`DEMO2026` / `LOVE2026` / `TAROT2026`

要在前端强制输入测试码，可将 app.js 顶部：
`REQUIRE_CODE:false` 改为 `REQUIRE_CODE:true`。

注意：纯 GitHub Pages 前端无法安全实现“一码限用 10 次”。用户可以查看源码或清理浏览器数据，因此正式售卖时若需要可靠次数控制，应接一个后端/Serverless 数据库做授权验证。

## 商业使用提醒
文案目前明确标注为娱乐型直觉测试，不宣称真实预言、保证恋爱结果或真实未来地域。
