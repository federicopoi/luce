export class PhoneConnection {
 constructor(options){this.options=options;this.events=new Map();window.__luceDemo.phoneConnection=this}
 onStatus(callback){this.status=callback}
 onEvent(name,callback){this.events.set(name,callback)}
 async connect(){this.status?.({connected:true});setTimeout(()=>{this.status?.({connected:true,ready:true});this.events.get('state')?.(structuredClone(window.__luceDemo.state))},20)}
 close(){this.status?.({connected:false})}
 async request(method,params={}){
 const demo=window.__luceDemo,api=demo.api,state=demo.state;
 switch(method){
 case 'state':return structuredClone(state);
 case 'terminalSnapshot':return api.getTerminal(params.id);
 case 'write':return api.writeTerminal(params.id,params.data);
 case 'submit':await api.writeTerminal(params.id,params.data);await api.writeTerminal(params.id,'\r');return{ok:true};
 case 'approve':return api.approveRemote(params.requestId,params.decision);
 case 'rename':return api.renameTerminal(params.id,params.title);
 case 'autoApprove':return api.setAutoApprove(params.id,params.enabled);
 case 'interrupt':return api.writeTerminal(params.id,'\x03');
 case 'close':return api.closeTerminal(params.id);
 case 'create':return api.createTerminal(params);
 case 'preview':{const canvas=document.createElement('canvas');canvas.width=params.mode==='desktop'?1280:390;canvas.height=params.mode==='desktop'?800:740;const c=canvas.getContext('2d');c.fillStyle='#f7f7f4';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#26261f';c.font='bold 34px Arial';c.fillText('luce',30,55);c.font='26px Arial';c.fillText('A home for your',30,180);c.fillText('coding agents.',30,215);c.fillStyle='#d8d2c6';c.fillRect(30,260,canvas.width-60,300);return{jpeg:canvas.toDataURL('image/jpeg'),width:canvas.width,height:canvas.height}}
 case 'previewInput':return{ok:true};
 case 'pushKey':throw Error('Push notifications are available after pairing with Luce. This is a local demo.');
 case 'pushUnsubscribe':return{ok:true};
 default:throw Error('Operation is not available in this browser demo: '+method)
 }
 }
}