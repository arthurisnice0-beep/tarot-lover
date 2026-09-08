const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const screens={home:$('#homeScreen'),access:$('#accessScreen'),intro:$('#introScreen'),quiz:$('#quizScreen'),loading:$('#loadingScreen'),result:$('#resultScreen')};
const show=name=>{Object.values(screens).forEach(x=>x.classList.remove('active'));screens[name].classList.add('active');window.scrollTo(0,0)};

const CONFIG=Object.assign({REQUIRE_CODE:true,SECONDS_PER_QUESTION:7,AUTH_API_URL:'',MAX_REPORTS_PER_CODE:10,STORAGE_KEY:'love_oracle_v4_access_v1',LOCAL_CODE_HASHES:[],DEMO_CODES:[],PRODUCT_NAME:'塔罗直觉测试｜未来另一半来自哪里？'},window.TAROT_CONFIG||{});
let mode=null,qIndex=0,answers=[],timerId=null,timeLeft=CONFIG.SECONDS_PER_QUESTION,codeVerified=false,lastResult=null,activeCodeHash=null;

// V4 immersive quiz layout constants. Keep these explicit to avoid blank quiz screens if build steps are changed.
const V4_SPREADS=['dual','triple','cross','quad','moon','fan'];
const V4_BG_COUNT=6;

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

const PLACE_ARCH_CHINA={"metro":{"vec":[62,88,58,56,92,62],"sub":"势均力敌，彼此欣赏后再靠近","why":"你更容易被目标感、行动力和独立边界同时在线的人吸引。关系不是依附，而是两个人一起把生活往前推。","person":"Ta 多半有主见、效率高，尊重彼此空间，确认关系后也愿意认真规划未来。","keywords":["独立","成长","目标感"]},"warm":{"vec":[90,76,58,76,63,60],"sub":"热烈鲜活，喜欢会明确回应的人","why":"你的直觉偏向生命力、真诚回应和现实行动。太冷淡的关系很难让你长期投入。","person":"Ta 多半直接、有感染力，喜欢就会靠近，也愿意用行动照顾关系。","keywords":["热烈","真诚","行动"]},"stable":{"vec":[62,46,92,56,62,75],"sub":"慢热可靠，越相处越有安全感","why":"你需要的是经得起时间的关系。稳定、边界和言行一致，比短暂刺激更重要。","person":"Ta 多半克制、靠谱、责任感强，表达不浮夸，但会把承诺落实到日常。","keywords":["稳定","可靠","长期"]},"heritage":{"vec":[67,48,84,72,50,90],"sub":"旧灵魂感，重深度也重承诺","why":"你的选择里深度与长期主义很突出。你容易对有故事、有文化感、内核稳定的人产生连接。","person":"Ta 多半慢热、有原则，越了解越有厚度，也更倾向认真经营关系。","keywords":["深度","旧灵魂","承诺"]},"coastal":{"vec":[78,72,62,78,76,61],"sub":"清爽松弛，浪漫里保留呼吸感","why":"你喜欢有温度但不过度黏人的关系。共同体验和舒服的生活节奏，会让你更容易确认心意。","person":"Ta 多半明朗、有审美、懂生活，既会陪伴也尊重个人空间。","keywords":["松弛","浪漫","呼吸感"]},"frontier":{"vec":[58,86,58,60,90,72],"sub":"远方感很强，适合一起探索世界","why":"你的探索欲和独立度偏高。你会被拥有自己世界、同时愿意和你并肩远行的人吸引。","person":"Ta 多半独立、坚韧、行动力强，不喜欢套路，更重真实体验。","keywords":["远行","自由","探索"]},"leisure":{"vec":[84,65,68,85,70,76],"sub":"会生活、会陪伴，关系自然升温","why":"你真正需要的不是高压刺激，而是舒服、好聊、能一起享受生活的人。","person":"Ta 多半情绪柔软、会照顾细节，愿意分享日常，也不会让关系太紧绷。","keywords":["陪伴","生活感","治愈"]},"creative":{"vec":[68,72,65,82,84,74],"sub":"审美在线，精神交流很重要","why":"你容易被有品位、有想法、边界舒服的人吸引。感情需要既有浪漫，也有精神共振。","person":"Ta 多半有审美、思维活跃，熟悉之后会露出细腻和温柔的一面。","keywords":["审美","共振","边界"]},"mountain":{"vec":[72,70,68,76,75,84],"sub":"安静有力量，适合深度连接","why":"你既需要自由，也需要一段有深度、有信任感的关系。太浅的互动很难真正打动你。","person":"Ta 多半沉稳、温和、有自己的节奏，愿意和你建立长期而真实的连接。","keywords":["安静","深度","信任"]},"pragmatic":{"vec":[70,78,82,55,78,62],"sub":"现实行动派，喜欢把未来做出来","why":"你对关系的判断很看重执行力和现实可靠性。说得漂亮不如真正做到。","person":"Ta 多半务实、反应快、解决问题能力强，确认后会把你纳入现实计划。","keywords":["务实","执行力","未来"]},"romantic":{"vec":[82,64,62,94,58,78],"sub":"仪式感和心动感都很强","why":"你对浪漫表达和情绪回应比较敏感。你会被会创造记忆、又愿意认真投入的人吸引。","person":"Ta 多半感性、有审美、会表达喜欢，也看重两个人之间独特的仪式感。","keywords":["浪漫","仪式感","心动"]}};

const PLACE_ARCH_WORLD={"independent":{"vec":[64,91,56,58,96,63],"sub":"自由清醒，爱是平等而不是束缚","why":"你适合两个完整的人因为欣赏而靠近。自由、直接和彼此尊重，比占有感更重要。","person":"Ta 多半独立、有主见、尊重边界，也愿意和你一起尝试新鲜事。","keywords":["自由","平等","独立"]},"nature":{"vec":[79,85,65,68,91,68],"sub":"自然松弛，适合一起看更大的世界","why":"你需要既有陪伴又有空间的关系。共同体验、户外和慢生活会让感情更稳。","person":"Ta 多半随和、独立、亲近自然，不太喜欢复杂的人际游戏。","keywords":["自然","松弛","远行"]},"warm":{"vec":[90,82,52,86,66,58],"sub":"热烈直接，关系里有很强生命力","why":"你的直觉偏向开放表达、行动感和情绪回应。你更容易被敢爱敢说的人打动。","person":"Ta 多半外向、真诚、会表达喜欢，也愿意和你一起创造很多经历。","keywords":["热烈","直接","生命力"]},"romantic":{"vec":[82,68,62,95,60,76],"sub":"浪漫浓度高，也很重视情感共鸣","why":"你对仪式感、审美和情绪连接的需求不低。你会被会表达、会制造记忆的人吸引。","person":"Ta 多半感性、有审美、会表达爱，也愿意认真经营两个人的故事。","keywords":["浪漫","仪式感","共鸣"]},"deep":{"vec":[60,61,76,61,77,94],"sub":"精神密度高，慢热但很有深度","why":"你容易对有观点、有复杂内在的人产生兴趣。比起表面热闹，你更在意理解与长期信任。","person":"Ta 多半有思想、慢热、有原则，真正靠近后会非常重视深层连接。","keywords":["深度","思想","慢热"]},"stable":{"vec":[55,52,96,50,80,70],"sub":"秩序稳定，喜欢用行动兑现承诺","why":"你对确定性、边界和长期可靠性需求明显。你更欣赏言行一致的人。","person":"Ta 多半理性、守承诺、责任感强，浪漫可能不花哨，但非常可持续。","keywords":["稳定","秩序","可靠"]},"elegant":{"vec":[63,57,82,76,76,78],"sub":"克制细腻，细节比甜言蜜语更动人","why":"你会被分寸感、审美和长期稳定打动。关系更像慢慢建立起来的信任。","person":"Ta 多半礼貌、细致、有品位，确认关系后会把关心落实在细节里。","keywords":["细节","克制","审美"]},"family":{"vec":[80,48,94,70,45,86],"sub":"重承诺、重家庭，感情表达更深沉","why":"你的潜意识更偏向稳定、责任和深层连接。你真正需要的是能给确定感的人。","person":"Ta 多半重视家庭和承诺，对关系态度认真，表达方式可能更含蓄。","keywords":["责任","家庭","深情"]},"global":{"vec":[60,85,86,55,90,58],"sub":"高效理性，把爱情纳入人生规划","why":"你的独立性、目标感和稳定需求比较突出。你适合一个能沟通、执行力强的人。","person":"Ta 多半务实、自律、时间观念强，确认关系后会认真考虑现实安排。","keywords":["规划","效率","国际感"]},"adventure":{"vec":[72,96,48,64,95,54],"sub":"冒险感很强，喜欢一起升级人生","why":"你的探索欲和独立度都很高。你容易被有行动力、愿意冒险、不会拖泥带水的人吸引。","person":"Ta 多半直接、有目标、敢尝试，关系里会鼓励你保持自己。","keywords":["冒险","行动","自由"]},"heritage":{"vec":[70,55,80,76,60,88],"sub":"历史感和故事感很强，越了解越有味道","why":"你会被有文化感、有故事、内核稳定的人吸引。关系需要慢慢展开，而不是快速消费。","person":"Ta 多半沉稳、有原则、有自己的精神世界，熟悉后会很有温度。","keywords":["历史感","故事","深度"]},"frontier":{"vec":[62,88,60,60,90,76],"sub":"辽阔自由，适合一起去远方","why":"你的直觉偏向空间感、探索欲和独立精神。你会被不受模板限制的人吸引。","person":"Ta 多半独立、坚韧、行动力强，愿意和你一起探索更大的世界。","keywords":["辽阔","自由","探索"]}};

function hashName(s){let h=2166136261>>>0;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h>>>0}

function placeVec(base,name){let h=hashName(name),o={};DIMS.forEach((k,i)=>{h=(Math.imul(h^((i+1)*2654435761),2246822519))>>>0;const j=(h%13)-6;o[k]=Math.max(35,Math.min(98,base[i]+j))});return o}

function mkPlace(name,kind,group,meet,bias=0){const a=(kind==='china'?PLACE_ARCH_CHINA:PLACE_ARCH_WORLD)[group];return {name,vec:placeVec(a.vec,name),sub:a.sub,why:a.why,meet,person:a.person,keywords:a.keywords,bias}}

const china=[
  mkPlace('北京','china','metro','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('上海','china','metro','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('天津','china','stable','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('重庆','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('石家庄','china','stable','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('太原','china','heritage','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('呼和浩特','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('沈阳','china','pragmatic','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('长春','china','stable','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('哈尔滨','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('南京','china','heritage','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('杭州','china','creative','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('合肥','china','pragmatic','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('福州','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('南昌','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('济南','china','stable','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('郑州','china','pragmatic','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('武汉','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('长沙','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('广州','china','warm','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('南宁','china','leisure','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('海口','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('成都','china','leisure','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('贵阳','china','mountain','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('昆明','china','leisure','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('拉萨','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('西安','china','heritage','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('兰州','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('西宁','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('银川','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('乌鲁木齐','china','frontier','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('深圳','china','metro','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('苏州','china','creative','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('宁波','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('青岛','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('厦门','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('大连','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('无锡','china','creative','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('佛山','china','pragmatic','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('东莞','china','pragmatic','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('珠海','china','coastal','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('三亚','china','leisure','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('洛阳','china','heritage','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('开封','china','heritage','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0),
  mkPlace('大理','china','leisure','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('桂林','china','mountain','旅行、户外、兴趣社群、朋友介绍，或一次临时起意的出发。',0),
  mkPlace('香港','china','metro','工作、项目合作、行业活动、朋友饭局或线上认识后见面。',0),
  mkPlace('澳门','china','romantic','工作合作、朋友介绍、兴趣社群、旅行或一次偶然的新连接。',0)
];

const world=[
  mkPlace('美国','world','independent','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('加拿大','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('墨西哥','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('巴西','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('阿根廷','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('智利','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('哥伦比亚','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('秘鲁','world','deep','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('英国','world','deep','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('法国','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('德国','world','stable','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('意大利','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('西班牙','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('葡萄牙','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('荷兰','world','independent','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('比利时','world','elegant','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('瑞士','world','stable','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('奥地利','world','elegant','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('瑞典','world','independent','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('挪威','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('丹麦','world','stable','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('芬兰','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('爱尔兰','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('波兰','world','stable','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('捷克','world','heritage','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('希腊','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('土耳其','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('日本','world','elegant','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('韩国','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('新加坡','world','global','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('马来西亚','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('泰国','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('越南','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('印度尼西亚','world','adventure','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('菲律宾','world','warm','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('印度','world','deep','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('巴基斯坦','world','family','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('阿联酋','world','global','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('沙特阿拉伯','world','family','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('澳大利亚','world','adventure','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('新西兰','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('南非','world','adventure','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('埃及','world','heritage','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('摩洛哥','world','romantic','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('俄罗斯','world','deep','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('哈萨克斯坦','world','frontier','旅行、户外、留学、运动社群或一次远行中的新连接。',0),
  mkPlace('以色列','world','deep','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('卡塔尔','world','global','跨境工作、留学、专业社群、国际活动或线上认识后见面。',0),
  mkPlace('匈牙利','world','heritage','旅行、留学、工作、国际社群、朋友介绍或跨文化交流。',0),
  mkPlace('冰岛','world','nature','旅行、户外、留学、运动社群或一次远行中的新连接。',0)
];


// V4.2 probability calibration: 1,000,000 simulated answer paths.
const CALIBRATION_BIAS_CHINA={"北京":2.49539185,"上海":3.65910349,"天津":0.12747722,"重庆":-0.84394334,"石家庄":-1.22923302,"太原":-1.51440311,"呼和浩特":2.8285344,"沈阳":2.54975672,"长春":-0.79156326,"哈尔滨":-1.70278549,"南京":-1.62022425,"杭州":-1.13521587,"合肥":3.47689656,"福州":-0.22075398,"南昌":-1.69868544,"济南":-0.17525146,"郑州":5.0292297,"武汉":-1.36121462,"长沙":-1.24944484,"广州":-0.41598073,"南宁":-2.19090941,"海口":-1.69416342,"成都":-1.4692959,"贵阳":-2.04174283,"昆明":-2.06871517,"拉萨":2.43312179,"西安":-1.40217323,"兰州":1.89170938,"西宁":1.68490901,"银川":1.74763344,"乌鲁木齐":2.01583893,"深圳":2.26940453,"苏州":-0.94385274,"宁波":-1.66798536,"青岛":-1.05212773,"厦门":-0.91234735,"大连":-0.498256,"无锡":-0.36071915,"佛山":5.08632926,"东莞":3.04644424,"珠海":-1.45012006,"三亚":-2.34202981,"洛阳":-1.71107951,"开封":-1.73338613,"大理":-2.43750655,"桂林":-1.98389854,"香港":3.91993172,"澳门":-2.34270397};
const CALIBRATION_BIAS_WORLD={"美国":1.22449574,"加拿大":-0.20017396,"墨西哥":-0.95243695,"巴西":-0.5940852,"阿根廷":-1.78653373,"智利":-1.18010684,"哥伦比亚":-1.19185712,"秘鲁":0.08023252,"英国":0.22179079,"法国":-1.04886426,"德国":3.13600195,"意大利":-1.18663042,"西班牙":-0.77996403,"葡萄牙":-1.48872825,"荷兰":0.98843938,"比利时":-0.28584422,"瑞士":3.42760871,"奥地利":-0.4450296,"瑞典":0.79458123,"挪威":-0.63982863,"丹麦":3.69788275,"芬兰":-0.2597353,"爱尔兰":-1.1113979,"波兰":2.69522518,"捷克":-1.37707368,"希腊":-1.43594683,"土耳其":-1.10695841,"日本":0.40083858,"韩国":-1.08489648,"新加坡":3.72847245,"马来西亚":-0.96833053,"泰国":-1.08775685,"越南":-1.32049476,"印度尼西亚":0.51434482,"菲律宾":-0.78320035,"印度":0.6290461,"巴基斯坦":-0.87832469,"阿联酋":3.63914915,"沙特阿拉伯":-1.21876032,"澳大利亚":0.9365388,"新西兰":-0.17727793,"南非":0.62005502,"埃及":-1.15275607,"摩洛哥":-1.59603588,"俄罗斯":-0.31507457,"哈萨克斯坦":0.16695923,"以色列":-0.78099492,"卡塔尔":3.58988293,"匈牙利":-1.03739191,"冰岛":-1.01905474};
const CALIBRATION_BETA=35;
const CALIBRATION_TOPK_CHINA=18;
const CALIBRATION_TOPK_WORLD=22;
function addVec(a,b){const o={};DIMS.forEach(k=>o[k]=(a[k]||0)+(b[k]||0));return o}
function normUser(){let total=v(0,0,0,0,0,0);answers.forEach(x=>total=addVec(total,x.vec));const max=questions.length*3;const out={};DIMS.forEach(k=>out[k]=Math.round(total[k]/max*100));return out}
function similarity(a,b){let dot=0,aa=0,bb=0;DIMS.forEach(k=>{dot+=a[k]*b[k];aa+=a[k]*a[k];bb+=b[k]*b[k]});return dot/(Math.sqrt(aa)*Math.sqrt(bb)||1)}
function answerSeed(){
  let h=2166136261>>>0;
  answers.forEach((a,i)=>{
    h^=((a.index+1)*97+(i+1)*131)>>>0;
    h=Math.imul(h,16777619)>>>0;
  });
  return h>>>0;
}
function mixedUnit(seed,name){
  let x=(seed^hashName(name))>>>0;
  x^=x>>>16; x=Math.imul(x,0x7feb352d)>>>0;
  x^=x>>>15; x=Math.imul(x,0x846ca68b)>>>0;
  x^=x>>>16;
  return (((x&0x00ffffff)+0.5)/16777216);
}
function gumbel(seed,name){
  const u=Math.max(1e-9,Math.min(1-1e-9,mixedUnit(seed,name)));
  return -Math.log(-Math.log(u));
}
function scoreResults(){
  const user=normUser(),pool=mode==='china'?china:world;
  const biasMap=mode==='china'?CALIBRATION_BIAS_CHINA:CALIBRATION_BIAS_WORLD;
  const K=Math.min(mode==='china'?CALIBRATION_TOPK_CHINA:CALIBRATION_TOPK_WORLD,pool.length);
  const ranked=pool.map(r=>({r,raw:similarity(user,r.vec)})).sort((a,b)=>b.raw-a.raw);

  // 先限定在真实高匹配候选池，再用答案序列生成确定性“抽牌”扰动。
  // 同一套答案始终得到同一结果；概率校准只负责避免少数地点长期霸榜。
  const seed=answerSeed();
  const candidates=ranked.slice(0,K).map((x,rank)=>({
    ...x,
    rawRank:rank+1,
    drawScore:CALIBRATION_BETA*x.raw+(biasMap[x.r.name]||0)+gumbel(seed,x.r.name)
  })).sort((a,b)=>b.drawScore-a.drawScore);
  const chosen=candidates[0];
  const hidden=ranked.filter(x=>x.r.name!==chosen.r.name);
  const scored=[chosen,...hidden];

  const fit=Math.max(0,Math.min(1,(chosen.raw-.82)/.18));
  chosen.percent=Math.max(91,Math.min(96,Math.round(91+fit*5-Math.min(2,(chosen.rawRank-1)*.10))));
  scored.slice(1).forEach((x,i)=>{
    const f=Math.max(0,Math.min(1,(x.raw-.82)/.18));
    x.percent=Math.max(83,Math.min(90,Math.round(86+f*4-Math.min(2,i*.35))));
  });
  return {user,scored}
}

function startQuestion(){
  clearInterval(timerId);
  try{
    const q=questions[qIndex];
    if(!q || !Array.isArray(q.opts) || q.opts.length<2) throw new Error(`Invalid question at index ${qIndex}`);

    // Defensive fallback: even if a later build accidentally drops V4 layout constants,
    // the quiz still renders instead of showing a blank screen.
    const spreadList=(typeof V4_SPREADS!=='undefined' && Array.isArray(V4_SPREADS) && V4_SPREADS.length)
      ? V4_SPREADS : ['quad'];
    const bgCount=(typeof V4_BG_COUNT!=='undefined' && Number(V4_BG_COUNT)>0) ? Number(V4_BG_COUNT) : 1;
    const spread=spreadList[qIndex%spreadList.length] || 'quad';

    const stage=$('#quizStage');
    if(!stage) throw new Error('Missing #quizStage');
    stage.className=`quiz-stage spread-${spread} bg-${qIndex%bgCount+1}`;

    const eyebrow=$('#questionEyebrow'), title=$('#questionTitle'), desc=$('#questionDesc'), count=$('#qCount'), progress=$('#progressBar'), box=$('#options');
    if(!eyebrow || !title || !desc || !count || !progress || !box) throw new Error('Quiz DOM is incomplete');
    eyebrow.textContent=(q.eye||'INTUITION').replace('INTUITION','DRAW');
    title.textContent=q.title||'凭第一直觉选择一张牌';
    desc.textContent=q.desc||'不要分析，只看第一眼。';
    count.textContent=`${String(qIndex+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;
    progress.style.width=`${qIndex/questions.length*100}%`;

    box.className=`tarot-spread ${spread}`;
    box.innerHTML='';
    q.opts.forEach(([glyph,label,sub,vec],idx)=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='tarot-option';
      b.setAttribute('aria-label',`选择 ${String.fromCharCode(65+idx)}：${label||'塔罗牌'}`);
      b.style.setProperty('--i',idx);
      b.innerHTML=`<span class="tarot-card"><span class="card-inner"><span class="card-back"><i class="moon-mark">☾</i><i class="star-mark">✦</i></span><span class="card-face"><b>${glyph}</b><strong>${label}</strong><small>${sub}</small></span></span></span><span class="choice-letter">${String.fromCharCode(65+idx)}</span>`;
      b.onclick=()=>choose({vec,index:idx},b);
      box.appendChild(b);
    });

    // There are four answer vectors in every current question. Never silently hide options:
    // doing so would bias the scoring and could make timeout auto-selection choose an invisible card.
    [...box.children].forEach(el=>{el.hidden=false; el.style.display='';});

    timeLeft=CONFIG.SECONDS_PER_QUESTION;
    updateTimer();
    timerId=setInterval(()=>{
      timeLeft--;
      updateTimer();
      if(timeLeft<=0){
        clearInterval(timerId);
        const idx=(qIndex+answers.length)%q.opts.length;
        choose({vec:q.opts[idx][3],index:idx},box.children[idx],true);
      }
    },1000);
  }catch(err){
    clearInterval(timerId);
    console.error('[Love Oracle] quiz render failed:',err);
    const title=$('#questionTitle'), desc=$('#questionDesc'), box=$('#options');
    if(title) title.textContent='牌阵没有正常展开';
    if(desc) desc.textContent='请刷新页面后重新进入。本次不会扣除测试次数。';
    if(box){
      box.className='quiz-recovery';
      box.innerHTML='<button type="button" class="primary" id="quizRecoveryBtn"><span>刷新并重新进入</span><b>↻</b></button>';
      const btn=$('#quizRecoveryBtn');
      if(btn) btn.onclick=()=>location.reload();
    }
  }
}
function updateTimer(){
  const line=$('#timerLine');
  if(line){line.style.width=`${Math.max(0,timeLeft/CONFIG.SECONDS_PER_QUESTION*100)}%`;line.classList.toggle('urgent',timeLeft<=2)}
}
function choose(ans,el,auto=false){
  if(!screens.quiz.classList.contains('active'))return;
  clearInterval(timerId);
  $$('.tarot-option').forEach(x=>x.disabled=true);
  if(el){
    el.classList.add('selected','flipping');
    setTimeout(()=>el.classList.add('revealed'),120);
  }
  const toast=$('#choiceToast'); if(toast){toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),620)}
  answers.push(ans);
  setTimeout(()=>{qIndex++;if(qIndex<questions.length)startQuestion();else finishTest()},auto?700:820);
}
function finishTest(){
  if(CONFIG.REQUIRE_CODE){
    const used=consumeLocalReport();
    if(!used.ok){
      alert('本设备的 10 次报告额度已用完，请使用新的授权码。');
      show('access');
      refreshAccessUI();
      return;
    }
  }
  show('loading');
  const lines=['整理你的 12 次直觉…','读取月亮与距离信号…','连接相遇方式与关系气质…','正在翻开最后一张命运牌…'];
  let i=0; $('#loadingText').textContent=lines[0];
  const steps=$$('.loading-steps span');
  const id=setInterval(()=>{$('#loadingText').textContent=lines[++i%lines.length];steps.forEach((s,j)=>s.classList.toggle('on',j<=Math.min(i,3)))},560);
  setTimeout(()=>{clearInterval(id);renderResult();show('result');refreshAccessUI()},2400);
}
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
function getRarityLabel(name){
  const highChina=new Set(['北京','上海','广州','深圳','杭州','成都','重庆','武汉']);
  const rareChina=new Set(['洛阳','拉萨','银川','开封','澳门','三亚','桂林','西宁','大理']);
  const highWorld=new Set(['美国','加拿大','英国','法国','德国','意大利','西班牙','日本','韩国','澳大利亚','新加坡']);
  const rareWorld=new Set(['葡萄牙','希腊','土耳其','新西兰','荷兰','瑞士','巴基斯坦','南非','阿根廷']);
  if(mode==='china') return highChina.has(name)?'✦ 高频共振':rareChina.has(name)?'✧ 稀有缘分':'✦ 特别缘分';
  return highWorld.has(name)?'✦ 高频共振':rareWorld.has(name)?'✧ 稀有缘分':'✦ 特别缘分';
}
function renderResult(){const {user,scored}=scoreResults();const top=scored[0].r;const archetype=getArchetype(user);lastResult={user,scored,top,archetype};$('#resultArchetype').textContent=archetype.label;$('#resultModeLabel').textContent=mode==='china'?'CHINA EDITION':'WORLD EDITION';$('#editionBadge').textContent=mode==='china'?'CHINA LOVE MAP':'WORLD LOVE MAP';$('#rarityBadge').textContent=getRarityLabel(top.name);$('#resultName').textContent=top.name;$('#resultSub').textContent=top.sub;$('#whyText').textContent=top.why;$('#meetText').textContent=top.meet;$('#personText').textContent=top.person;$('#keywords').innerHTML=top.keywords.map(k=>`<span># ${k}</span>`).join('');$('#top2').textContent=scored[1].r.name;$('#top3').textContent=scored[2].r.name;$('#top2Score').textContent=`磁场 ${scored[1].percent}%`;$('#top3Score').textContent=`磁场 ${scored[2].percent}%`;$('#matchScore').textContent=`${scored[0].percent}%`;$('#dimensionBars').innerHTML=DIMS.map(k=>`<div class="dim-row"><span>${DIM_LABEL[k]}</span><div class="dim-track"><i style="width:${user[k]}%"></i></div><b>${user[k]}</b></div>`).join('')}

function wrapText(ctx,text,maxWidth){const chars=[...text],lines=[];let line='';chars.forEach(ch=>{const t=line+ch;if(ctx.measureText(t).width>maxWidth&&line){lines.push(line);line=ch}else line=t});if(line)lines.push(line);return lines}
function drawPoster(){
  if(!lastResult)return;
  const c=$('#posterCanvas'),ctx=c.getContext('2d');
  const {top,scored,user,archetype}=lastResult;
  const W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#171126');bg.addColorStop(.52,'#24172f');bg.addColorStop(1,'#120d1b');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  // soft celestial glows
  const glow=ctx.createRadialGradient(W*.5,250,10,W*.5,250,390);glow.addColorStop(0,'rgba(213,177,111,.16)');glow.addColorStop(1,'rgba(213,177,111,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#b98c55';ctx.lineWidth=2;roundRect(ctx,30,30,W-60,H-60,24,false,true);
  ctx.strokeStyle='rgba(226,195,137,.25)';ctx.lineWidth=1;roundRect(ctx,45,45,W-90,H-90,18,false,true);
  ctx.textAlign='center';
  ctx.fillStyle='#d9b774';ctx.font='18px Georgia';ctx.fillText('✦   THE LOVE ORACLE   ✦',W/2,91);
  ctx.fillStyle='#8f7399';ctx.font='64px serif';ctx.fillText('☾',W/2,172);
  ctx.fillStyle='#b6a8bd';ctx.font='22px "Microsoft YaHei",sans-serif';ctx.fillText('你的未来缘分磁场最靠近',W/2,218);
  ctx.fillStyle='#f4e8cf';ctx.font='600 84px "STSong","Songti SC",serif';ctx.fillText(top.name,W/2,318);
  ctx.fillStyle='#cdbbd1';ctx.font='20px "Microsoft YaHei",sans-serif';ctx.fillText(archetype.label,W/2,365);
  ctx.fillStyle='#cba66c';ctx.font='700 56px Georgia';ctx.fillText(scored[0].percent+'%',W/2,442);
  ctx.fillStyle='#9f91a7';ctx.font='18px "Microsoft YaHei",sans-serif';ctx.fillText('缘分磁场匹配度  ·  '+getRarityLabel(top.name).replace(/[✦✧]\s*/,''),W/2,478);
  // quote panel
  ctx.fillStyle='rgba(255,255,255,.055)';roundRect(ctx,80,515,W-160,116,20,true,false);
  ctx.strokeStyle='rgba(216,183,126,.16)';roundRect(ctx,80,515,W-160,116,20,false,true);
  ctx.fillStyle='#e7d8ea';ctx.font='22px "Microsoft YaHei",sans-serif';
  wrapText(ctx,top.sub,W-230).slice(0,2).forEach((line,i)=>ctx.fillText(line,W/2,558+i*34));
  // dimensions
  ctx.textAlign='left';ctx.fillStyle='#e8dcc7';ctx.font='700 23px "Microsoft YaHei",sans-serif';ctx.fillText('你的缘分磁场',90,690);
  const rows=DIMS;rows.forEach((k,i)=>{const y=735+i*48;ctx.fillStyle='#a99bae';ctx.font='16px "Microsoft YaHei",sans-serif';ctx.fillText(DIM_LABEL[k],90,y);ctx.fillStyle='rgba(255,255,255,.10)';roundRect(ctx,220,y-13,480,10,5,true,false);const gg=ctx.createLinearGradient(220,0,700,0);gg.addColorStop(0,'#8d6aa0');gg.addColorStop(1,'#d4ae72');ctx.fillStyle=gg;roundRect(ctx,220,y-13,480*user[k]/100,10,5,true,false);ctx.fillStyle='#c7b7cc';ctx.font='15px Georgia';ctx.fillText(String(user[k]),720,y)});
  // hidden signals
  ctx.fillStyle='rgba(255,255,255,.05)';roundRect(ctx,80,1030,W-160,84,18,true,false);
  ctx.textAlign='center';ctx.fillStyle='#b59da9';ctx.font='15px "Microsoft YaHei",sans-serif';ctx.fillText('隐藏缘分地',W/2,1058);
  ctx.fillStyle='#eadcc6';ctx.font='22px "Microsoft YaHei",sans-serif';ctx.fillText(`${scored[1].r.name}  ${scored[1].percent}%   ·   ${scored[2].r.name}  ${scored[2].percent}%`,W/2,1093);
  ctx.fillStyle='#796d82';ctx.font='13px "Microsoft YaHei",sans-serif';ctx.fillText('塔罗直觉测试 · 娱乐互动体验 · 保存分享你的缘分地图',W/2,1160);
  const url=c.toDataURL('image/png');
  $('#downloadPoster').href=url;
  $('#downloadPoster').download=`缘分地图-${top.name}.png`;
  $('#posterModal').classList.remove('hidden');
}
function canvasToBlob(canvas){return new Promise(resolve=>canvas.toBlob(resolve,'image/png',.96))}
async function sharePosterImage(){
  if(!lastResult)return;
  drawPoster();
  const canvas=$('#posterCanvas');
  const blob=await canvasToBlob(canvas);
  if(!blob)return;
  const file=new File([blob],`缘分地图-${lastResult.top.name}.png`,{type:'image/png'});
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({title:'我的缘分地图',text:`我测到的缘分地是 ${lastResult.top.name} ✦`,files:[file]});return}
    if(navigator.share){await navigator.share({title:'我的缘分地图',text:buildShareText()});return}
    alert('当前浏览器不支持直接分享图片，已为你生成海报，可点击“保存图片”后分享。')
  }catch(e){if(e&&e.name!=='AbortError')alert('分享未完成，可以保存图片后再分享。')}
}
function roundRect(ctx,x,y,w,h,r,fill,stroke){if(w<2*r)r=w/2;if(h<2*r)r=h/2;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke()}

function readAccessStore(){
  try{
    const raw=localStorage.getItem(CONFIG.STORAGE_KEY);
    const data=raw?JSON.parse(raw):{};
    if(!data.records||typeof data.records!=='object')data.records={};
    return data;
  }catch(e){return {records:{}}}
}
function writeAccessStore(data){
  try{localStorage.setItem(CONFIG.STORAGE_KEY,JSON.stringify(data));return true}catch(e){return false}
}
async function sha256Hex(text){
  if(!window.crypto||!crypto.subtle)return null;
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function getActiveAccess(){
  const store=readAccessStore();
  const hash=store.activeHash;
  const rec=hash&&store.records[hash];
  if(!rec)return null;
  const remaining=Math.max(0,Number(rec.remaining)||0);
  return {hash,remaining,activatedAt:rec.activatedAt||0};
}
function setActiveAccess(hash){
  const store=readAccessStore();
  const max=Number(CONFIG.MAX_REPORTS_PER_CODE)||10;
  if(!store.records[hash])store.records[hash]={remaining:max,activatedAt:Date.now()};
  store.activeHash=hash;
  writeAccessStore(store);
  activeCodeHash=hash;
  codeVerified=(store.records[hash].remaining||0)>0;
  return {ok:codeVerified,remaining:Math.max(0,store.records[hash].remaining||0)};
}
function consumeLocalReport(){
  const store=readAccessStore();
  const hash=activeCodeHash||store.activeHash;
  if(!hash||!store.records[hash])return {ok:false,remaining:0};
  const rec=store.records[hash];
  const remaining=Math.max(0,Number(rec.remaining)||0);
  if(remaining<=0)return {ok:false,remaining:0};
  rec.remaining=remaining-1;
  rec.lastUsedAt=Date.now();
  store.records[hash]=rec;
  store.activeHash=hash;
  writeAccessStore(store);
  codeVerified=rec.remaining>0;
  return {ok:true,remaining:rec.remaining};
}
function refreshAccessUI(message=''){
  const a=getActiveAccess();
  activeCodeHash=a?.hash||null;
  codeVerified=!!a&&a.remaining>0;
  const panel=$('#usagePanel'),count=$('#remainingCount'),cont=$('#accessContinueBtn'),msg=$('#codeMsg');
  if(panel)panel.classList.toggle('hidden',!a);
  if(count)count.textContent=a?String(a.remaining):'0';
  if(cont){cont.disabled=!codeVerified;cont.textContent=codeVerified?`继续进入塔罗桌 · 剩余 ${a.remaining} 次`:'额度已用完，请输入新的授权码'}
  if(msg&&message)msg.textContent=message;
  return a;
}
async function verifyAccessCode(value){
  const code=value.trim().toUpperCase();
  if(!code)return {ok:false,error:'empty'};
  if(CONFIG.AUTH_API_URL){
    try{
      const res=await fetch(CONFIG.AUTH_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,action:'activate',deviceScope:'browser'})});
      if(!res.ok)return {ok:false};
      const data=await res.json();
      return {ok:!!data.ok,remaining:data.remaining,backend:true};
    }catch(e){return {ok:false,error:'network'}}
  }
  const hash=await sha256Hex(code);
  if(!hash)return {ok:false,error:'crypto'};
  if(!(CONFIG.LOCAL_CODE_HASHES||[]).includes(hash))return {ok:false,error:'invalid'};
  return setActiveAccess(hash);
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
  $('#startBtn').disabled=false;
  $('#startBtn span').textContent=mode==='china'?'继续 · 中国缘分版':'继续 · 世界缘分版';
});
$('#startBtn').onclick=()=>{
  if(!mode)return;
  show('access');
  refreshAccessUI();
};
$('#accessBackBtn').onclick=()=>show('home');
$('#accessContinueBtn').onclick=()=>{
  const a=refreshAccessUI();
  if(!a||a.remaining<=0)return;
  show('intro');
};
$('#beginTest').onclick=()=>{
  const a=refreshAccessUI();
  if(CONFIG.REQUIRE_CODE&&(!a||a.remaining<=0)){show('access');return}
  qIndex=0;answers=[];const b=$('#beginTest');b.classList.add('shuffling');b.querySelector('span').textContent='正在洗牌…';setTimeout(()=>{b.classList.remove('shuffling');b.querySelector('span').textContent='开始洗牌';show('quiz');startQuestion()},1150)
};
$('#quitBtn').onclick=()=>{clearInterval(timerId);show('home')};
$('#retryBtn').onclick=()=>{
  const a=refreshAccessUI();
  if(CONFIG.REQUIRE_CODE&&(!a||a.remaining<=0)){show('access');return}
  qIndex=0;answers=[];show('intro')
};
$('#switchBtn').onclick=()=>{
  mode=null;
  $$('.mode-card').forEach(x=>x.classList.remove('active'));
  $('#startBtn').disabled=true;
  $('#startBtn span').textContent='先选择测试版本';
  show('home');
};
$('#verifyCode').onclick=async()=>{
  const input=$('#accessCode');
  const value=input.value.trim().toUpperCase();
  if(!value){$('#codeMsg').textContent='请输入授权码';return}
  $('#verifyCode').disabled=true;
  $('#codeMsg').textContent='正在验证入场券…';
  const r=await verifyAccessCode(value);
  $('#verifyCode').disabled=false;
  if(r.ok){
    input.value='';
    $('#codeMsg').textContent=`授权成功 ✓ · 本设备剩余 ${r.remaining} 次`;
    $('#codeMsg').style.color='#d8c390';
    refreshAccessUI();
  }else{
    const text=r.error==='network'?'授权服务暂时不可用，请稍后重试':r.error==='crypto'?'当前浏览器不支持安全校验，请更换现代浏览器':'授权码无效或格式不正确，请检查后重试';
    $('#codeMsg').textContent=text;
    $('#codeMsg').style.color='#efaaaa';
    refreshAccessUI();
  }
};
$('#accessCode').addEventListener('input',e=>{
  let v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(v.startsWith('YF'))v=v.slice(2);
  v=v.slice(0,12);
  const parts=[v.slice(0,4),v.slice(4,8),v.slice(8,12)].filter(Boolean);
  e.target.value='YF-'+parts.join('-');
});
$('#accessCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('#verifyCode').click()});
refreshAccessUI();
$('#copyResultBtn').onclick=async()=>{
  const t=buildShareText();
  try{await navigator.clipboard.writeText(t);$('#copyResultBtn').textContent='已复制 ✓';setTimeout(()=>$('#copyResultBtn').textContent='复制结果文案',1400)}
  catch(e){alert(t)}
};
$('#posterBtn').onclick=drawPoster;
$('#quickShareBtn').onclick=async()=>{if(navigator.share){try{await navigator.share({title:'我的缘分地图',text:buildShareText()})}catch(e){if(e&&e.name!=='AbortError')drawPoster()}}else drawPoster()};
$('#sharePoster').onclick=sharePosterImage;
$('#closePoster').onclick=()=>$('#posterModal').classList.add('hidden');
$('#posterModal').onclick=e=>{if(e.target===$('#posterModal'))$('#posterModal').classList.add('hidden')};
