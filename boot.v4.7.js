// A separate, small startup guard remains usable even when app.js fails to load/parse.
(function(){
  function failed(){
    if(window.TAROT_APP_READY||document.getElementById('startupError'))return;
    var box=document.createElement('div');box.id='startupError';box.setAttribute('role','alert');
    box.style.cssText='position:fixed;inset:20px 12px auto;z-index:99999;background:#21152f;color:#fff;padding:24px;border:1px solid #d9b774;border-radius:14px;text-align:center';
    var text=document.createElement('p');text.textContent='测试文件未能完整加载，请检查网络后重试。如仍失败，请联系商家确认部署文件完整。';
    var button=document.createElement('button');button.textContent='重新加载';button.onclick=function(){location.reload()};
    box.appendChild(text);box.appendChild(button);document.body.appendChild(box);
  }
  window.addEventListener('error',function(event){if(event.target&&event.target.tagName==='SCRIPT')failed()},true);
  window.addEventListener('load',failed);
  setTimeout(failed,12000);
})();
