(function(){
 'use strict';
 const $=id=>document.getElementById(id),t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=n=>Number(n.toPrecision(10)).toString();
 function values(deg){
  let q=((deg%360)+360)%360,ref=q<=90?q:q<=180?180-q:q<=270?q-180:360-q,signS=q>180?-1:1,signC=q>90&&q<270?-1:1;
  const tolerance=8*Number.EPSILON*Math.max(1,Math.abs(deg)),special=[0,30,45,60,90].find(a=>Math.abs(ref-a)<=tolerance),sinValues=['0','1/2','√2/2','√3/2','1'],cosValues=['1','√3/2','√2/2','1/2','0'],index=[0,30,45,60,90].indexOf(special),rad=deg*Math.PI/180;
  const atVertical=Math.abs(q-90)<=tolerance||Math.abs(q-270)<=tolerance,atHorizontal=Math.abs(q)<=tolerance||Math.abs(q-180)<=tolerance||Math.abs(q-360)<=tolerance;
  const sin=atHorizontal?0:Math.sin(rad),cos=atVertical?0:Math.cos(rad);
  const signed=(v,s)=>v==='0'?'0':s<0?'-'+v:v;
  return {deg,rad,sin,cos,tan:atVertical?null:sin/cos,quadrant:q===0||q===90||q===180||q===270?0:Math.floor(q/90)+1,exactSin:index<0?null:signed(sinValues[index],signS),exactCos:index<0?null:signed(cosValues[index],signC),acute:deg>0&&deg<90};
 }
 function form(){return `<label for="trig-angle" data-tg-en="Angle" data-tg-bn="কোণ">${t('Angle','কোণ')}</label><input id="trig-angle" type="number" step="any" value="30" min="-360" max="360"><input id="trig-slider" aria-label="Angle slider" type="range" min="-360" max="360" step=".1" value="30"><label for="trig-unit" data-tg-en="Angle unit" data-tg-bn="কোণের একক">${t('Angle unit','কোণের একক')}</label><select id="trig-unit"><option>DEG</option><option>RAD</option></select><label for="trig-view" data-tg-en="Learning view" data-tg-bn="শেখার দৃশ্য">${t('Learning view','শেখার দৃশ্য')}</label><select id="trig-view"><option value="linked">${t('Unit circle + linked graph','একক বৃত্ত + সংযুক্ত গ্রাফ')}</option><option value="circle">${t('Unit circle','একক বৃত্ত')}</option><option value="triangle">${t('Right triangle (acute only)','সমকোণী ত্রিভুজ (শুধু সূক্ষ্মকোণ)')}</option></select><label for="trig-tangent"><input id="trig-tangent" type="checkbox"> tan θ</label><div class="trig-examples">${[0,30,45,60,90].map(a=>`<button type="button" data-trig-example="${a}">${a}°</button>`).join('')}</div><p class="lab-note" data-tg-en="Drag the circle point. Arrow keys change 1°; Shift changes 0.1°. Play repeats a full signed cycle; Replay starts its first angle. User input: −360°…360°. Radians use the same angle." data-tg-bn="বৃত্তের বিন্দু টানুন। Arrow-তে ১°, Shift-এ ০.১°। Play পূর্ণ signed cycle ঘোরায়; Replay শুরুর কোণে ফেরে। Input: −৩৬০°…৩৬০°। Radian-এ একই কোণ থাকে।">${t('Drag the circle point. Arrow keys change 1°; Shift changes 0.1°. Play repeats a full signed cycle; Replay starts its first angle. User input: −360°…360°. Radians use the same angle.','বৃত্তের বিন্দু টানুন। Arrow-তে ১°, Shift-এ ০.১°। Play পূর্ণ signed cycle ঘোরায়; Replay শুরুর কোণে ফেরে। Input: −৩৬০°…৩৬০°। Radian-এ একই কোণ থাকে।')}</p>`;}
 function bind(){
  let unit='DEG';
  $('trig-slider').addEventListener('input',()=>$('trig-angle').value=$('trig-slider').value);
  $('trig-unit').addEventListener('change',()=>{const next=$('trig-unit').value,n=Number($('trig-angle').value);if(Number.isFinite(n))$('trig-angle').value=unit==='DEG'?n*Math.PI/180:n*180/Math.PI;unit=next;const max=unit==='DEG'?360:2*Math.PI;for(const id of ['trig-angle','trig-slider']){$(id).min=-max;$(id).max=max;} $('trig-slider').step=unit==='DEG'?'.1':'.001';});
  document.querySelectorAll('[data-trig-example]').forEach(button=>button.addEventListener('click',()=>{$('trig-angle').value=$('trig-unit').value==='DEG'?button.dataset.trigExample:Number(button.dataset.trigExample)*Math.PI/180;$('trig-angle').dispatchEvent(new Event('input',{bubbles:true}));}));
 }
 function translate(){document.querySelectorAll('[data-tg-en]').forEach(el=>el.textContent=t(el.dataset.tgEn,el.dataset.tgBn));$('trig-slider')?.setAttribute('aria-label',t('Angle slider','কোণের slider'));const options=$('trig-view')?.options;if(options)[['Unit circle + linked graph','একক বৃত্ত + সংযুক্ত গ্রাফ'],['Unit circle','একক বৃত্ত'],['Right triangle (acute only)','সমকোণী ত্রিভুজ (শুধু সূক্ষ্মকোণ)']].forEach((v,i)=>options[i].textContent=t(...v));}
 function calculate(){
  const raw=FormaFeedback.numeric('trig-angle'),unit=$('trig-unit').value,deg=unit==='DEG'?raw:raw*180/Math.PI;
  if(Math.abs(deg)>360+1e-9){const msg=t('Use an angle between −360° and 360° (or ±2π radians).','−৩৬০° থেকে ৩৬০° (বা ±২π radian) কোণ দিন।');FormaFeedback.error('trig-angle',msg);throw Error(msg);}
  let base=deg<0?-360:0,drag=null,last=deg;const view=$('trig-view').value,tangent=$('trig-tangent').checked,bound=new WeakSet();
  const model={deg,unit,view,tangent};
  const text=(x,y,s)=>`<text x="${x}" y="${y}">${esc(s)}</text>`;
  function setAngle(angle){angle=Math.max(-360,Math.min(360,angle));base=angle<0?-360:0;FormaLabs.player.pause();FormaLabs.player.seek((angle-base)/90);}
  function cancelGesture(){if(drag){const h=$('trig-point');try{h.releasePointerCapture(drag.id);}catch{}drag=null;}}
  function bindVisual(){const h=$('trig-point');if(!h||bound.has(h))return;bound.add(h);
   h.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();FormaLabs.player.pause();drag={id:event.pointerId};h.focus({preventScroll:true});try{h.setPointerCapture(event.pointerId);}catch{}});
   h.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;event.preventDefault();const p=new DOMPoint(event.clientX,event.clientY).matrixTransform($('trig-circle').getScreenCTM().inverse());let next=Math.atan2(150-p.y,p.x-150)*180/Math.PI;while(next-last>180)next-=360;while(next-last< -180)next+=360;setAngle(next);});
   for(const name of ['pointerup','pointercancel','lostpointercapture'])h.addEventListener(name,cancelGesture);
   h.addEventListener('keydown',event=>{const amount=event.shiftKey?.1:1,change={ArrowLeft:-amount,ArrowDown:-amount,ArrowRight:amount,ArrowUp:amount}[event.key];if(change!==undefined||event.key==='Home'){event.preventDefault();setAngle(event.key==='Home'?0:last+change);}});
  }
  function describe(index){const v=values(last),checkpoint=base+index*90;return [t('Follow the cycle from ','চক্র অনুসরণ করি ')+num(unit==='DEG'?checkpoint:checkpoint*Math.PI/180)+' '+unit,t('Coordinates are (cos θ, sin θ): signed horizontal and vertical projections.','স্থানাঙ্ক (cos θ, sin θ): অনুভূমিক ও উল্লম্ব signed projection।'),`θ = ${num(unit==='DEG'?last:v.rad)} ${unit}. `+(v.quadrant?t('Quadrant ','চতুর্ভাগ ')+v.quadrant:t('On an axis','অক্ষের ওপর'))+`; cos θ ${v.cos<0?'<':'≥'} 0; sin θ ${v.sin<0?'<':'≥'} 0. `+t('Graph horizontal axis uses ','গ্রাফের অনুভূমিক অক্ষের একক ')+unit];}
  function resultHTML(){return '<p id="trig-readout"></p><p id="trig-exact"></p><p id="trig-triangle-note" class="lab-note"></p>';}
  function render(position){
   last=base+position*90;model.deg=last;const v=values(last),x=150+100*v.cos,y=150-100*v.sin,unitValue=unit==='DEG'?last:v.rad,hitRadius=22*300/Math.min(330,Math.max(100,$('lab-visual').clientWidth));
   $('trig-angle').value=unitValue;$('trig-slider').value=unitValue;
   let circle=`<svg class="trig-circle" id="trig-circle" viewBox="0 0 300 300" role="group" aria-label="Unit circle"><path class="tg-axis" d="M25 150H275M150 25V275"/><circle class="tg-outline" cx="150" cy="150" r="100"/><path class="tg-radius" d="M150 150L${x} ${y}"/><path class="tg-cos" d="M150 150H${x}"/><path class="tg-sin" d="M${x} 150V${y}"/>${text(250,170,'1')}${text(135,45,'1')}${text(30,170,'−1')}${text(130,265,'−1')}${text(130,170,'O')}${text(15,22,'r = 1')}${text(15,292,`(${num(v.cos)}, ${num(v.sin)})`)}<circle class="tg-point-symbol" cx="${x}" cy="${y}" r="7"/><circle id="trig-point" cx="${x}" cy="${y}" r="${hitRadius}" role="button" tabindex="0" aria-label="${esc(t('Move angle point','কোণের বিন্দু সরান'))}"/></svg>`;
   if(view==='triangle')circle=v.acute?`<svg class="trig-circle" viewBox="0 0 300 260" role="img" aria-label="Acute right triangle"><path class="tg-outline" d="M40 210L${40+200*v.cos} 210L${40+200*v.cos} ${210-200*v.sin}Z"/>${text(40,240,`adjacent = cos θ = ${num(v.cos)}`)}${text(15,25,`opposite = sin θ = ${num(v.sin)}`)}${text(15,50,'hypotenuse = 1')}</svg>`:'';
   let graph='';
   if(view==='linked'){
    const px=a=>45+(a-base)/360*510,py=y=>130-y*75;let paths=['',''],full=['',''],tanPath='',oldCos=null;
    for(let i=0;i<=360;i++){const angle=base+i,s=values(angle),X=px(angle);[s.sin,s.cos].forEach((value,j)=>{full[j]+=(i?'L':'M')+X+' '+py(value);if(angle<=last)paths[j]+=(paths[j]?'L':'M')+X+' '+py(value);});
     if(tangent&&angle<=last){if(s.tan===null||Math.abs(s.tan)>2||oldCos!==null&&s.cos*oldCos<0){oldCos=null;continue;}tanPath+=(oldCos===null?'M':'L')+X+' '+py(s.tan);oldCos=s.cos;}
    }
    paths[0]+='L'+px(last)+' '+py(v.sin);paths[1]+='L'+px(last)+' '+py(v.cos);
    graph=`<svg id="trig-graph" viewBox="0 0 600 280" role="img" aria-label="Linked sine and cosine graph"><defs><clipPath id="trig-clip"><rect x="45" y="30" width="510" height="200"/></clipPath></defs><path class="tg-axis" d="M45 130H555M45 35V230"/>${[0,1,2,3,4].map(i=>text(px(base+i*90)-8,255,unit==='DEG'?`${base+i*90}°`:num((base+i*90)*Math.PI/180))).join('')}${text(15,60,'+1')}${text(15,210,'−1')}${text(230,278,'θ ('+unit+')')}<g clip-path="url(#trig-clip)">${[0,1].map(i=>`<path class="${i?'tg-cos':'tg-sin'} tg-faint" d="${full[i]}"/><path class="${i?'tg-cos':'tg-sin'}" d="${paths[i]}"/>`).join('')}${tangent?`<path class="tg-tan" d="${tanPath}"/>`:''}<circle class="tg-dot" cx="${px(last)}" cy="${py(v.sin)}" r="5"/><circle class="tg-dot-cos" cx="${px(last)}" cy="${py(v.cos)}" r="5"/></g></svg><p class="lab-note">${t('━━ sin θ: vertical projection; ┄┄ cos θ: horizontal projection.','━━ sin θ: উল্লম্ব projection; ┄┄ cos θ: অনুভূমিক projection।')}${tangent?' '+t('Purple: tan; gaps at ±90°/270°.','বেগুনি: tan; ±৯০°/২৭০°-তে ফাঁক।'):''}</p>`;
   }
   FormaAnimation.patch($('lab-visual'),`<div class="trig-diagrams">${circle}${graph}</div>`);bindVisual();
   const readout=`θ = ${num(unitValue)} ${unit}; cos θ ≈ ${num(v.cos)}; sin θ ≈ ${num(v.sin)}; tan θ = ${v.tan===null?t('undefined (cos θ = 0)','অসংজ্ঞায়িত (cos θ = 0)'):num(v.tan)}`;
   if($('trig-readout')?.textContent!==readout)$('trig-readout').textContent=readout;
   const exact=v.exactSin===null?t('No special-angle exact form shown; decimals are approximate.','বিশেষ কোণের নির্ভুল রূপ দেখানো হয়নি; দশমিক আনুমানিক।'):t('Exact special-angle values: ','বিশেষ কোণের নির্ভুল মান: ')+`sin θ = ${v.exactSin}; cos θ = ${v.exactCos}. `+t('tan θ = sin θ / cos θ.','tan θ = sin θ / cos θ।');
   if($('trig-exact')?.textContent!==exact)$('trig-exact').textContent=exact;
   const triangleNote=view==='triangle'?(v.acute?t('This right-triangle model applies only to 0° < θ < 90°.','এই সমকোণী ত্রিভুজ model শুধু ০° < θ < ৯০°-তে প্রযোজ্য।'):t('Right-triangle view requires an acute angle (0° < θ < 90°). Use the signed unit circle for other angles.','ত্রিভুজের জন্য সূক্ষ্মকোণ দরকার (০° < θ < ৯০°)। অন্য কোণে signed একক বৃত্ত দেখুন।')):describe(0)[2];
   if($('trig-triangle-note')?.textContent!==triangleNote)$('trig-triangle-note').textContent=triangleNote;
   model.answer=readout;FormaFeedback.publish('trig',readout,'approximate');
  }
  return {data:model,get answer(){return model.answer;},count:5,initialPosition:(deg-base)/90,loop:true,duration:1800,describe,render,resultHTML,cancelGesture,destroy:cancelGesture};
 }
 window.FormaTrigonometry={values,form,bind,translate,calculate};
})();
