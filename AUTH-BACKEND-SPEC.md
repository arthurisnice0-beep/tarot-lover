# 测试码后端接口规范（给后续开发使用）

## 推荐数据表
- code: string, unique
- total_uses: integer
- used_uses: integer
- status: active / disabled
- created_at
- expires_at: nullable

## 验证/扣次接口
POST `/redeem`

请求：
```json
{"code":"TAROT-ABC123","action":"consume"}
```

成功：
```json
{"ok":true,"remaining":9}
```

失败：
```json
{"ok":false,"reason":"invalid_or_exhausted"}
```

## 必须在服务端完成
- 检查 code 是否存在
- 检查是否禁用/过期
- 检查 remaining > 0
- 原子化扣减一次
- CORS 仅允许正式站点域名
- 做简单限流，避免同一 IP 高频撞码

不要把完整授权码列表、剩余次数或扣次逻辑写在 `app.js` 里。
