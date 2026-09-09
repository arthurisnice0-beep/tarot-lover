const DECK_ASSETS={china:'./assets/golden-oracle.png',world:'./assets/moonlit-oracle.png'};
// Atlas panel boundaries measured from the generated artwork. Inset avoids adjoining cells.
function deckStyle(edition,row,col){
 const grid=edition==='china'?{x:[0,.232,.5,.736,1],y:[0,.333,.651,1]}:{x:[0,.243,.501,.758,1],y:[0,.329,.652,1]};
 const left=grid.x[col]+.0015,top=grid.y[row]+.0015,width=grid.x[col+1]-grid.x[col]-.003,height=grid.y[row+1]-grid.y[row]-.003;
 return `background-image:url('${DECK_ASSETS[edition]}');background-size:${100/width}% ${100/height}%;background-position:${left/(1-width)*100}% ${top/(1-height)*100}%`;
}
const INTUITION_BANKS={
china:[
{title:'第一眼，哪张牌最吸引你？',desc:'先在心里想一想你的缘分，再选一张。',cards:['月牙','纸船','花枝','镜子'],vectors:[[1,2,0,3,2,3],[1,3,1,2,3,1],[3,1,2,3,0,1],[1,0,3,1,2,3]]},
{title:'哪张牌让你想再多看一眼？',desc:'不需要解释原因，跟着目光停留的地方选。',cards:['星光水晶球','钥匙','烛火','羽毛'],vectors:[[1,1,1,3,1,3],[2,2,3,0,1,1],[3,0,2,2,0,3],[0,3,1,1,3,2]]},
{title:'最后，把你的心意交给一张牌。',desc:'选好这一张，就翻开你的缘分结果。',cards:['水晶棱镜','珍珠贝壳','丝带','晨光之门'],vectors:[[1,3,1,1,2,3],[2,0,3,3,1,1],[3,0,2,2,1,3],[2,3,1,2,3,0]]}
],
world:[
{title:'静下心，哪张牌像在回应你？',desc:'不猜含义，选让你有一点感觉的那张。',cards:['水晶灵摆','银色星星','信封','蝴蝶'],vectors:[[1,1,2,0,2,3],[2,3,1,2,3,0],[3,0,3,2,0,2],[1,3,0,3,2,2]]},
{title:'让目光停下来，你会留下哪张？',desc:'只看画面，不用比较哪一张更好。',cards:['星尘沙漏','月光海螺','音乐盒','蓝玫瑰'],vectors:[[1,0,3,1,2,3],[1,3,1,2,3,1],[3,0,2,2,1,3],[2,1,1,3,1,2]]},
{title:'凭最后的直觉，选一张属于你的牌。',desc:'这次选择之后，直接查看你的缘分解读。',cards:['月牙小舟','玻璃提灯','月光石环','银铃'],vectors:[[0,3,1,2,3,2],[3,1,3,2,0,1],[2,0,3,1,2,3],[3,2,0,3,1,1]]}
]};
