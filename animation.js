(function(){
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),players=new Set();
  const t=(en,bn)=>document.documentElement.lang==='bn'?bn:en;
  class Player{
    constructor({count=0,duration=1600,render=()=>{},state=()=>{}}={}){Object.assign(this,{count,duration,render,onState:state,position:0,speed:1,playing:false,raf:null,last:null});players.add(this);}
    configure(count,position=0){this.pause();this.count=count;this.seek(position);}
    seek(position){this.position=Math.max(0,Math.min(Math.max(0,this.count-1),position));this.render(this.position);this.onState(this);}
    pause(){this.playing=false;this.last=null;if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.onState(this);}
    play(){if(this.playing||this.count<2||reduced.matches)return;if(this.position>=this.count-1)this.seek(0);this.playing=true;this.last=null;this.onState(this);this.raf=requestAnimationFrame(now=>this.tick(now));}
    tick(now){this.raf=null;if(!this.playing)return;const delta=this.last===null?0:Math.min(100,now-this.last);this.last=now;this.seek(this.position+delta*this.speed/this.duration);if(this.position>=this.count-1){if(this.loop)this.seek(0);else this.pause();}if(this.playing)this.raf=requestAnimationFrame(time=>this.tick(time));}
    previous(){this.pause();this.seek(Math.max(0,Math.ceil(this.position-1e-8)-1));}
    next(){this.pause();this.seek(Math.min(this.count-1,Math.floor(this.position+1e-8)+1));}
    replay(){this.pause();this.seek(0);if(!reduced.matches)this.play();}
    cancel(){this.pause();this.count=0;this.position=0;this.onState(this);}
    destroy(){this.cancel();players.delete(this);}
  }
  function controls(host,player,{prefix='lesson',existing={},describe=null}={}){
    host.classList.add('shared-player');
    function button(key,label,bn,action){let el=existing[key]?document.getElementById(existing[key]):null;if(!el){el=document.createElement('button');el.id=prefix+'-'+key;el.type='button';el.textContent=label;}if(el.parentElement!==host)host.append(el);if(action)el.addEventListener('click',action);el.dataset.playerLabel=key;return el;}
    const prev=button('prev','← Previous','← আগের ধাপ',()=>player.previous()),play=button('play','Play','চালু',()=>player.playing?player.pause():player.play()),next=button('next','Next →','পরবর্তী →',()=>player.next()),replay=button('replay','↻ Replay','↻ আবার',()=>player.replay());
    const speedLabel=document.createElement('label');speedLabel.textContent='Speed';let speed=existing.speed?document.getElementById(existing.speed):null;
    if(!speed){speed=document.createElement('input');speed.id=prefix+'-speed';Object.assign(speed,{type:'range',min:'.25',max:'3',step:'.25',value:'1'});host.append(speedLabel,speed);}speedLabel.htmlFor=speed.id;
    let status=existing.status?document.getElementById(existing.status):null;if(!status){status=document.createElement('span');status.id=prefix+'-status';host.append(status);}status.setAttribute('role','status');
    const progress=document.createElement('progress');progress.id=prefix+'-progress';progress.setAttribute('aria-label','Animation progress');host.append(progress);
    const scrub=document.createElement('input');scrub.id=prefix+'-scrub';scrub.type='range';scrub.min='0';scrub.max='1';scrub.step='any';scrub.value='0';scrub.className='timeline-scrub';host.append(scrub);scrub.addEventListener('input',()=>{const position=Number(scrub.value);player.pause();player.seek(position);});
    const speedValue=document.getElementById(existing.value||prefix+'-speed-value')||document.createElement('output');speedValue.setAttribute('for',speed.id);if(!speedValue.isConnected)speed.after(speedValue);
    speed.addEventListener('input',()=>{player.speed=Number(speed.value);update();});
    let detail=null;if(describe){detail=document.createElement('dl');detail.className='step-detail player-step-detail';for(let i=0;i<3;i++)detail.append(document.createElement('dt'),document.createElement('dd'));host.append(detail);}
    const previousState=player.onState;player.onState=p=>{previousState(p);update();};
    function update(){
      prev.disabled=player.count===0||player.position<=0;next.disabled=player.count===0||player.position>=player.count-1;replay.disabled=player.count===0;play.disabled=player.count<2||reduced.matches;speed.disabled=reduced.matches;
      play.textContent=player.playing?t('Pause','বিরতি'):t('Play','চালু');play.setAttribute('aria-pressed',String(player.playing));
      status.textContent=player.count?t('Step ','ধাপ ')+(Math.floor(player.position)+1)+t(' of ',' / ')+player.count:t('No active lesson','পাঠ শুরু হয়নি');
      progress.max=Math.max(1,player.count-1);progress.value=player.position;speedValue.textContent=speed.value+'×';
      progress.setAttribute('aria-label',t('Animation progress','অ্যানিমেশনের অগ্রগতি'));
      scrub.max=String(Math.max(1,player.count-1));scrub.value=String(player.position);scrub.disabled=player.count===0;scrub.setAttribute('aria-label',t('Inspect animation timeline','অ্যানিমেশনের সময়রেখা দেখুন'));
      if(detail){detail.hidden=player.count===0;const values=describe(Math.floor(player.position+1e-8))||[];for(let i=0;i<3;i++){const label=[t('What we do','কী করছি'),t('Why','কেন করছি'),t('What changed','কী বদলাল')][i];if(detail.children[i*2].textContent!==label)detail.children[i*2].textContent=label;const value=values[i]||'';if(detail.children[i*2+1].textContent!==value)detail.children[i*2+1].textContent=value;}}
    }
    reduced.addEventListener('change',()=>{player.pause();update();});document.getElementById('language-toggle')?.addEventListener('click',()=>queueMicrotask(update));update();return {update,progress,status};
  }
  function patch(container,markup){
    const template=document.createElement('template');template.innerHTML=markup;
    function sync(parent,desired){
      [...desired.childNodes].forEach((fresh,i)=>{const current=parent.childNodes[i];if(!current||current.nodeType!==fresh.nodeType||current.nodeName!==fresh.nodeName){const clone=fresh.cloneNode(true);if(current)parent.replaceChild(clone,current);else parent.append(clone);return;}
        if(current.nodeType===Node.TEXT_NODE){if(current.nodeValue!==fresh.nodeValue)current.nodeValue=fresh.nodeValue;return;}
        for(const attribute of [...current.attributes])if(!fresh.hasAttribute(attribute.name))current.removeAttribute(attribute.name);
        for(const attribute of [...fresh.attributes])if(current.getAttribute(attribute.name)!==attribute.value)current.setAttribute(attribute.name,attribute.value);
        sync(current,fresh);
      });while(parent.childNodes.length>desired.childNodes.length)parent.lastChild.remove();
    }
    sync(container,template.content);
  }
  reduced.addEventListener('change',()=>players.forEach(player=>player.pause()));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(player=>player.pause());});
  window.FormaAnimation={Player,controls,patch,reduced,cancelAll(){players.forEach(player=>player.pause());}};
})();
