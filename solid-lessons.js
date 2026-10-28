(function(){
 'use strict';
 const t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,f=v=>FormaMath.format(v),clamp=v=>Math.max(0,Math.min(1,v));
 const supported=['cube','cuboid','cylinder','cone','sphere'];
 function model(shape,p,result,unit,position=0,variant='volume'){
  const box=shape==='cube'||shape==='cuboid',w=p.w??p.a,d=p.d??p.a,h=box?(p.h??p.a):p.h,r=p.r,scale=Math.max(box?w:2*r,box?d:2*r,shape==='sphere'?2*r:h),ratio=shape==='sphere'?2*clamp(position/3)-1:0;
  const heights=box||shape==='cylinder'?(h<=12&&h>=.1?Array.from({length:Math.ceil(h)},(_,i)=>Math.min(1,h-i)):Array(8).fill(h/8)):[];
  const shown=clamp(position/2),layerVolume=(box?w*d:Math.PI*r*r),sliceRadius=shape==='sphere'?r*Math.sqrt(Math.max(0,(1-ratio)*(1+ratio))):null;
  return {shape,parameters:{...p},unit,position,variant,box,w,d,h,r,scale,heights,grouped:h>12||h<.1,volume:result.volume,surface:result.surface,baseArea:box?w*d:Math.PI*r*r,layerVolume,shown,ratio,sliceZ:ratio*r,sliceRadius,diameter:2*r,slant:shape==='cone'?result.dimensions.slant:null,unroll:clamp(position-1),net:clamp(position/3)};
 }
 function descriptions(m){
  if(m.variant==='net'&&m.box)return [
   [t('Inspect the six faces','ছয়টি তল দেখি'),t('A cuboid has three equal opposite-face pairs.','আয়তঘনে বিপরীত তলের সমান তিন জোড়া থাকে।'),t('The solid is closed; every face retains its dimensions.','ঘনবস্তু বন্ধ; প্রতিটি তলের মাপ অপরিবর্তিত।')],
   [t('Hinge the side faces outward','পাশের তল কবজায় খুলি'),t('Rotation preserves every face area and shared edge length.','ঘোরালে প্রতিটি তলের ক্ষেত্রফল ও যৌথ প্রান্তের দৈর্ঘ্য থাকে।'),t('Side faces rotate about base edges; the lid follows its attached back face.','পাশের তল ভূমির প্রান্তে ঘোরে; ঢাকনা সংযুক্ত পেছনের তলের সঙ্গে চলে।')],
   [t('Continue unfolding','আরও খুলে সমতলে আনি'),t('No face is stretched, duplicated or removed.','কোনো তল টানা, নকল বা বাদ দেওয়া হয় না।'),t('The six rectangles approach one plane.','ছয়টি আয়তক্ষেত্র একই সমতলের কাছে আসে।')],
   [t('Sum the net areas','Net-এর ক্ষেত্রফল যোগ করি'),t('Two faces each have areas wd, wh and dh.','wd, wh ও dh ক্ষেত্রফলের প্রতিটি তল দুবার আছে।'),`S = 2(wd + wh + dh) ≈ ${f(m.surface)} ${m.unit}²`]
  ];
  if(m.box||m.shape==='cylinder')return [
   [t('Highlight the base','ভূমি চিহ্নিত করি'),t('A cross-section parallel to the base has the same area at every height.','ভূমির সমান্তরাল প্রতিটি প্রস্থচ্ছেদের ক্ষেত্রফল সমান।'),m.box?`B = w × d = ${f(m.baseArea)} ${m.unit}²`:`B = πr² ≈ ${f(m.baseArea)} ${m.unit}²`],
   [t('Stack measured layers','মাপসহ স্তর সাজাই'),t('Each slab contributes base area × its height; disjoint volumes add.','প্রতিটি slab-এর আয়তন ভূমির ক্ষেত্রফল × তার উচ্চতা; আলাদা আয়তন যোগ হয়।'),t('The layer stack grows to the same perpendicular height.','স্তর সাজিয়ে একই লম্ব উচ্চতায় পৌঁছাই।')],
   [m.box?t('Reach the total height','মোট উচ্চতায় পৌঁছাই'):t('Unroll the lateral surface','বক্রতল খুলে সাজাই'),m.box?t('The layer heights sum to h.','স্তরের উচ্চতার যোগ h।'):t('Arc length is preserved: circumference 2πr becomes the rectangle width.','চাপের দৈর্ঘ্য থাকে: পরিধি 2πr আয়তক্ষেত্রের প্রস্থ হয়।'),m.box?`V = B × h ≈ ${f(m.volume)} ${m.unit}³`:`A_lateral = 2πrh ≈ ${f((2*Math.PI*m.r)*m.h)} ${m.unit}²`],
   [t('Connect the formula to the model','Model-এর সঙ্গে সূত্র মিলাই'),m.box?t('Base area is multiplied by perpendicular height.','ভূমির ক্ষেত্রফলের সঙ্গে লম্ব উচ্চতা গুণ হয়।'):t('Total surface includes the rectangle and two circular bases.','মোট পৃষ্ঠে আয়তক্ষেত্রের সঙ্গে দুটি বৃত্তাকার ভূমি থাকে।'),m.box?`V = wdh ≈ ${f(m.volume)} ${m.unit}³`:`V = πr²h ≈ ${f(m.volume)}; S = 2πrh + 2πr² ≈ ${f(m.surface)}`]
  ];
  if(m.shape==='cone')return [
   [t('Distinguish r, h and slant l','r, h ও তির্যক l আলাদা করি'),t('Perpendicular height is not the slant height.','লম্ব উচ্চতা ও তির্যক উচ্চতা এক নয়।'),`l = √(r²+h²) ≈ ${f(m.slant)} ${m.unit}`],
   [t('Compare the matching cylinder','সমান ভূমি ও উচ্চতার cylinder তুলনা করি'),t('Both have base πr² and perpendicular height h.','দুটির ভূমি πr² ও লম্ব উচ্চতা h সমান।'),`V_cylinder = πr²h ≈ ${f(3*m.volume)} ${m.unit}³`],
   [t('Inspect parallel cross-sections','সমান্তরাল প্রস্থচ্ছেদ দেখি'),t('At height y above the base, similar triangles give radius r(1−y/h).','ভূমি থেকে y উচ্চতায় সদৃশ ত্রিভুজে ব্যাসার্ধ r(1−y/h)।'),t('Integrating πr²(1−y/h)² from 0 to h gives πr²h/3. The comparison is illustrative, not a pouring proof.','0 থেকে h পর্যন্ত πr²(1−y/h)² সমাকলনে πr²h/3। তুলনাটি illustration, ঢালার প্রমাণ নয়।')],
   [t('Read the one-third factor','এক-তৃতীয়াংশ পড়ি'),t('The integral of (1−u)² on [0,1] is 1/3.','[0,1]-এ (1−u)²-এর সমাকলন 1/3।'),`V = ⅓πr²h ≈ ${f(m.volume)} ${m.unit}³`]
  ];
  return [t('Explore the lower hemisphere','নিচের অর্ধগোলকে দেখি'),t('Pass through the central great circle','মাঝের বৃহৎ বৃত্ত পেরোই'),t('Explore the upper hemisphere','ওপরের অর্ধগোলকে দেখি'),t('Reach the upper pole','ওপরের মেরুতে পৌঁছাই')].map(title=>[title,t('Pythagoras gives ρ² + z² = r². The slice plane is perpendicular to the diameter.','পিথাগোরাসে ρ² + z² = r²। Slice plane ব্যাসের ওপর লম্ব।'),`z = ${f(m.sliceZ)} ${m.unit}; ρ = √(r²−z²) ≈ ${f(m.sliceRadius)} ${m.unit}; A_slice ≈ ${f(Math.PI*m.sliceRadius*m.sliceRadius)} ${m.unit}²`]);
 }
 function create(shape,p,r,unit){
  if(!supported.includes(shape))return null;
  const old=['cube','cuboid'].includes(shape)?FormaGeometryLessons.create(shape,p,r,unit):null;
  const data={shape,parameters:{...p},volume:r.volume,surface:r.surface,unit};let pos=0,variant='volume';
  const adapter={data,count:4,get variant(){return variant;},set variant(v){variant=v;},get model(){return model(shape,p,r,unit,pos,variant);},describe:i=>descriptions(model(shape,p,r,unit,pos,variant))[Math.min(3,i)],render(position){pos=position;
   if(old&&variant==='volume'){old.render(position);return;}
   const m=adapter.model,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),txt=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${esc(s)}</text>`;let body='',note='';
   if(m.box){const scale=Math.min(400/(m.w+2*m.h),300/(2*m.d+2*m.h)),W=m.w*scale,D=m.d*scale,H=m.h*scale,Y=10+H+D;const rect=(x,y,w,h,label)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${txt(x+w/2,y+h/2,label)}`;
    body=rect(240-W/2,Y,W,D,'wd')+rect(240-W/2,Y-H,W,H,'wh')+rect(240-W/2,Y+D,W,H,'wh')+rect(240-W/2-H,Y,H,D,'dh')+rect(240+W/2,Y,H,D,'dh')+rect(240-W/2,Y-H-D,W,D,'wd');note=t('Flat surface-area net: all six faces at true relative scale. Use 3D to inspect the hinged unfolding.','পৃষ্ঠের সমতল net: ছয় তলের আপেক্ষিক মাপ সঠিক। কবজায় খোলা দেখতে 3D ব্যবহার করুন।');
   }else if(shape==='sphere'){
    const ry=m.ratio*95,rr=95*Math.sqrt(Math.max(0,1-m.ratio*m.ratio));body=`<circle cx="240" cy="145" r="95" class="solid-outline"/><ellipse cx="240" cy="${145-ry}" rx="${rr}" ry="${rr*.25}" class="solid-slice"/><path d="M240 50V240" class="geo-guide"/>`+txt(340,75,'r = '+f(m.r))+txt(240,275,'z = '+f(m.sliceZ)+'; ρ ≈ '+f(m.sliceRadius));note=t('Schematic section view. The circular slice has true radius ρ; its ellipse is a projection, not a measurement.','Schematic section। বৃত্তাকার slice-এর প্রকৃত ব্যাসার্ধ ρ; ellipse projection, মাপ নয়।');
   }else if(shape==='cone'){
    const level=clamp(position/3),radius=90*(1-level),y=245-190*level;body=`<path class="solid-cylinder" d="M150 55V245Q240 290 330 245V55Q240 10 150 55Z"/><path d="M240 55L150 245Q240 285 330 245Z"/><ellipse class="solid-slice" cx="240" cy="${y}" rx="${radius}" ry="${radius*.25}"/><path class="geo-guide" d="M240 55V245M240 245H330"/>`+txt(350,150,'h = '+f(m.h))+txt(300,285,'r = '+f(m.r))+txt(170,120,'l ≈ '+f(m.slant));note=t('Same-base, same-height cylinder outline; illustrative comparison. The cross-section shrinks linearly in radius, quadratically in area.','একই ভূমি ও উচ্চতার cylinder সীমানা; illustrative তুলনা। Slice-এর ব্যাসার্ধ রৈখিকভাবে, ক্ষেত্রফল বর্গ অনুপাতে কমে।');
   }else{
    const u=m.unroll,N=32,top=70,bottom=230,R=85;body='';for(let i=0;i<N;i++){const angle=i/(N-1)*Math.PI*2,x=240+R*Math.cos(angle),target=65+i/(N-1)*350,px=x*(1-u)+target*u;body+=`<path class="solid-strip" d="M${px} ${top}V${bottom}"/>`;}
    const built=clamp(position);for(let i=0;i<m.heights.length;i++){const y=bottom-(i+.5)/m.heights.length*160;body+=`<ellipse class="solid-slice" cx="240" cy="${y}" rx="85" ry="18" opacity="${(1-u)*clamp(built*m.heights.length-i)}"/>`;}
    body+=`<path class="solid-outline" d="M65 65H415V235H65Z" opacity="${u}"/>`+txt(240,35,u>.5?'width = 2πr ≈ '+f(2*Math.PI*m.r):'r = '+f(m.r))+txt(240,275,'h = '+f(m.h));note=t('Schematic equal arc-length strip diagram; the 3D developable surface preserves width 2πr and height h. Mesh facets are a rendering approximation.','Schematic সমান চাপদৈর্ঘ্যের strip। 3D-তে পৃষ্ঠ খোলার সময় প্রস্থ 2πr ও উচ্চতা h অপরিবর্তিত। Mesh facet rendering approximation।');
   }
   FormaAnimation.patch(document.getElementById('lab-visual'),`<svg class="lab-svg solid-lesson-svg" viewBox="0 -35 480 370" role="img" aria-label="${esc(shape+' '+variant)}" data-shape="${shape}" data-position="${position}">${body}</svg><p class="geo-formula">${esc(variant==='net'?`S = 2(wd+wh+dh) ≈ ${f(m.surface)} ${unit}²`:r.formula)}</p><p class="geo-schematic-note">${esc(note)}</p>`);
  }};return adapter;
 }
 window.FormaSolidLessons={supported,model,descriptions,create};
})();
