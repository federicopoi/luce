/* Browser-only fixtures for Luce's unchanged renderer. No IPC, filesystem, authentication or network bridge. */
(()=>{
'use strict';
const clone=v=>structuredClone(v),scene=new URLSearchParams(location.search).get('scene')||'workspace';
if(location.pathname.includes('/mobile/'))Object.defineProperty(navigator,'serviceWorker',{value:{register:async()=>({update:async()=>{}})}});
const nativeFocus=HTMLElement.prototype.focus;HTMLElement.prototype.focus=function(options){return nativeFocus.call(this,{...options,preventScroll:true})};
const store=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()}});
store.set('luce.remote.device.v1',JSON.stringify({hostId:'landing-demo',deviceId:'demo-phone',key:'demo-only-not-a-pairing-key',relayURL:'https://example.invalid'}));
if(scene==='tabs')store.set('luce-project-view','tabs');
const now=Date.now(),age=n=>new Date(now-n*60000).toISOString();
const projects=[{id:'p1',name:'Luce website',directory:'/Users/demo/Projects/luce-website',path:'/Users/demo/Projects/luce-website',layout:4,codexAccountId:'personal',githubAccountId:'personal',conversationNames:{}},{id:'p2',name:'Personal projects',directory:'/Users/demo/Projects/personal',path:'/Users/demo/Projects/personal',layout:2,codexAccountId:'personal',githubAccountId:'personal',conversationNames:{}},{id:'p3',name:'Client work',directory:'/Users/demo/Projects/client',path:'/Users/demo/Projects/client',layout:2,codexAccountId:'default',githubAccountId:'work',conversationNames:{}}];
const account=(id,name)=>({id,name,status:'signed-in',managed:id!=='default',email:name.toLowerCase()+'@example.com',usage:{windows:[{label:'5h',usedPercent:id==='personal'?24:38,resetsAt:Math.floor((now+7200000)/1000)}],updatedAt:age(0),status:'available'}});
const state={selectedProjectId:'p1',projects,providers:{codex:true,claude:true},accounts:[account('default','Work'),account('personal','Personal')],githubAccounts:[{id:'personal',name:'Personal',login:'personal-demo',status:'signed-in',commitName:'Demo developer',commitEmail:'personal@example.com'},{id:'work',name:'Work',login:'work-demo',status:'signed-in',commitName:'Demo developer',commitEmail:'work@example.com'}],githubAvailable:true,history:[],terminals:[],discoveredProjects:[],workspaceRestoring:false,historyLoading:false,preferences:{completionSound:false,cliAutoUpdates:true},cliUpdates:{codex:{status:'current'},claude:{status:'current'}},approvals:[],remote:{configured:true,enabled:true,connected:true,keepAwake:true,devices:[{id:'phone',name:'My phone',connected:true}]},remoteCapabilities:{previewControls:true,sessionControls:true}};
const definitions=[['t1','p1','codex','Build the landing page','personal',true],['t2','p1','claude','Review the components','default',false],['t3','p1','codex','Polish responsive styles','default',true],['t4','p1','shell','Run the local preview','default',false],['t5','p2','codex','Build the habit tracker','personal',true],['t6','p2','claude','Plan the data model','default',false],['t7','p3','claude','Plan the client dashboard','default',false]];
for(const [id,projectId,provider,title,accountId,working]of definitions){
 const project=projects.find(p=>p.id===projectId);
 state.terminals.push({id,projectId,provider,title,accountId,restoredFromId:null,githubAccountId:project.githubAccountId,workingDirectory:project.directory,status:'running',working,completionPending:false,approvalsCapable:provider!=='shell',autoApprove:false,conversationId:'h-'+id,createdAt:age(12),startedAt:age(12),cols:54,rows:24,previewAvailable:['t1','t4'].includes(id),previewURL:['t1','t4'].includes(id)?'http://localhost:3000':'',diskBytes:12400});
 if(provider!=='shell')state.history.push({id:'h-'+id,provider,title,accountId,directory:project.directory,updatedAt:age(20),diskBytes:12400});
}
state.history.push({id:'saved-1',provider:'codex',title:'Add keyboard shortcuts',accountId:'personal',directory:projects[0].directory,updatedAt:age(48),diskBytes:14800},{id:'saved-2',provider:'claude',title:'Review the navigation',accountId:'default',directory:projects[0].directory,updatedAt:age(85),diskBytes:22800},{id:'saved-3',provider:'codex',title:'Plan the landing page',accountId:'default',directory:projects[2].directory,updatedAt:age(1500),diskBytes:18400});
state.discoveredProjects=projects.map(p=>({directory:p.directory,name:p.name,count:3}));
state.approvals=[{id:'approval-1',requestId:'approval-1',terminalId:'t2',provider:'claude',title:'Run tests',summary:'npm test',status:'pending'}];
const buffers=new Map(),offsets=new Map(),inputs=new Map(),listeners={state:[],data:[],shortcut:[],preview:[]};
function initialBuffer(s){
 if(s.provider==='shell')return '\x1b[90m'+s.workingDirectory.replace('/Users/demo','~')+'\x1b[0m\r\n\r\n$ npm run dev\r\n\r\n\x1b[32m  Ready in 280 ms\x1b[0m\r\n  Local: http://localhost:3000\r\n\r\n';
 const claude=s.provider==='claude';
 return (claude?'\x1b[38;2;217;119;87m✳ Claude Code\x1b[0m':'\x1b[1mOpenAI Codex\x1b[0m')+'\r\n\x1b[90m'+s.workingDirectory.replace('/Users/demo','~')+'\x1b[0m\r\n\r\n'+(claude?'❯ ':'› ')+s.title+'\r\n\r\n';
}
for(const s of state.terminals){buffers.set(s.id,initialBuffer(s));offsets.set(s.id,0)}
function emitState(){for(const callback of listeners.state)callback(clone(state));demo.phoneConnection?.events?.get('state')?.(clone(state))}
function write(id,data){buffers.set(id,(buffers.get(id)||'')+data);const offset=(offsets.get(id)||0)+data.length;offsets.set(id,offset);for(const callback of listeners.data)callback({id,data,offset});demo.phoneConnection?.events?.get('terminal-data')?.({id,data,offset})}
function notify(message){const el=document.getElementById('toast');if(el){el.textContent=message;el.hidden=false;setTimeout(()=>el.hidden=true,2800)}}
function change(fn){fn();emitState();return clone(state)}
function terminal(id){const s=state.terminals.find(t=>t.id===id);if(!s)throw Error('This demo terminal is no longer open.');return s}
function updateStatus(id,working){const s=terminal(id);s.working=working;if(!working)s.completionPending=true;emitState()}
function previewSurface(){const surface=document.getElementById('browser-surface');if(!surface)return;let el=document.getElementById('demo-browser-view');if(!el){el=document.createElement('div');el.id='demo-browser-view';el.innerHTML='<small>LUCE WEBSITE · LOCAL PREVIEW</small><h1>A home for your<br>coding agents.</h1><p>Build with the tools you love.<br>Keep every project in view.</p><span>Made locally, with Luce.</span>';surface.append(el)}el.hidden=false}
const api={
 getState:async()=>clone(state),getTerminal:async id=>({buffer:buffers.get(id)||'',outputOffset:offsets.get(id)||0,cols:terminal(id).cols,rows:terminal(id).rows}),
 isFullscreen:async()=>false,onFullscreen:()=>()=>{},
 onState:cb=>(listeners.state.push(cb),()=>{}),onData:cb=>(listeners.data.push(cb),()=>{}),onShortcut:cb=>(listeners.shortcut.push(cb),()=>{}),onPreview:cb=>(listeners.preview.push(cb),()=>{}),
 selectProject:async id=>change(()=>state.selectedProjectId=id),updateProject:async(id,patch)=>change(()=>Object.assign(projects.find(p=>p.id===id),patch)),
 createConversationProject:async(identity,name)=>{const h=state.history.find(h=>h.id===identity.id);const p={id:'group-'+Date.now(),name,directory:h?.directory||'/Users/demo/Projects/demo',layout:4,conversationGroup:true,conversationNames:{}};state.projects.push(p);if(h)h.assignedProjectId=p.id;state.selectedProjectId=p.id;emitState();return clone(p)},
 addProject:async directory=>{const p={id:'p'+(projects.length+1),name:'New demo project',directory:directory||'/Users/demo/Projects/new-project',layout:4,conversationNames:{}};projects.push(p);state.selectedProjectId=p.id;emitState();return clone(p)},
 removeProject:async id=>change(()=>{state.projects=state.projects.filter(p=>p.id!==id);state.terminals=state.terminals.filter(t=>t.projectId!==id);state.selectedProjectId=state.projects[0]?.id}),
 moveProject:async(id,targetId,after)=>change(()=>{const list=state.projects,row=list.splice(list.findIndex(p=>p.id===id),1)[0];list.splice(list.findIndex(p=>p.id===targetId)+(after?1:0),0,row)}),
 refreshHistory:async()=>clone(state),refreshAccounts:async()=>clone(state),refreshGitHubAccounts:async()=>clone(state),
 createTerminal:async options=>{const p=state.projects.find(p=>p.id===options.projectId),s={id:'new-'+Date.now(),projectId:p.id,provider:options.provider,title:options.title||'New '+(options.provider==='shell'?'shell':'conversation'),accountId:options.accountId||p.codexAccountId||'personal',githubAccountId:p.githubAccountId,workingDirectory:p.directory,status:'running',working:false,autoApprove:false,approvalsCapable:options.provider!=='shell',conversationId:options.conversationId||null,restoredFromId:null,createdAt:age(0),cols:54,rows:24};state.terminals.push(s);buffers.set(s.id,initialBuffer(s));offsets.set(s.id,0);emitState();return clone(s)},
 closeTerminal:async id=>change(()=>state.terminals=state.terminals.filter(t=>t.id!==id)),
 renameTerminal:async(id,title)=>change(()=>terminal(id).title=title),
 renameConversation:async(identity,title)=>change(()=>{const h=state.history.find(h=>h.id===identity.id);if(h)h.title=title;const s=state.terminals.find(s=>s.conversationId===identity.id);if(s)s.title=title}),
 switchAccount:async(id,targetId)=>{const s=terminal(id);s.accountId=targetId;emitState();return clone(s)},
 setAutoApprove:async(id,enabled)=>change(()=>terminal(id).autoApprove=enabled),
 resizeTerminal:async(id,cols,rows)=>{const s=terminal(id);s.cols=cols;s.rows=rows;return{ok:true}},
 writeTerminal:async(id,data)=>{if(data==='\x03'){write(id,'^C\r\n');updateStatus(id,false);return}
 if(data==='\x0c'){write(id,'\x1b[2J\x1b[H');return}
 if(data==='\x15'){inputs.set(id,'');write(id,'\r\x1b[2K');return}
 if(data==='\r'){const input=inputs.get(id)||'';inputs.set(id,'');write(id,'\r\n\r\n\x1b[90mDemo input received locally.\x1b[0m\r\n'+(input?'\x1b[32mReviewing the requested changes…\x1b[0m\r\n':''));updateStatus(id,true);return}
 inputs.set(id,(inputs.get(id)||'')+data);write(id,data)},
 addAccount:async name=>{if(!name?.trim())throw Error('Enter an account name.');const a=account('demo-'+Date.now(),name.trim());a.managed=true;state.accounts.push(a);emitState();return clone(a)},
 renameAccount:async(id,name)=>change(()=>state.accounts.find(a=>a.id===id).name=name),
 loginAccount:async()=>notify('Demo accounts are illustrative. Sign in inside Luce on your Mac.'),cancelAccountLogin:async()=>{},removeAccount:async id=>change(()=>state.accounts=state.accounts.filter(a=>a.id!==id)),
 addGitHubAccount:async name=>{const a={id:'github-'+Date.now(),name:name||'Demo profile',login:'demo',status:'signed-in'};state.githubAccounts.push(a);emitState();return clone(a)},
 updateGitHubAccount:async(id,patch)=>change(()=>Object.assign(state.githubAccounts.find(a=>a.id===id),patch)),
 loginGitHubAccount:async()=>notify('Sign in to GitHub inside Luce. This demo never starts authentication.'),cancelGitHubLogin:async()=>{},removeGitHubAccount:async id=>change(()=>state.githubAccounts=state.githubAccounts.filter(a=>a.id!==id)),openGitHubLogin:async()=>notify('Use Luce on your Mac to sign in.'),copyGitHubCode:async()=>{},
 setCompletionSound:async enabled=>change(()=>state.preferences.completionSound=enabled),previewSound:async()=>notify('Completion sound preview is available in Luce.'),
 setCLIAutoUpdates:async enabled=>change(()=>state.preferences.cliAutoUpdates=enabled),checkCLIUpdates:async()=>notify('Demo only — no CLI updates are downloaded.'),
 hidePreview:async()=>{const el=document.getElementById('demo-browser-view');if(el)el.hidden=true;return{ok:true}},
 showPreview:async options=>{previewSurface();return{url:options.url}},previewBounds:async()=>{previewSurface();return{ok:true}},reloadPreview:async()=>notify('Local preview refreshed.'),
 listProjectFiles:async(id,relative)=>({entries:(relative?['app.js','styles.css']:['src','README.md','package.json']).map(name=>({name,relative:relative?relative+'/'+name:name,path:projects.find(p=>p.id===id).directory+'/'+(relative?relative+'/':'')+name,directory:name==='src'}))}),
 previewProjectFile:async(id,relative)=>({kind:'text',name:relative.split('/').pop(),path:projects.find(p=>p.id===id).directory+'/'+relative,size:240,text:relative.endsWith('.css')?'.workspace {\n  display: grid;\n  background: #1c1c1c;\n}\n':relative.endsWith('.json')?'{"name":"luce-website","scripts":{"dev":"vite"}}':'// Demo project\nconst agents = ["Codex", "Claude Code"];\nconst layouts = [1, 2, 4];\n'}),
 resolveProjectFile:async(id,relative)=>projects.find(p=>p.id===id).directory+'/'+relative,locateTerminalFile:async()=>null,filePath:()=>'',saveAttachment:async()=>{throw Error('File attachments are available in Luce, not this demo.')},
 assignConversation:async(identity,projectId)=>change(()=>state.history.find(h=>h.id===identity.id).assignedProjectId=projectId),
 linkConversation:async(id,conversationId)=>change(()=>terminal(id).conversationId=conversationId),pasteContinuation:async()=>{},textContinuation:async id=>clone(terminal(id)),
 remoteStatus:async()=>clone(state.remote),enableRemote:async()=>change(()=>state.remote.enabled=true),disableRemote:async()=>change(()=>state.remote.enabled=false),remoteAwake:async value=>change(()=>state.remote.keepAwake=value),
 pairPhone:async()=>{throw Error('Pair your real phone from Luce on your Mac. This browser demo has no pairing keys.')},revokePhone:async id=>change(()=>state.remote.devices=state.remote.devices.filter(d=>d.id!==id)),
 approveRemote:async(requestId,decision)=>{const approval=state.approvals.find(a=>a.id===requestId);if(approval){state.approvals=state.approvals.filter(a=>a.id!==requestId);terminal(approval.terminalId).working=decision==='accept';emitState();parent.postMessage({type:'luce-demo-approval',working:decision==='accept'},location.origin)}return{ok:true}}
};
window.luce=api;window.confirm=()=>true;
const demo=window.__luceDemo={state,api,scene,write,emitState,terminal,shortcut:name=>listeners.shortcut.forEach(cb=>cb(name)),phoneConnection:null,manual:false};
let timer=null,phase=0;
function autoplay(active){clearInterval(timer);timer=null;if(!active||demo.manual||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 timer=setInterval(()=>{phase=(phase+1)%6;for(const id of ['t1','t3']){const s=state.terminals.find(t=>t.id===id);if(!s)continue;
 if(phase===1){write(id,'\x1b[2J\x1b[H'+initialBuffer(s));s.working=true;s.completionPending=false;emitState()}
 if(phase===2)write(id,'\x1b[90m• Reading project files\x1b[0m\r\n');
 if(phase===3)write(id,'  src/app.js \x1b[32m+52\x1b[0m \x1b[31m−4\x1b[0m\r\n');
 if(phase===4)write(id,'\x1b[32m✓ Changes applied. Preview ready.\x1b[0m\r\n\r\n');
 if(phase===5){write(id,'\x1b[48;2;55;55;55m Ask Codex to do anything                  \x1b[0m\r\n');s.working=false;s.completionPending=true;emitState()}
 }},2100);
}
demo.setAutoplay=autoplay;
document.addEventListener('pointerdown',()=>{demo.manual=true;autoplay(false)},{once:true});document.addEventListener('keydown',()=>{demo.manual=true;autoplay(false)},{once:true});
addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='luce-demo-active')autoplay(e.data.active);if(e.data?.type==='luce-demo-command')demo.shortcut(e.data.command);if(e.data?.type==='luce-demo-sync-approval'){state.approvals=[];const s=state.terminals.find(t=>t.id==='t2');if(s){s.working=e.data.working;emitState()}}});
/* Initial excerpts include the gray Codex input used in the updated IDE. */
setTimeout(()=>{for(const s of state.terminals){if(s.provider==='codex')write(s.id,'\x1b[90m• Reading the project\x1b[0m\r\n  src/app.js \x1b[32m+52\x1b[0m \x1b[31m−4\x1b[0m\r\n\x1b[32m✓ Changes applied\x1b[0m\r\n\r\n\x1b[48;2;55;55;55m Ask Codex to do anything                  \x1b[0m\r\n');if(s.provider==='claude')write(s.id,'I’ve reviewed the components.\r\n\r\nWaiting for permission to run tests.\r\n')}},700);
})();
