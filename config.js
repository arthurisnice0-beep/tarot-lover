// V3 商用配置
// 1) 本地测试：REQUIRE_CODE=false
// 2) 上架售卖：REQUIRE_CODE=true，并把 AUTH_API_URL 指向你自己的授权接口。
//    接口建议：POST {code, action:"consume"} -> {ok:true, remaining:9}
window.TAROT_CONFIG = {
  REQUIRE_CODE: false,
  SECONDS_PER_QUESTION: 7,
  AUTH_API_URL: "",
  DEMO_CODES: ["DEMO2026","LOVE2026","TAROT2026"],
  PRODUCT_NAME: "塔罗直觉测试｜未来另一半来自哪里？"
};
