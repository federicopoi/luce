/* Landing-page controls. Product demos run the genuine Luce renderer in isolated frames. */
(()=>{
 const frames=[...document.querySelectorAll('.native-demo iframe')];
 function fit(frame){
  const box=frame.parentElement,phone=box.classList.contains('native-phone'),mobile=innerWidth<=650&&!phone;
  let width=phone?390:1320,height=phone?800:800;
  const scale=phone?Math.min(box.clientWidth/width,box.clientHeight/height):mobile?Math.min(.62,box.clientHeight/height):box.clientWidth/width;
  if(!phone&&!mobile)height=box.clientHeight/scale;
  const contentWidth=width*scale,contentHeight=height*scale;
  box.classList.toggle('panorama',mobile);
  frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform='scale('+scale+')';
  frame.style.left=(mobile?0:Math.max(0,(box.clientWidth-contentWidth)/2))+'px';
  frame.style.top=Math.max(0,(box.clientHeight-contentHeight)/2)+'px';
  let spacer=box.querySelector('.native-canvas');
  if(!spacer){spacer=document.createElement('div');spacer.className='native-canvas';spacer.setAttribute('aria-hidden','true');box.append(spacer)}
  spacer.style.width=(mobile?contentWidth:box.clientWidth)+'px';spacer.style.height=box.clientHeight+'px';
  if(mobile&&!box.dataset.positioned){box.scrollLeft=['accounts','history'].includes(box.dataset.scene)?(contentWidth-box.clientWidth)/2:0;box.dataset.positioned='true'}
 }
 const resize=new ResizeObserver(entries=>entries.forEach(e=>{const f=e.target.querySelector('iframe');if(f)fit(f)}));frames.forEach(f=>{resize.observe(f.parentElement);fit(f)});
 const visibility=new IntersectionObserver(entries=>entries.forEach(e=>e.target.contentWindow?.postMessage({type:'luce-demo-active',active:e.isIntersecting},location.origin)),{threshold:.15});frames.forEach(f=>visibility.observe(f));
 addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='luce-demo-ready'){const f=frames.find(f=>f.contentWindow===e.source);if(f){fit(f);const r=f.parentElement.getBoundingClientRect();f.contentWindow.postMessage({type:'luce-demo-active',active:r.top<innerHeight&&r.bottom>0},location.origin)}}if(e.data?.type==='luce-demo-approval'){frames.forEach(f=>{if(f.contentWindow!==e.source)f.contentWindow.postMessage({type:'luce-demo-sync-approval',working:e.data.working},location.origin)});document.getElementById('mac-remote-state').textContent=e.data.working?'Working':'Waiting'}});
 const menu=document.querySelector('.menu-toggle');menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.querySelector('#site-nav').classList.toggle('open',open)};
 document.querySelectorAll('#site-nav a').forEach(a=>a.onclick=()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#site-nav').classList.remove('open')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');document.querySelector('#site-nav').classList.remove('open')}});
 const theme=document.getElementById('theme-toggle');function updateTheme(dark){document.body.classList.toggle('dark',dark);theme.setAttribute('aria-pressed',dark);theme.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');theme.innerHTML=dark?'☾ &nbsp; Dark':'☼ &nbsp; Light'};try{updateTheme(localStorage.getItem('luce-site-theme')==='dark')}catch{};theme.onclick=()=>{const dark=document.body.classList.toggle('dark');theme.setAttribute('aria-pressed',dark);theme.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');theme.innerHTML=dark?'☾ &nbsp; Dark':'☼ &nbsp; Light';try{localStorage.setItem('luce-site-theme',dark?'dark':'light')}catch{}};
 document.querySelectorAll('[data-download]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  document.getElementById('download-status').textContent='Your download is starting. Follow these steps once the DMG arrives.';
  document.getElementById('install-guide').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  document.getElementById('install-title').focus({preventScroll:true});
 }));
})();
