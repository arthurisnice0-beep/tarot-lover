const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const screens={home:$('#homeScreen'),intro:$('#introScreen'),quiz:$('#quizScreen'),loading:$('#loadingScreen'),result:$('#resultScreen')};
const show=name=>{Object.values(screens).forEach(x=>x.classList.remove('active'));screens[name].classList.add('active');window.scrollTo(0,0)};

const CONFIG=Object.assign({REQUIRE_CODE:false,SECONDS_PER_QUESTION:7,AUTH_API_URL:'',DEMO_CODES:['DEMO2026','LOVE2026','TAROT2026'],PRODUCT_NAME:'塔罗直觉测试｜未来另一半来自哪里？'},window.TAROT_CONFIG||{});
let mode=null,qIndex=0,answers=[],timerId=null,timeLeft=CONFIG.SECONDS_PER_QUESTION,codeVerified=false,lastResult=null;

// 6 dimensions: warmth, adventure, stability, romance, independence, depth
const DIMS=['warmth','adventure','stability','romance','independence','depth'];
const DIM_LABEL={warmth:'情感温度',adventure:'探索欲',stability:'稳定需求',romance:'浪漫感',independence:'独立度',depth:'深度连接'};
const v=(warmth,adventure,stability,romance,independence,depth)=>({warmth,adventure,stability,romance,independence,depth});

const questions=[
 {eye:'INTUITION · 01',title:'第一眼，你最想走进哪一扇门？',desc:'不要判断风格，只看哪一扇像在“等你”。',opts:[['✦','星夜之门','陌生而自由',v(1,3,0,2,3,1)],['☾','月影之门','安静而柔软',v(3,0,1,3,0,3)],['☼','日光之门','明亮而热烈',v(3,2,0,2,1,0)],['❖','森林之门','稳定而神秘',v(1,1,3,1,0,3)]]},
 {eye:'INTUITION · 02',title:'从四个数字中，选最有“连接感”的一个',desc:'它们没有标准寓意，不要计算。',opts:[['3','数字 3','轻盈',v(2,3,0,1,3,0)],['7','数字 7','未知',v(0,2,0,1,2,3)],['11','数字 11','共振',v(2,0,1,3,0,3)],['22','数字 22','落地',v(1,0,3,0,1,2)]]},
 {eye:'INTUITION · 03',title:'四张牌背中，哪张最想让你翻开？',desc:'选那个让你觉得“背后有故事”的。',opts:[['♢','THE LOVERS','相互吸引',v(3,1,1,3,0,2)],['☽','THE MOON','潜意识',v(1,0,0,3,1,3)],['✧','THE STAR','远方',v(1,3,0,2,3,1)],['♁','THE WORLD','完整',v(1,2,3,1,2,2)]]},
 {eye:'INTUITION · 04',title:'今晚必须离开，你会顺手带走什么？',desc:'只凭第一念头，不考虑实用性。',opts:[['♬','一副耳机','自己的世界',v(0,2,0,1,3,2)],['▣','一台相机','记录瞬间',v(1,3,0,2,2,1)],['▤','一本旧书','熟悉气味',v(1,0,3,1,0,3)],['♡','一封旧信','未说完的话',v(3,0,1,3,0,3)]]},
 {eye:'INTUITION · 05',title:'哪一种傍晚最让你想停下来？',desc:'想象你独自站在那里。',opts:[['≈','海边落日','风很轻',v(2,2,0,3,2,1)],['▥','城市夜幕','灯刚亮',v(1,3,0,2,3,0)],['⌂','旧城石巷','路很慢',v(2,0,3,2,0,3)],['↗','机场清晨','要出发',v(0,3,0,1,3,1)]]},
 {eye:'INTUITION · 06',title:'选一个你最想戴在身上的符号',desc:'不要猜它代表什么。',opts:[['∞','无限','没有边界',v(1,3,0,2,3,2)],['△','三角','锋利明确',v(1,2,1,0,3,1)],['○','圆环','完整靠近',v(3,0,3,2,0,2)],['◇','菱形','秩序与光',v(1,0,3,1,2,2)]]},
 {eye:'INTUITION · 07',title:'如果有人向你走来，你希望第一感觉是？',desc:'不是“理想条件”，而是最先打动你的气质。',opts:[['⚡','有生命力','眼睛发亮',v(3,3,0,1,2,0)],['☾','温柔安静','让人放松',v(3,0,2,2,0,3)],['⌁','自由有趣','没有套路',v(2,3,0,1,3,1)],['♜','可靠稳重','说到做到',v(1,0,3,0,1,2)]]},
 {eye:'INTUITION · 08',title:'你更想收到哪一种“告白”？',desc:'不用考虑现实，只选更让你心动的一幕。',opts:[['☼','直接说喜欢','毫不拐弯',v(3,1,1,2,1,1)],['✉','一封长信','写满细节',v(2,0,2,3,0,3)],['✈','突然来见你','跨越距离',v(3,3,0,2,1,1)],['⌂','把你写进计划','一起生活',v(2,0,3,1,0,2)]]},
 {eye:'INTUITION · 09',title:'选一个你最想醒来的清晨',desc:'哪一幕让你产生“住在这里也不错”的感觉？',opts:[['☕','街角咖啡','慢慢开始',v(2,1,2,2,1,1)],['≈','海风阳台','没有闹钟',v(2,2,0,2,3,1)],['▦','高楼窗边','城市启动',v(0,3,1,0,3,0)],['♨','家里厨房','有人做早餐',v(3,0,3,1,0,2)]]},
 {eye:'INTUITION · 10',title:'陌生城市里，你更容易被什么吸引？',desc:'选你会不由自主走过去的地方。',opts:[['♬','热闹音乐','有人跳舞',v(3,3,0,2,2,0)],['♧','小众书店','安静角落',v(0,0,2,1,2,3)],['✦','古老建筑','时间痕迹',v(1,1,3,2,0,3)],['☼','露天市场','烟火人群',v(3,2,1,1,1,0)]]},
 {eye:'INTUITION · 11',title:'关系里，你最不能失去的一种感觉？',desc:'不要选“正确答案”，选你真正会在意的。',opts:[['♡','被理解','不用解释',v(3,0,1,2,0,3)],['↗','一起成长','不断往前',v(1,3,1,0,2,2)],['⌂','有确定性','可以依靠',v(2,0,3,1,0,2)],['∞','有空间','各自完整',v(0,2,0,1,3,1)]]},
 {eye:'INTUITION · 12',title:'最后一题：选一张“命运底牌”',desc:'选下它之后，你的缘分地图就会翻开。',opts:[['✧','THE STAR','远方来信',v(1,3,0,3,3,1)],['♡','THE CUP','情感共鸣',v(3,0,1,3,0,3)],['⚡','THE WAND','强烈行动',v(3,3,0,1,2,0)],['♛','THE COIN','长期落地',v(1,0,3,1,0,2)]]}
];

const china=[
 ['广州',v(82,79,58,65,78,56),'热烈但不黏人，松弛又有行动力','你的选择里有明显的开放度与行动感。你更容易被不拧巴、能把感情落到现实生活的人打动。广州型缘分的关键词不是戏剧化，而是“好相处、能一起做事，也能一起吃很多顿饭”。','工作合作、朋友聚会、展会、一次临时起意的短途，或熟人带来的新社交圈。','Ta 多半务实、反应快、会照顾现实生活。表达不一定肉麻，但愿意用行动确认关系。',['松弛感','行动派','烟火气']],
 ['成都',v(86,52,72,81,58,76),'温柔、会生活，关系里很有陪伴感','你对关系的真正需求更接近“舒服”而不是“刺激”。你会被会生活、情绪稳定、懂得给关系留白的人吸引。','咖啡馆、兴趣社群、朋友介绍，或一次不赶时间的旅行。','Ta 往往有幽默感、情绪柔软，愿意分享生活细节，也不会把关系逼得太紧。',['陪伴感','慢热','生活家']],
 ['武汉',v(91,72,58,73,60,70),'嘴硬心软，热烈真实，情绪浓度高','你既容易被生命力吸引，也很需要真诚回应。武汉型缘分带着一点反差：表面直接，内心很软，关系升温之后会很护短。','同学圈、项目合作、演出展览、朋友局，或者一场说去就去的聚会。','Ta 说话直接、不太装，情绪来得快也散得快，但关键时候非常站你这边。',['反差感','护短','真性情']],
 ['杭州',v(66,69,66,74,82,69),'审美在线，边界舒服，关系节奏轻盈','你会被“有分寸的浪漫”打动。过度黏腻或强控制反而会让你退后，你更适合精神交流与现实节奏都舒服的人。','互联网、设计创意行业、展览、线上认识后见面，或周末短途。','Ta 多半理性、有审美、边界感清楚，熟了以后才会露出很细腻的一面。',['边界感','审美','精神交流']],
 ['西安',v(62,44,87,59,52,82),'有原则、有担当，越了解越有厚度','你的潜意识需要一种“站得住”的关系。你不太满足于短暂新鲜感，更容易被内核稳定、有历史感和长期主义的人吸引。','学习进修、文化活动、工作关系，或一段持续较久的共同目标。','Ta 对外克制，对亲密关系认真，责任感强，有一点传统但并不死板。',['靠谱','长期主义','责任感']],
 ['洛阳',v(70,35,84,76,42,88),'古典慢热，重感情，也重承诺','你的选择里“深度”和“稳定”很突出。你很容易对有旧灵魂感、说话不多但有故事的人产生连接。','旅行、传统文化场景、朋友介绍，或一次很偶然的重逢。','Ta 慢热、重承诺，不擅长快速进入关系，但一旦确认就更倾向长期经营。',['旧灵魂','慢热','承诺感']],
 ['开封',v(78,55,67,77,58,74),'有趣松弛，带一点老派浪漫','你既在意情绪共鸣，也不想要沉重关系。你会喜欢能聊天、有生活趣味，又带一点怀旧感的人。','旅行途中、小众活动、夜市、朋友的朋友，或一次看似普通的闲逛。','Ta 很会聊天，喜欢分享生活细节，不太按套路出牌，却有自己的情义。',['有趣','烟火气','老派浪漫']],
 ['重庆',v(90,80,62,78,61,64),'强吸引力、强行动力，也很护短','你的潜意识并不排斥强烈张力，但你要的是有行动、能落地的热烈，而不是只会说好听话。','社交局、工作合作、夜间活动，或一次临时决定的旅行。','Ta 个性鲜明、表达直接，认定之后会很护短，偶尔也会有点强势。',['强吸引','护短','行动力']],
 ['上海',v(58,82,63,69,90,61),'独立、精致，先欣赏彼此再靠近','你的选择里独立度和探索欲很高。你适合的关系不是互相依附，而是两个完整的人因为欣赏而靠近。','工作、品牌活动、艺术展览、专业社群、朋友饭局。','Ta 有目标感、讲效率、审美在线，关系里尊重彼此的时间与空间。',['独立','精致','势均力敌']],
 ['北京',v(55,75,76,48,84,82),'脑子很性感，关系靠精神密度维系','你容易对有观点、有能力、有复杂内在的人产生兴趣。比起单纯浪漫，你更吃深度交流和共同目标。','行业会议、学习项目、专业社群、朋友介绍或长期工作合作。','Ta 很有主见，可能忙，但愿意认真讨论未来，也看重精神上的尊重。',['精神密度','目标感','成熟']],
 ['深圳',v(61,91,54,50,91,53),'快节奏、行动派，喜欢一起升级人生','你的探索欲和独立度很突出。你更容易爱上一个愿意一起尝试、一起成长、不会拖泥带水的人。','创业、科技行业、跨境工作、运动社群、朋友的项目圈。','Ta 反应快、执行力强、现实感重，爱情表达更像“我来解决”。',['成长型','执行力','未来感']],
 ['南京',v(71,47,78,73,56,80),'温和克制，熟悉之后很有深度','你并不需要时时高浓度的刺激，而更重视可靠、文化感和稳定沟通。','校园、文化空间、工作合作、朋友介绍、城市散步类活动。','Ta 温和、有分寸、情绪相对稳定，熟悉之后很会照顾细节。',['温和','文化感','稳定']],
 ['苏州',v(68,38,85,78,57,73),'细腻、有审美，把喜欢藏在日常里','你更容易被“慢慢变好的关系”吸引。你不缺浪漫想象，但更需要细节和稳定来证明它。','工作往来、朋友介绍、生活方式社群、展览或周末短途。','Ta 注重品质和细节，不会过度张扬，但很愿意把你放进日常规划。',['细节感','审美','日常浪漫']],
 ['青岛',v(80,67,63,75,69,58),'海风一样直接，明朗又有松弛感','你喜欢有生命力但不过度侵入的人。既能一起热闹，也能各自安静，是你很舒服的关系形态。','旅行、运动、海边活动、朋友局或工作交流。','Ta 明朗、直爽、讲义气，不喜欢把情绪拖太久。',['明朗','松弛','直接']],
 ['昆明',v(80,66,66,80,72,71),'柔软自由，关系更像一起生活与远行','你的选择显示，你既要情感温度，也很需要空间。你适合一种“在一起但不被困住”的关系。','旅行、户外、摄影、艺术活动、异地朋友的连接。','Ta 温柔、有自己的生活节奏，对世界保持好奇，愿意陪你慢慢探索。',['自由','柔软','治愈']],
 ['厦门',v(78,65,64,82,73,61),'清爽浪漫，关系里有呼吸感','你会喜欢轻盈、有审美、不过度复杂的关系。对方的情绪稳定和生活方式会比“条件”更打动你。','旅行、创意活动、咖啡店、海边、朋友介绍。','Ta 干净、温柔、懂得享受生活，关系里给你足够呼吸空间。',['清爽','浪漫','呼吸感']],
 ['长沙',v(91,79,55,70,66,52),'热闹有梗，越相处越容易上头','你会被有趣、坦率、有情绪感染力的人吸引。关系对你来说不能只有稳定，还要“有意思”。','朋友聚会、音乐娱乐、社交活动、美食局。','Ta 外向、有梗、很会带动气氛，爱憎分明，喜欢就会明显靠近。',['有梗','热闹','感染力']],
 ['大理',v(76,83,48,85,88,72),'自由浪漫，不占有，却有灵魂连接','你的独立度、探索欲和浪漫感同时偏高。你很难被传统模板式关系满足，更吃精神自由与共同体验。','旅行、长期旅居、艺术/户外社群、朋友的朋友。','Ta 有自己的世界，不黏人，但愿意和你分享很多特别的体验与想法。',['自由灵魂','远行','共振']]
].map(toPlace);

const world=[
 ['西班牙',v(91,90,48,91,76,58),'热烈、自由、会直接表达喜欢','你的直觉很偏向生命力、开放表达和移动感。你容易被敢爱敢说、重视体验的人吸引。','旅行、语言学习、国际社群、展会、朋友聚会，或一段异地开始的联系。','Ta 外向、有趣、会制造浪漫，也珍惜个人空间。',['热烈','自由','浪漫']],
 ['意大利',v(85,68,72,94,61,71),'审美感强，浪漫里带一点传统','你既想要浪漫，也需要关系有质感和落地感。意大利型缘分更像“会表达，也愿意把你带进生活”。','艺术、设计、美食、旅行、展会或朋友介绍。','Ta 重视审美、家庭和仪式感，喜欢会让你明显感受到。',['审美','仪式感','家庭观']],
 ['法国',v(66,72,58,89,91,79),'克制聪明，精神吸引先于现实条件','你的选择显示，你很吃精神共振。比起单纯条件，你更容易对有观点、有审美、有独立世界的人上头。','学习、创意行业、艺术展览、跨文化交流。','Ta 独立、有边界，擅长聊天，也不喜欢被过度控制。',['精神共振','独立','克制']],
 ['巴基斯坦',v(82,45,91,71,42,84),'重承诺、重家庭，感情表达更深沉','你的潜意识更偏向稳定、责任和深层连接。你真正需要的是能给确定感、把关系当成重要事情的人。','工作合作、留学、跨境项目、共同朋友或国际社交圈。','Ta 通常重视家庭和承诺，对关系态度认真，表达方式可能更含蓄。',['责任感','家庭','深情']],
 ['土耳其',v(90,75,60,92,55,76),'浪漫浓烈，关系很有故事感','你对强烈但真诚的关系有明显感应。土耳其型缘分容易快速升温，也容易让你记很久。','旅行、社交活动、文化交流、线上认识后见面。','Ta 热情、会照顾人、表达明显，也可能有一点占有欲。',['浓烈','故事感','热情']],
 ['日本',v(60,48,88,62,78,75),'细节感强，克制但很会照顾人','你偏爱有秩序、分寸和细节的人。真正让你安心的，往往是不靠甜言蜜语却长期稳定的人。','工作、学习、兴趣圈、长期合作、共同朋友。','Ta 克制、礼貌、注重细节，确认关系后会把关心落实在行动里。',['细节','稳定','克制']],
 ['澳大利亚',v(77,94,47,62,94,48),'轻松直接，关系里空间感很大','你很需要不拧巴的关系。你会被独立、有运动感、说话直接、愿意探索的人吸引。','旅行、户外、留学、国际工作环境。','Ta 比较直接，尊重边界，也愿意一起尝试新鲜体验。',['松弛','独立','户外感']],
 ['英国',v(57,55,79,52,82,83),'理性幽默，慢热但很稳定','你的潜意识倾向于先建立信任，再进入亲密。你更喜欢有思想、讲分寸、长期可靠的人。','工作、学术、专业社群、朋友长期介绍。','Ta 可能嘴上不甜，但有幽默感、责任感和稳定行动。',['慢热','幽默','稳定']],
 ['德国',v(50,52,96,45,83,68),'秩序感强，喜欢用行动兑现承诺','你对确定性和独立性都有需求。你不喜欢情绪游戏，更欣赏清晰、守时、言行一致的人。','工作、技术行业、学术交流、专业合作。','Ta 逻辑清楚、有责任感，浪漫可能不花哨，但会把承诺执行下去。',['可靠','秩序','行动兑现']],
 ['瑞士',v(53,49,94,60,85,70),'安静稳定，生活质量与边界都在线','你适合低戏剧、高质量的关系。稳定、边界、生活秩序比高浓度情绪更能让你长期安心。','工作、学习、旅行、户外活动、国际组织相关圈层。','Ta 克制、独立、重品质，确认关系之后很稳定。',['高质量','边界','稳定']],
 ['葡萄牙',v(82,66,62,89,68,77),'温柔浪漫，带一点旧灵魂的海风感','你对浪漫和深度都有明显需求，但又不喜欢过度侵入。你更适合温柔、真诚、节奏舒缓的人。','旅行、音乐、文化活动、海边城市、朋友介绍。','Ta 温柔、感性、有故事感，会在细节里表达喜欢。',['温柔','海风感','旧灵魂']],
 ['希腊',v(86,83,52,93,72,65),'明亮浪漫，爱情像一次长夏天','你喜欢有生命力、审美感和自由度的关系。你不太适合过度沉闷的爱情。','旅行、海岛、国际社群、艺术文化活动。','Ta 热情、外向、重体验，愿意一起旅行和创造回忆。',['长夏天','浪漫','生命力']],
 ['新加坡',v(61,80,88,48,87,55),'高效理性，把爱情纳入人生规划','你的独立性、目标感和稳定需求比较突出。你适合一个能沟通、执行力强、未来规划清晰的人。','工作、商业活动、留学、跨境项目、专业社交。','Ta 务实、自律、时间观念强，确认关系后会考虑现实安排。',['效率','规划','稳定']],
 ['加拿大',v(78,79,71,62,90,62),'温和开放，相处起来没那么累','你需要尊重、包容和空间。能让你长期舒服的，是情绪稳定又尊重个人选择的人。','留学、工作、户外、社区活动、共同朋友。','Ta 温和、包容、独立，关系里不太爱制造无意义的冲突。',['包容','空间感','温和']],
 ['美国',v(70,94,51,58,96,52),'直接独立，强烈鼓励你做自己','你的探索欲和独立度非常高。你容易被有目标、有表达欲、愿意冒险的人吸引。','工作、创业、留学、国际社交、线上娱乐转线下。','Ta 直接、有主见、行动快，关系里强调沟通和个人选择。',['独立','冒险','直接']],
 ['新西兰',v(81,85,62,67,91,65),'自然松弛，喜欢一起去看更大的世界','你很适合一段既有陪伴又有空间的关系。共同体验、户外和慢生活会让感情更稳。','旅行、户外、留学、运动社群。','Ta 随和、独立、亲近自然，不太喜欢复杂的人际游戏。',['自然','松弛','远行']],
 ['韩国',v(84,60,65,87,52,64),'仪式感强，喜欢明确的关系表达','你对情绪回应和浪漫表达的需求都不低。你更容易被愿意明确表达、注重情侣互动的人吸引。','学习、娱乐文化、工作交流、朋友介绍、线上社交。','Ta 注重细节和仪式感，关系确定后会比较高频地参与彼此生活。',['仪式感','表达','陪伴']],
 ['荷兰',v(64,82,64,59,97,70),'清醒自由，爱是平等而不是束缚','你的独立度非常高，同时仍需要深度交流。你更适合平等、直接、尊重边界的关系。','工作、留学、艺术设计、国际社群、旅行。','Ta 说话直接、价值观清晰、尊重个人空间，重视伙伴式关系。',['平等','直接','自由']]
].map(toPlace);

function toPlace(a){return {name:a[0],vec:a[1],sub:a[2],why:a[3],meet:a[4],person:a[5],keywords:a[6]}}
function addVec(a,b){const o={};DIMS.forEach(k=>o[k]=(a[k]||0)+(b[k]||0));return o}
function normUser(){let total=v(0,0,0,0,0,0);answers.forEach(x=>total=addVec(total,x.vec));const max=questions.length*3;const out={};DIMS.forEach(k=>out[k]=Math.round(total[k]/max*100));return out}
function similarity(a,b){let dot=0,aa=0,bb=0;DIMS.forEach(k=>{dot+=a[k]*b[k];aa+=a[k]*a[k];bb+=b[k]*b[k]});return dot/(Math.sqrt(aa)*Math.sqrt(bb)||1)}
function stableNoise(name){let h=0;for(const c of name)h=(h*31+c.charCodeAt(0))>>>0;answers.forEach((x,i)=>h=(h*33+(i+1)*Math.round(Object.values(x.vec).reduce((a,b)=>a+b,0)))>>>0);return (h%1000)/1000}
function scoreResults(){const user=normUser();const pool=mode==='china'?china:world;const scored=pool.map(r=>({r,raw:similarity(user,r.vec)+stableNoise(r.name)*.012})).sort((a,b)=>b.raw-a.raw);const best=scored[0].raw;scored.forEach((x,i)=>{const d=best-x.raw;x.percent=Math.max(72,Math.round(95-d*55-i*.45))});return {user,scored}}

function startQuestion(){clearInterval(timerId);const q=questions[qIndex];$('#questionEyebrow').textContent=q.eye;$('#questionTitle').textContent=q.title;$('#questionDesc').textContent=q.desc;$('#qCount').textContent=`${String(qIndex+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;$('#progressBar').style.width=`${qIndex/questions.length*100}%`;const box=$('#options');box.innerHTML='';q.opts.forEach(([glyph,label,sub,vec],idx)=>{const b=document.createElement('button');b.className='option';b.innerHTML=`<span class="glyph">${glyph}</span><span class="label">${label}</span><span class="sub">${sub}</span>`;b.onclick=()=>choose({vec,index:idx},b);box.appendChild(b)});timeLeft=CONFIG.SECONDS_PER_QUESTION;updateTimer();timerId=setInterval(()=>{timeLeft--;updateTimer();if(timeLeft<=0){clearInterval(timerId);const idx=(qIndex+answers.length)%q.opts.length;choose({vec:q.opts[idx][3],index:idx},box.children[idx],true)}},1000)}
function updateTimer(){$('#timer').textContent=timeLeft;const circle=$('#timerCircle');const total=106.8;circle.style.strokeDashoffset=total*(1-timeLeft/CONFIG.SECONDS_PER_QUESTION)}
function choose(ans,el,auto=false){if(!screens.quiz.classList.contains('active'))return;clearInterval(timerId);$$('.option').forEach(x=>x.disabled=true);if(el)el.classList.add('selected');answers.push(ans);setTimeout(()=>{qIndex++;if(qIndex<questions.length)startQuestion();else finishTest()},auto?180:220)}
function finishTest(){show('loading');const lines=['整理 12 次潜意识选择…','匹配你的关系偏好…','连接不同地域的生活气质…','正在翻开最后一张牌…'];let i=0;$('#loadingText').textContent=lines[0];const steps=$$('.loading-steps span');const id=setInterval(()=>{$('#loadingText').textContent=lines[++i%lines.length];steps.forEach((s,j)=>s.classList.toggle('on',j<=Math.min(i,3)))},650);setTimeout(()=>{clearInterval(id);renderResult();show('result')},2900)}
function getArchetype(user){
  const ranked=DIMS.map(k=>[k,user[k]]).sort((a,b)=>b[1]-a[1]);
  const top=ranked[0][0], second=ranked[1][0];
  const map={
    romance:['THE LOVERS','恋人牌 · 浪漫共振者'],
    adventure:['THE STAR','星星牌 · 远行者'],
    stability:['THE EMPEROR','皇帝牌 · 长期主义者'],
    warmth:['THE SUN','太阳牌 · 热烈给予者'],
    independence:['THE WORLD','世界牌 · 自由同行者'],
    depth:['THE MOON','月亮牌 · 灵魂潜行者']
  };
  const base=map[top];
  const suffix=second==='depth'?' · 深层连接':second==='romance'?' · 高浪漫感':second==='adventure'?' · 向远方':second==='stability'?' · 重确定性':second==='independence'?' · 重边界':second==='warmth'?' · 高情感温度':'';
  return {en:base[0],label:base[1]+suffix};
}
function renderResult(){const {user,scored}=scoreResults();const top=scored[0].r;const archetype=getArchetype(user);lastResult={user,scored,top,archetype};$('#resultArchetype').textContent=archetype.label;$('#resultModeLabel').textContent=mode==='china'?'CHINA EDITION':'WORLD EDITION';$('#resultName').textContent=top.name;$('#resultSub').textContent=top.sub;$('#whyText').textContent=top.why;$('#meetText').textContent=top.meet;$('#personText').textContent=top.person;$('#keywords').innerHTML=top.keywords.map(k=>`<span># ${k}</span>`).join('');$('#top2').textContent=scored[1].r.name;$('#top3').textContent=scored[2].r.name;$('#top2Score').textContent=`磁场 ${scored[1].percent}%`;$('#top3Score').textContent=`磁场 ${scored[2].percent}%`;$('#matchScore').textContent=`${scored[0].percent}%`;$('#dimensionBars').innerHTML=DIMS.map(k=>`<div class="dim-row"><span>${DIM_LABEL[k]}</span><div class="dim-track"><i style="width:${user[k]}%"></i></div><b>${user[k]}</b></div>`).join('')}

function wrapText(ctx,text,maxWidth){const chars=[...text],lines=[];let line='';chars.forEach(ch=>{const t=line+ch;if(ctx.measureText(t).width>maxWidth&&line){lines.push(line);line=ch}else line=t});if(line)lines.push(line);return lines}
function drawPoster(){if(!lastResult)return;const c=$('#posterCanvas'),ctx=c.getContext('2d');const {top,scored,user}=lastResult;ctx.clearRect(0,0,c.width,c.height);const g=ctx.createLinearGradient(0,0,750,1000);g.addColorStop(0,'#f7efe2');g.addColorStop(1,'#e8d6bf');ctx.fillStyle=g;ctx.fillRect(0,0,750,1000);ctx.strokeStyle='#9b7a55';ctx.lineWidth=2;ctx.strokeRect(30,30,690,940);ctx.strokeStyle='rgba(120,90,60,.3)';ctx.strokeRect(43,43,664,914);ctx.textAlign='center';ctx.fillStyle='#7f6d60';ctx.font='20px Georgia';ctx.fillText('THE LOVE ORACLE',375,86);ctx.fillStyle='#806083';ctx.font='62px serif';ctx.fillText('☾',375,160);ctx.fillStyle='#786977';ctx.font='24px serif';ctx.fillText('你的未来缘分磁场最靠近',375,210);ctx.fillStyle='#33253b';ctx.font='bold 80px serif';ctx.fillText(top.name,375,305);ctx.fillStyle='#765f68';ctx.font='24px serif';wrapText(ctx,top.sub,590).slice(0,2).forEach((l,i)=>ctx.fillText(l,375,352+i*34));ctx.fillStyle='#8e633d';ctx.font='bold 50px Georgia';ctx.fillText(scored[0].percent+'%',375,440);ctx.fillStyle='#6d5c66';ctx.font='20px serif';ctx.fillText('缘分磁场匹配度',375,475);ctx.textAlign='left';ctx.fillStyle='#3d3042';ctx.font='bold 24px serif';ctx.fillText('你的缘分磁场',85,540);const rows=DIMS.slice(0,4);rows.forEach((k,i)=>{const y=585+i*58;ctx.fillStyle='#665966';ctx.font='19px serif';ctx.fillText(DIM_LABEL[k],85,y);ctx.fillStyle='#d2c1ae';roundRect(ctx,220,y-16,370,15,8,true,false);const bg=ctx.createLinearGradient(220,0,590,0);bg.addColorStop(0,'#9871a6');bg.addColorStop(1,'#b8895d');ctx.fillStyle=bg;roundRect(ctx,220,y-16,370*user[k]/100,15,8,true,false);ctx.fillStyle='#765f68';ctx.font='18px Georgia';ctx.fillText(String(user[k]),610,y)});ctx.fillStyle='#3d3042';ctx.font='bold 22px serif';ctx.fillText('隐藏缘分地',85,845);ctx.font='26px serif';ctx.fillText(`${scored[1].r.name} · ${scored[1].percent}%    /    ${scored[2].r.name} · ${scored[2].percent}%`,85,885);ctx.textAlign='center';ctx.fillStyle='#958274';ctx.font='16px serif';ctx.fillText('塔罗直觉测试 · 娱乐互动体验',375,940);const url=c.toDataURL('image/png');$('#downloadPoster').href=url;$('#posterModal').classList.remove('hidden')}
function roundRect(ctx,x,y,w,h,r,fill,stroke){if(w<2*r)r=w/2;if(h<2*r)r=h/2;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke()}

async function verifyAccessCode(value){
  if(CONFIG.DEMO_CODES.includes(value)) return {ok:true,remaining:'演示'};
  if(CONFIG.AUTH_API_URL){
    try{
      const res=await fetch(CONFIG.AUTH_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:value,action:'consume'})});
      if(!res.ok) return {ok:false};
      const data=await res.json();
      return {ok:!!data.ok,remaining:data.remaining};
    }catch(e){ return {ok:false,error:'network'}; }
  }
  // 未接后端时，仅用于本地预览，不建议正式售卖依赖此前端规则。
  return {ok:/^(LOVE|TAROT|STAR)-[A-Z0-9]{6,12}$/.test(value),remaining:null};
}
function buildShareText(){
  if(!lastResult)return '';
  const {top,scored,archetype}=lastResult;
  return `我的塔罗直觉结果：${top.name}（${scored[0].percent}%）｜${archetype.label}。隐藏缘分地：${scored[1].r.name}、${scored[2].r.name}。仅供娱乐测试。`;
}
$$('.mode-card').forEach(b=>b.onclick=()=>{
  $$('.mode-card').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  mode=b.dataset.mode;
  $('#startBtn').disabled=CONFIG.REQUIRE_CODE&&!codeVerified;
  $('#startBtn span').textContent=mode==='china'?'进入中国缘分版':'进入世界缘分版';
});
$('#startBtn').onclick=()=>{
  if(CONFIG.REQUIRE_CODE&&!codeVerified){$('#codeBox').classList.remove('hidden');$('#codeMsg').textContent='请先验证测试码';return}
  show('intro');
};
$('#beginTest').onclick=()=>{qIndex=0;answers=[];show('quiz');startQuestion()};
$('#quitBtn').onclick=()=>{clearInterval(timerId);show('home')};
$('#retryBtn').onclick=()=>{qIndex=0;answers=[];show('intro')};
$('#switchBtn').onclick=()=>{
  mode=null;
  $$('.mode-card').forEach(x=>x.classList.remove('active'));
  $('#startBtn').disabled=true;
  $('#startBtn span').textContent='先选择测试版本';
  show('home');
};
$('#codeToggle').onclick=()=>$('#codeBox').classList.toggle('hidden');
$('#verifyCode').onclick=async()=>{
  const value=$('#accessCode').value.trim().toUpperCase();
  if(!value)return;
  $('#codeMsg').textContent='正在验证…';
  const r=await verifyAccessCode(value);
  codeVerified=r.ok;
  $('#codeMsg').textContent=r.ok?`测试码验证成功 ✓${Number.isFinite(r.remaining)?' · 剩余 '+r.remaining+' 次':''}`:(r.error==='network'?'授权服务暂时不可用，请稍后重试':'测试码无效，请检查后重试');
  $('#codeMsg').style.color=r.ok?'#b7dfbc':'#efaaaa';
  if(mode)$('#startBtn').disabled=CONFIG.REQUIRE_CODE&&!r.ok;
};
$('#copyResultBtn').onclick=async()=>{
  const t=buildShareText();
  try{await navigator.clipboard.writeText(t);$('#copyResultBtn').textContent='已复制 ✓';setTimeout(()=>$('#copyResultBtn').textContent='复制结果文案',1400)}
  catch(e){alert(t)}
};
$('#posterBtn').onclick=drawPoster;
$('#closePoster').onclick=()=>$('#posterModal').classList.add('hidden');
$('#posterModal').onclick=e=>{if(e.target===$('#posterModal'))$('#posterModal').classList.add('hidden')};
