# 塔罗直觉测试｜未来另一半来自哪里？ V3

这是一个与 `zhenhuan` 完全独立的静态网站项目，可单独部署到 GitHub Pages。

## 已包含
- 中国缘分版 / 世界缘分版
- 12 道 7 秒限时直觉题
- 6 维缘分磁场：情感温度、探索欲、稳定需求、浪漫感、独立度、深度连接
- TOP1 + TOP2 + TOP3 缘分地域
- 塔罗人格原型标签
- 结果解析 / 相遇场景 / Ta 的气质
- 750×1000 结果海报生成
- 一键复制结果文案
- 测试码接口预留
- 移动端优先设计

## 部署
1. 新建仓库：`tarot-lover`
2. 把本文件夹全部文件上传到仓库根目录
3. GitHub → Settings → Pages → Deploy from a branch → `main` / root
4. 访问：`https://你的用户名.github.io/tarot-lover/`

## 测试码
打开 `config.js`：

```js
window.TAROT_CONFIG = {
  REQUIRE_CODE: false,
  AUTH_API_URL: "",
  ...
};
```

本地测试保持 `REQUIRE_CODE:false`。

正式售卖时建议：
- `REQUIRE_CODE:true`
- `AUTH_API_URL` 填写自己的授权接口

前端会发送：

```json
{"code":"TAROT-XXXXXX","action":"consume"}
```

建议接口返回：

```json
{"ok":true,"remaining":9}
```

> 注意：GitHub Pages 是纯前端，不能安全地把“一个码只能用 10 次”完全写在浏览器中。正式售卖应使用云函数/轻量后端保存剩余次数。

## 演示码
- DEMO2026
- LOVE2026
- TAROT2026

## 平台表达建议
产品定位使用“趣味测试 / 直觉测试 / 娱乐互动”，不要使用“保证预测”“算准未来配偶”等承诺式表达。
