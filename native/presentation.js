/* Presentation only; Luce source renderer/styles remain unchanged. */
(async()=>{
 const mobile=location.pathname.includes('/mobile/');
 for(let i=0;i<80&&!document.querySelector(mobile?'#tabbar:not([hidden])':'.terminal-pane');i++)await new Promise(r=>setTimeout(r,50));
 if(!mobile){const chrome=document.createElement('div');chrome.className='demo-traffic';chrome.setAttribute('aria-hidden','true');chrome.innerHTML='<i></i><i></i><i></i>';document.body.append(chrome);
 const scene=window.__luceDemo.scene;
 if(scene==='accounts')window.__luceDemo.shortcut('accounts');
 if(scene==='history'){window.__luceDemo.shortcut('search');setTimeout(()=>{const input=document.querySelector('.spotlight-field input');if(input){input.value='landing';input.dispatchEvent(new Event('input',{bubbles:true}))}},180)}
 if(scene==='files'){document.getElementById('browse-files').click();for(let i=0;i<40&&!document.querySelector('[data-file-relative="README.md"]');i++)await new Promise(r=>setTimeout(r,50));document.querySelector('[data-file-relative="README.md"]')?.click()}
 if(scene==='preview'){window.__luceDemo.shortcut('toggle-preview')}
 document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();window.__luceDemo.shortcut('search')}});
 }else{document.querySelector('[data-view="terminal"]')?.click()}
 parent.postMessage({type:'luce-demo-ready'},location.origin);
})();
