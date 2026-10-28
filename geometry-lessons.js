(function(){
 'use strict';
 const t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,n=v=>FormaMath.format(v),clamp=v=>Math.max(0,Math.min(1,v));
 const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</text>`;
 const polygon=(points,extra='')=>`<polygon points="${points}" ${extra}/>`;
 const line=(x1,y1,x2,y2)=>`<path class="geo-guide" d="M${x1} ${y1}L${x2} ${y2}"/>`;
 const pairs={
 rectangle:[['Identify width and height','প্রস্থ ও উচ্চতা চিহ্নিত করি','Area counts square units, not boundary length.','ক্ষেত্রফলে বর্গ একক গুনি, সীমানার দৈর্ঘ্য নয়।','The outline is divided into cells.','সীমানাটি কোষে ভাগ করা হয়েছে।'],['Fill one row','এক সারি পূরণ করি','One row has width × one unit of height.','এক সারির ক্ষেত্রফল প্রস্থ × এক একক উচ্চতা।','The first row is visible.','প্রথম সারি দেখা যাচ্ছে।'],['Repeat the rows','সারিগুলো পুনরাবৃত্তি করি','Adding rows multiplies width by height.','সারিগুলো যোগ করলে প্রস্থের সঙ্গে উচ্চতার গুণ হয়।','The entire area is filled.','সম্পূর্ণ ক্ষেত্রফল পূর্ণ হয়েছে।'],['Read the area','ক্ষেত্রফল পড়ি','A = width × height.','A = প্রস্থ × উচ্চতা।','Counted area matches the calculated answer.','গোনা ক্ষেত্রফল ও গণনার উত্তর একই।']],
 triangle:[['Mark base and perpendicular height','ভূমি ও লম্ব উচ্চতা চিহ্নিত করি','Height is perpendicular to the chosen base, even outside an obtuse triangle.','স্থূলকোণী ত্রিভুজেও উচ্চতা নির্বাচিত ভূমির ওপর লম্ব হয়।','One triangle is shown.','একটি ত্রিভুজ দেখা যাচ্ছে।'],['Make a congruent copy','একই মাপের অনুলিপি করি','A congruent copy has equal area.','একই মাপের অনুলিপির ক্ষেত্রফল সমান।','Two equal triangles are visible.','সমান দুটি ত্রিভুজ দেখা যাচ্ছে।'],['Rotate and join the copy','অনুলিপি ঘুরিয়ে যুক্ত করি','A rigid half-turn preserves lengths and area.','অর্ধেক ঘূর্ণনে দৈর্ঘ্য ও ক্ষেত্রফল বদলায় না।','The pair forms a parallelogram of the same height.','দুটি মিলে একই উচ্চতার সামান্তরিক হয়েছে।'],['Take half the parallelogram','সামান্তরিকের অর্ধেক নিই','Two triangles have total area base × height.','দুই ত্রিভুজের মোট ক্ষেত্রফল ভূমি × উচ্চতা।','A = ½ × base × height.','A = ½ × ভূমি × উচ্চতা।']],
 parallelogram:[['Identify base and perpendicular height','ভূমি ও লম্ব উচ্চতা চিহ্নিত করি','The slanted side is not the height.','তির্যক বাহু উচ্চতা নয়।','An area-equivalent schematic is shown.','সমক্ষেত্রফলের একটি schematic দেখানো হয়েছে।'],['Cut the end triangle','প্রান্তের ত্রিভুজ কাটি','The vertical cut partitions the shape without changing area.','লম্বভাবে কাটলে অংশ হয়, ক্ষেত্রফল বদলায় না।','The end triangle and remainder are labeled.','প্রান্তের ত্রিভুজ ও বাকি অংশ আলাদা হয়েছে।'],['Translate the cut piece','কাটা অংশ সরাই','Translation preserves the cut piece and fills the opposite gap.','সরিয়ে নিলে অংশের মাপ থাকে এবং অন্য পাশের ফাঁক পূরণ হয়।','The same pieces form a rectangle.','একই অংশ মিলে আয়তক্ষেত্র হয়েছে।'],['Read base × height','ভূমি × উচ্চতা পড়ি','A rectangle and the original parallelogram have equal area.','আয়তক্ষেত্র ও মূল সামান্তরিকের ক্ষেত্রফল সমান।','A = base × perpendicular height.','A = ভূমি × লম্ব উচ্চতা।']],
 trapezoid:[['Identify the parallel bases','সমান্তরাল ভূমি চিহ্নিত করি','The perpendicular distance between the bases is h.','ভূমি দুটির লম্ব দূরত্ব h।','One trapezoid is shown.','একটি ট্রাপিজিয়াম দেখা যাচ্ছে।'],['Make a congruent copy','একই মাপের অনুলিপি করি','The copy has exactly the same area.','অনুলিপির ক্ষেত্রফল ঠিক সমান।','Two equal trapezoids are visible.','সমান দুটি ট্রাপিজিয়াম দেখা যাচ্ছে।'],['Rotate and join','ঘুরিয়ে যুক্ত করি','A half-turn joins the sloping sides without distortion.','অর্ধেক ঘূর্ণনে আকৃতি না বদলে তির্যক বাহু যুক্ত হয়।','The combined parallelogram has base a+b and height h.','মিলিত সামান্তরিকের ভূমি a+b, উচ্চতা h।'],['Divide the combined area by two','মিলিত ক্ষেত্রফল দুই দিয়ে ভাগ করি','The pair has twice the original area.','জোড়ার ক্ষেত্রফল মূলটির দ্বিগুণ।','A = ½(a+b)h.','A = ½(a+b)h।']],
 circle:[['Divide into equal sectors','সমান sector-এ ভাগ করি','The sectors partition the original circle.','Sector-গুলো মিলে মূল বৃত্ত হয়।','All sectors retain their curved boundaries.','সব sector-এর বাঁকা সীমানা আছে।'],['Separate the sectors','Sector-গুলো আলাদা করি','No area is removed by cutting.','কাটলে কোনো ক্ষেত্রফল বাদ যায় না।','The same sectors are separated.','একই sector-গুলো আলাদা হয়েছে।'],['Alternate the sectors','উল্টো-সোজা করে সাজাই','Rigid rotation and translation preserve every sector.','ঘুরিয়ে ও সরিয়ে সাজালেও প্রতিটি sector অপরিবর্তিত থাকে।','The outline is scalloped, not an exact rectangle.','সীমানা ঢেউখেলানো, ঠিক আয়তক্ষেত্র নয়।'],['Refine the approximation','আনুমানিক আয়তক্ষেত্র উন্নত করি','More sectors bring base toward πr and height toward r.','Sector বাড়লে ভূমি πr ও উচ্চতা r-এর কাছাকাছি যায়।','The circle area is πr²; the straight-edged approximation is labeled separately.','বৃত্তের ক্ষেত্রফল πr²; সরল সীমানার আনুমানিক ক্ষেত্রফল আলাদা দেখানো হয়েছে।']],
 solid:[['Count the base area','ভূমির ক্ষেত্রফল গুনি','Each layer covers width × depth square units.','প্রতিটি স্তরের ভূমি প্রস্থ × গভীরতা বর্গ একক।','The base grid is shown.','ভূমির grid দেখানো হয়েছে।'],['Add a layer','একটি স্তর যোগ করি','Layer volume = base area × layer height.','স্তরের আয়তন = ভূমির ক্ষেত্রফল × স্তরের উচ্চতা।','The first layer is visible.','প্রথম স্তর দেখা যাচ্ছে।'],['Stack the remaining layers','বাকি স্তর সাজাই','Disjoint layers add to the total height.','আলাদা স্তরের উচ্চতা যোগ হয়ে মোট উচ্চতা হয়।','The layers fill the solid.','স্তরগুলো ঘনবস্তু পূর্ণ করেছে।'],['Read the volume','আয়তন পড়ি','V = width × depth × height.','V = প্রস্থ × গভীরতা × উচ্চতা।','The layer sum equals the calculated volume.','স্তরের যোগফল ও গণনার আয়তন একই।']]
 };
 function create(shape,p,result,unit,sectors=16){
  const kind=['cube','cuboid'].includes(shape)?'solid':['rectangle','square'].includes(shape)?'rectangle':shape;
  if(!pairs[kind])return null;
  const data={shape,kind,parameters:{...p},area:result.area,volume:result.volume,unit,sectors};
  function describe(index){const a=pairs[kind][Math.min(3,index)],offset=document.documentElement.lang==='bn'?1:0;return [a[offset],a[2+offset],a[4+offset]];}
  function render(position){
   const stage=Math.min(3,Math.floor(position)),reveal=clamp(position-1),copy=clamp(position),join=clamp(position-1);let body='',note='',formula='',extra='';
   if(kind==='rectangle'){
    const w=p.w??p.a,h=p.h??p.a,literal=w<=12&&h<=12&&w>=.1&&h>=.1&&w/h>=.05&&w/h<=20;
    const cols=literal?Math.ceil(w):12,rows=literal?Math.ceil(h):8,W=literal?Math.min(310/w,175/h)*w:300,H=literal?W/w*h:175,left=240-W/2,top=70;
    const x=i=>left+(literal?Math.min(i,w)/w:i/cols)*W,y=i=>top+(literal?Math.min(i,h)/h:i/rows)*H;
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
     const amount=position<1?(j===0?position:0):j===0?1:clamp(reveal*(rows-1)-(j-1));
     body+=`<rect class="geo-cell" x="${x(i)}" y="${y(j)}" width="${x(i+1)-x(i)}" height="${y(j+1)-y(j)}" fill-opacity="${.07+.7*amount}" data-row="${j}"/>`;
    }
    body+=text(240,55,`w = ${n(w)} ${unit}`)+text(240,275,`h = ${n(h)} ${unit}`);
    note=literal?t('Scaled unit grid; edge cells may be fractional.','Scale করা unit grid; প্রান্তের কোষ আংশিক হতে পারে।'):t('Grouped area model: each cell represents A/96; cells are not unit squares.','Grouped area model: প্রতিটি কোষ A/96; এগুলো একক বর্গ নয়।');
    formula=`A = ${n(w)} × ${n(h)} = ${n(result.area)} ${unit}²`;extra=`data-literal="${literal}" data-cell-count="${rows*cols}"`;
   }else if(kind==='triangle'||kind==='trapezoid'){
    let points,tx,ty,dx,base,height,foot=0,representative=false;
    if(kind==='triangle'){
     const x=p.a/2+((p.c-p.b)/p.a/2)*(p.c+p.b),h=result.dimensions.height,scale=140/Math.max(p.a,Math.abs(x),h);
     base=p.a*scale;height=h*scale;let cx=x*scale;if(base<8||height<8){representative=true;base=120;height=100;cx=60;}foot=cx;points=`0,${height} ${base},${height} ${cx},0`;tx=base+cx;ty=height;dx=Math.max(base,cx)+30;
     formula=`2A = ${n(p.a)} × ${n(h)}; A = ${n(result.area)} ${unit}²`;
    }else{const scale=75/Math.max(p.a,p.b,p.h,Math.abs(p.s));base=p.a*scale;height=p.h*scale;const upper=p.b*scale,offset=p.s*scale;points=`0,${height} ${base},${height} ${offset+upper},0 ${offset},0`;tx=base+offset+upper;ty=height;dx=Math.max(base,offset+upper)-Math.min(0,offset)+25;formula=`2A = (${n(p.a)} + ${n(p.b)}) × ${n(p.h)}; A = ${n(result.area)} ${unit}²`;}
    body=`<g transform="translate(${kind==='triangle'?'160 75':'120 95'})">${polygon(points,'class="geo-piece geo-original" aria-label="A: original"')}${polygon(points,`class="geo-piece geo-copy" aria-label="B: congruent copy" opacity="${copy}" transform="translate(${dx+(tx-dx)*join} ${ty*join}) rotate(${180*join})"`)}${line(foot,height,foot,0)}${text(foot-15,height/2,'h')}${text(base/2,height+25,kind==='triangle'?`base = ${n(p.a)}`:`a = ${n(p.a)}, b = ${n(p.b)}`)}</g>`;
    note=t('Labeled schematic. The copy stays congruent throughout its rigid rotation and translation.','লেবেলযুক্ত schematic। ঘোরানো ও সরানোর পুরো সময় অনুলিপি একই মাপের থাকে।');
    if(kind==='triangle')note+=t(' Height = 2A/base; the side lengths determine the triangle.',' উচ্চতা = 2A/ভূমি; বাহুর দৈর্ঘ্য থেকে ত্রিভুজ নির্ধারিত।');
    if(representative)note+=' '+t('Extreme aspect ratio: a normalized representative triangle shows the proof; side angles/pixel lengths are not measurements. The numerical base and altitude remain authoritative.','অতিরিক্ত সরু আকৃতি: normalized প্রতিনিধি ত্রিভুজে প্রমাণ দেখানো; কোণ/pixel দিয়ে মাপা নয়। সংখ্যাগত ভূমি ও লম্ব উচ্চতাই ব্যবহার করুন।');
    extra=`data-copy-angle="${180*join}" data-copy-area="${result.area}" data-combined-area="${Number.isFinite(2*result.area)?2*result.area:'outside-floating-range'}"`;
   }else if(kind==='parallelogram'){
    const actualShear=p.b*Math.sqrt(Math.max(0,1-(p.h/p.b)**2)),band=actualShear>p.a,N=band?Math.ceil(actualShear/p.a):1;const B=175,H=115,D=actualShear===0?0:45;
    body=`<g transform="translate(90 80)">${polygon(`${D},0 ${B+D},0 ${B},${H} ${D},${H}`,'class="geo-piece geo-original"')}${polygon(`0,${H} ${D},0 ${D},${H}`,`class="geo-piece geo-copy" transform="translate(${B*join} 0)"`)}<g opacity="${clamp(position)}">${line(D,0,D,H)}</g>${text(B/2+D,H+25,`base = ${n(p.a)}`)}${text(B+D+35,H/2,band?'h/N':'h')}</g>`;
    note=t('Area-equivalent schematic: shear angle is illustrative; base and perpendicular height are symbolic dimensions.','সমক্ষেত্রফলের schematic: তির্যক কোণটি উদাহরণ; ভূমি ও লম্ব উচ্চতা প্রতীকী মাত্রা।');
    if(band)note+=' '+t('For shear greater than the base, split into equal-height bands first; this diagram represents one band. Each band uses the same cut and translation, then their areas add.','তির্যক সরণ ভূমির বেশি হলে আগে সমান উচ্চতার স্তরে ভাগ করি; ছবিটি একটি স্তরের প্রতিনিধি। প্রতিটি স্তরে একইভাবে কেটে সরিয়ে শেষে ক্ষেত্রফল যোগ করি।');
    formula=band?`Σ(base × band height) = ${n(p.a)} × ${n(p.h)} = ${n(result.area)} ${unit}²`:`A = ${n(p.a)} × ${n(p.h)} = ${n(result.area)} ${unit}²`;
    if(band&&Number.isSafeInteger(N))note+=` N = ${N}.`;
    extra=`data-cut-translation="${B*join}" data-total-area="${result.area}"`;
   }else if(kind==='circle'){
    const N=sectors,R=110,alpha=Math.PI/N,s=R*Math.sin(alpha),h=R*Math.cos(alpha),approx=(.5*N*Math.sin(2*Math.PI/N))*(p.r*p.r),error=100*(1-Math.sin(2*Math.PI/N)/(2*Math.PI/N));
    const wedge=`M0 0 L${-s} ${-h} A${R} ${R} 0 0 1 ${s} ${-h} Z`;
    for(let i=0;i<N;i++){
     const phi=(i+.5)*2*Math.PI/N,angle=phi*180/Math.PI,explode=12*copy;
     const startX=240+Math.sin(phi)*explode,startY=130-Math.cos(phi)*explode,endX=240-(N-1)*s/2+i*s,endY=i%2===0?110+h:110;
     let turn=(i%2===0?0:180)-angle;turn=((turn+540)%360)-180;
     body+=`<path class="geo-piece ${i%2?'geo-copy':'geo-original'}" d="${wedge}" transform="translate(${startX+(endX-startX)*join} ${startY+(endY-startY)*join}) rotate(${angle+turn*join})" data-sector="${i}"/>`;
    }
    body+=`<rect class="geo-guide" x="${240-N*s/2}" y="110" width="${N*s}" height="${h}" opacity="${clamp(position-2)}"/>`+text(240,245,`N = ${N}; Aₙ ≈ ${n(approx)} ${unit}²`)+text(240,270,t(`Straight-edge area deficit: ${n(error)}%`,`সরল সীমানার ক্ষেত্রফলের ঘাটতি: ${n(error)}%`));
    note=t('Equal rigid sectors; scalloped edges remain curved. More sectors reduce the labeled inscribed-polygon area deficit. Dashed rectangle is an approximation, not the exact union.','সমান অপরিবর্তিত sector; বাঁকা সীমানা থাকে। Sector বাড়লে দেখানো অন্তর্লিখিত বহুভুজের ক্ষেত্রফলের ঘাটতি কমে। ছেদরেখার আয়তক্ষেত্র আনুমানিক, আসল মিলিত আকৃতি নয়।');
    formula=`A = πr² = ${n(result.area)} ${unit}²; Aₙ = (N/2)r² sin(2π/N)`;extra=`data-sector-count="${N}" data-approx-area="${approx}" data-exact-area="${result.area}"`;
   }else{
    const w=p.w??p.a,d=p.d??p.a,h=p.h??p.a,literal=h<=12&&h>=.1,N=literal?Math.ceil(h):8,weights=Array.from({length:N},(_,i)=>literal?Math.min(1,h-i):h/N),B=165,D=45,depth=28,H=135;
    let consumed=0;
    body=`<g transform="translate(105 260)">${polygon(`0,0 ${B},0 ${B+D},${-depth} ${D},${-depth}`,'class="geo-base"')}`;
    const gridW=w<=12?Math.ceil(w):8,gridD=d<=12?Math.ceil(d):6;
    for(let i=1;i<gridW;i++){const x=Math.min(i/w,1)*B;if(w<=12)body+=line(x,0,x+D,-depth);else body+=line(i/gridW*B,0,i/gridW*B+D,-depth);}
    for(let i=1;i<gridD;i++){const q=d<=12?Math.min(i/d,1):i/gridD;body+=line(D*q,-depth*q,B+D*q,-depth*q);}
    weights.forEach((weight,i)=>{
     const amount=i===0?clamp(position):clamp(reveal*(N-1)-(i-1)),bottom=-consumed/h*H,thick=weight/h*H,top=bottom-thick;consumed+=weight;
     body+=`<g class="geo-layer" data-layer-height="${weight}" opacity="${amount}" transform="translate(0 ${-35*(1-amount)})">${polygon(`0,${bottom} ${B},${bottom} ${B},${top} 0,${top}`,'class="geo-original"')}${polygon(`${B},${bottom} ${B+D},${bottom-depth} ${B+D},${top-depth} ${B},${top}`,'class="geo-copy"')}${polygon(`0,${top} ${B},${top} ${B+D},${top-depth} ${D},${top-depth}`,'class="geo-original"')}</g>`;
    });
    body+='</g>'+text(240,55,`w = ${n(w)}, d = ${n(d)}, h = ${n(h)}`)+text(240,285,t('Layer heights: ','স্তরের উচ্চতা: ')+weights.map(n).join(' + '));
    note=(literal?t('Unit-height layers; a final fractional layer is labeled if needed.','একক উচ্চতার স্তর; দরকার হলে শেষ আংশিক স্তর আলাদা।'):t('Grouped layers: 8 equal representative slabs, not 8 unit layers.','Grouped স্তর: সমান ৮টি প্রতিনিধি slab, একক স্তর নয়।'))+' '+t('Schematic isometric view; base grid is grouped when dimensions exceed 12.','Schematic isometric ছবি; ভূমির মাত্রা ১২ ছাড়ালে grid grouped হয়।');
    formula=`V = (${n(w)} × ${n(d)}) × ${n(h)} = ${n(result.volume)} ${unit}³`;extra=`data-layer-count="${N}" data-height-sum="${consumed}" data-base-area="${w*d}" data-volume="${result.volume}"`;
   }
   const markup=`<svg class="lab-svg geometry-lesson-svg" viewBox="0 0 480 300" role="img" aria-label="${shape} area or volume derivation" data-shape="${shape}" data-position="${position}" ${extra}>${body}</svg><p class="geo-formula">${textSafe(formula)}</p><p class="geo-schematic-note">${textSafe(note)}</p>`;
   FormaAnimation.patch(document.getElementById('lab-visual'),markup);
  }
  return {data,count:4,describe,render};
 }
 function textSafe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 window.FormaGeometryLessons={create};
})();
