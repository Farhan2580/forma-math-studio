(function(){
 'use strict';
 const $=id=>document.getElementById(id),t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,abs=n=>n<0n?-n:n;
 const gcd=(a,b)=>{a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b];}return a;};
 const normalize=(n,d)=>{if(d===0n)throw Error(t('Denominator cannot be zero.','হর শূন্য হতে পারে না।'));return d<0n?{n:-n,d:-d}:{n,d};};
 const simplify=v=>{const g=gcd(v.n,v.d);return {n:v.n/g,d:v.d/g};},str=v=>`${v.n}/${v.d}`;
 function solve(an,ad,bn,bd,op='+'){
  const a=normalize(BigInt(an),BigInt(ad)),b=normalize(BigInt(bn),BigInt(bd));let raw;
  const common=a.d/gcd(a.d,b.d)*b.d,A=a.n*(common/a.d),B=b.n*(common/b.d);
  if(op==='+')raw={n:A+B,d:common};else if(op==='-')raw={n:A-B,d:common};else if(op==='*')raw={n:a.n*b.n,d:a.d*b.d};else if(op==='/'){if(b.n===0n)throw Error(t('Cannot divide by a zero fraction.','শূন্য ভগ্নাংশ দিয়ে ভাগ করা যায় না।'));raw=normalize(a.n*b.d,a.d*b.n);}else throw Error('Invalid fraction operation');
  return {a,b,op,common,A,B,raw,result:simplify(raw)};
 }
 function decimal(v){let sign=v.n<0n?'-':'',n=abs(v.n),whole=n/v.d,remainder=n%v.d,out='';for(let i=0;i<20&&remainder;i++){remainder*=10n;out+=remainder/v.d;remainder%=v.d;}return {text:sign+whole+(out?'.'+out:'')+(remainder?'…':''),exact:remainder===0n};}
 function mixed(v){const q=abs(v.n)/v.d,r=abs(v.n)%v.d;return r===0n?String(v.n/v.d):q===0n?str(v):(v.n<0n?'-(':'(')+q+' + '+r+'/'+v.d+')';}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const txt=(x,y,s)=>`<text x="${x}" y="${y}">${esc(s)}</text>`,clamp=x=>Math.max(0,Math.min(1,x));
 function field(id,en,bn,v){return `<label for="${id}" data-fr-en="${en}" data-fr-bn="${bn}">${t(en,bn)}</label><input id="${id}" type="text" inputmode="numeric" maxlength="81" value="${v}" autocomplete="off">`;}
 function form(){return `<div class="fraction-inputs"><fieldset><legend>A</legend>${field('fr-an','Numerator A','লব A',1)}${field('fr-ad','Denominator A','হর A',2)}</fieldset><fieldset><legend>B</legend>${field('fr-bn','Numerator B','লব B',1)}${field('fr-bd','Denominator B','হর B',3)}</fieldset></div><label for="fr-op" data-fr-en="Operation" data-fr-bn="গাণিতিক কাজ">${t('Operation','গাণিতিক কাজ')}</label><select id="fr-op"><option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option></select>${field('fr-factor','Equivalent fraction factor (1–1000)','সমতুল্য ভগ্নাংশের গুণক (১–১০০০)',2)}<label for="fr-example" data-fr-en="Worked example" data-fr-bn="উদাহরণ">${t('Worked example','উদাহরণ')}</label><select id="fr-example"><option value="add">1/2 + 1/3</option><option value="sub">1/3 − 1/2</option><option value="mul">2/3 × 3/4</option><option value="div">3/4 ÷ 1/2</option><option value="improper">7/3 + 2/3</option></select><p class="lab-note" data-fr-en="Exact integer inputs: up to 80 digits each. At most 24 partitions per whole and 3 wholes are drawn literally; larger quantities use explicitly grouped diagrams. Decimal display uses at most 20 places." data-fr-bn="প্রতিটি পূর্ণসংখ্যা সর্বোচ্চ ৮০ অঙ্ক; হিসাব নির্ভুল। সরাসরি ছবিতে প্রতি পূর্ণ এককে সর্বোচ্চ ২৪ ভাগ ও ৩টি পূর্ণ একক; বড় মানে চিহ্নিত grouped ছবি। দশমিক সর্বোচ্চ ২০ ঘর।">${t('Exact integer inputs: up to 80 digits each. At most 24 partitions per whole and 3 wholes are drawn literally; larger quantities use explicitly grouped diagrams. Decimal display uses at most 20 places.','প্রতিটি পূর্ণসংখ্যা সর্বোচ্চ ৮০ অঙ্ক; হিসাব নির্ভুল। সরাসরি ছবিতে প্রতি পূর্ণ এককে সর্বোচ্চ ২৪ ভাগ ও ৩টি পূর্ণ একক; বড় মানে চিহ্নিত grouped ছবি। দশমিক সর্বোচ্চ ২০ ঘর।')}</p>`;}
 function bind(){ $('fr-example').addEventListener('change',()=>{const v={add:[1,2,1,3,'+'],sub:[1,3,1,2,'-'],mul:[2,3,3,4,'*'],div:[3,4,1,2,'/'],improper:[7,3,2,3,'+']}[$('fr-example').value];['an','ad','bn','bd','op'].forEach((id,i)=>$('fr-'+id).value=v[i]);});}
 function translate(){document.querySelectorAll('[data-fr-en]').forEach(node=>{const value=t(node.dataset.frEn,node.dataset.frBn);if(node.textContent!==value)node.textContent=value;});}
 function read(id){const field=$(id),value=field.value.trim();if(!/^[+-]?\d{1,80}$/.test(value)){const message=t('Enter an integer with at most 80 digits.','সর্বোচ্চ ৮০ অঙ্কের পূর্ণসংখ্যা লিখুন।');FormaFeedback.error(field,message);throw Error(message);}FormaFeedback.clear(field);return BigInt(value);}
 function calculate(){
  const values=['an','ad','bn','bd'].map(id=>read('fr-'+id)),factor=read('fr-factor');
  for(const i of [1,3])if(values[i]===0n){const message=t('Denominator cannot be zero.','হর শূন্য হতে পারে না।');FormaFeedback.error(i===1?'fr-ad':'fr-bd',message);throw Error(message);}
  if(factor<1n||factor>1000n){const message=t('Equivalent factor must be 1–1000.','সমতুল্য গুণক ১–১০০০ হতে হবে।');FormaFeedback.error('fr-factor',message);throw Error(message);}
  if($('fr-op').value==='/'&&values[2]===0n){const message=t('Cannot divide by a zero fraction.','শূন্য ভগ্নাংশ দিয়ে ভাগ করা যায় না।');FormaFeedback.error('fr-bn',message);throw Error(message);}
  return lesson({...solve(...values,$('fr-op').value),factor});
 }
 function lesson(model){
  const {a,b,op,common,A,B,raw,result,factor}=model,number=v=>Number(v.n)/Number(v.d),av=number(a),bv=number(b),rv=number(result),signed=a.n<0n||b.n<0n||result.n<0n,wholeW=abs(a.n)<=a.d&&abs(b.n)<=b.d&&abs(result.n)<=result.d?400:170;
  const details=()=>{
   if(op==='+'||op==='-')return [
    [t('Compare equal-sized wholes','একই মাপের পূর্ণ একক তুলনা করি'),t('Both fractions use the same whole. A negative quantity is a signed length.','দুই ভগ্নাংশে পূর্ণ এককের মাপ একই। ঋণাত্মক মান চিহ্নসহ দৈর্ঘ্য।'),`${str(a)} ${op} ${str(b)}`],
    [t('Find the least common denominator','ক্ষুদ্রতম সাধারণ হর পাই'),t('LCM gives pieces of the same size for both quantities.','LCM দুই পরিমাণের অংশের মাপ সমান করে।'),`LCM(${a.d}, ${b.d}) = ${common}`],
    [t('Subdivide without changing the quantity','পরিমাণ না বদলে ছোট ভাগ করি'),t('Multiplying numerator and denominator by the same factor multiplies by 1.','লব ও হর একই গুণক দিয়ে গুণ করা মানে ১ দিয়ে গুণ করা।'),`${str(a)} × ${common/a.d}/${common/a.d} = ${A}/${common}; ${str(b)} × ${common/b.d}/${common/b.d} = ${B}/${common}`],
    [op==='+'?t('Join equal pieces','সমান অংশ একত্র করি'):t('Remove or move signed pieces','অংশ সরাই অথবা চিহ্নসহ এগোই'),signed?t('Use signed number-line directions; subtracting a negative moves right.','চিহ্নযুক্ত সংখ্যারেখা ব্যবহার করি; ঋণাত্মক মান বিয়োগে ডানে এগোই।'):t('Equal-size pieces can be counted together or removed.','সমান মাপের অংশ একসঙ্গে গোনা বা সরানো যায়।'),`${A}/${common} ${op} ${B}/${common} = ${str(raw)}`],
    [t('Simplify the result','ফল সরল করি'),t('Divide numerator and denominator by their GCD; the value stays unchanged.','লব ও হর তাদের গসাগু দিয়ে ভাগ করি; মান অপরিবর্তিত থাকে।'),`${str(raw)} = ${str(result)}; GCD = ${gcd(raw.n,raw.d)}`]
   ];
   if(op==='*')return [
    [t('Shade the horizontal share','অনুভূমিক অংশ রং করি'),t('The first fraction selects a width relative to one whole.','প্রথম ভগ্নাংশ একটি পূর্ণ এককের তুলনায় প্রস্থ বেছে নেয়।'),`A = ${str(a)}`],
    [t('Shade the vertical share','উল্লম্ব অংশ রং করি'),t('The second fraction selects a height; overlap is the product.','দ্বিতীয় ভগ্নাংশ উচ্চতা বেছে নেয়; ছেদ অংশ গুণফল।'),`B = ${str(b)}`],
    [t('Count the overlap','ছেদ অংশ গুনি'),t('Rows and columns multiply both the selected pieces and total pieces.','সারি ও কলাম নির্বাচিত এবং মোট উভয় অংশের সংখ্যা গুণ করে।'),`${a.n} × ${b.n} / (${a.d} × ${b.d}) = ${str(raw)}`],
    [t('Read magnitude and sign','পরিমাণ ও চিহ্ন পড়ি'),t('One negative factor gives a negative product; two give a positive product.','একটি ঋণাত্মক গুণকে গুণফল ঋণাত্মক, দুটিতে ধনাত্মক।'),`${str(a)} × ${str(b)} = ${str(raw)}`],
    [t('Simplify the product','গুণফল সরল করি'),t('Grouping equivalent cells preserves area.','সমতুল্য কোষ একত্র করলে ক্ষেত্রফল অপরিবর্তিত থাকে।'),`${str(raw)} = ${str(result)}`]
   ];
   return [
    [t('Measure the available amount','বিদ্যমান পরিমাণ মাপি'),t('Division asks how many copies of B fit in A.','ভাগ মানে A-এর মধ্যে B-এর কতটি অনুলিপি আছে।'),`A = ${str(a)}`],
    [t('Choose one measuring group','একটি মাপের দল নিই'),t('One group has magnitude |B|; it is not one whole unless |B|=1.','এক দলের মাপ |B|; |B|=১ না হলে এটি এক পূর্ণ একক নয়।'),`|B| = ${str({n:abs(b.n),d:b.d})}`],
    [t('Count full and partial groups','পূর্ণ ও আংশিক দল গুনি'),t('A leftover amount may fill only part of the last group.','অবশিষ্ট পরিমাণ শেষ দলের কেবল একটি অংশ পূরণ করতে পারে।'),`|A/B| = ${abs(result.n)/result.d} + ${abs(result.n)%result.d}/${result.d}`],
    [t('Connect measurement to reciprocal','মাপকে বিপরীত ভগ্নাংশের সঙ্গে মিলাই'),t('A/B = (a/b)/(c/d) = ad/bc; the picture first establishes what the quotient measures.','A/B = (a/b)/(c/d) = ad/bc; আগে ছবিতে ভাগফলের অর্থ মেপেছি।'),`${str(a)} ÷ ${str(b)} = ${str(a)} × ${b.d}/${b.n} = ${str(raw)}`],
    [t('Simplify and apply the sign','সরল করে চিহ্ন প্রয়োগ করি'),t('The group count gives magnitude; equal signs give +, different signs give −.','দলের সংখ্যা পরিমাণ দেয়; একই চিহ্নে +, ভিন্ন চিহ্নে −।'),`${str(raw)} = ${str(result)}`]
   ];
  };
  function resultHTML(){const dec=decimal(result);return `<div class="fraction-answer"><math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>${result.n}</mn><mn>${result.d}</mn></mfrac></math><strong>${esc(t('Exact','নির্ভুল'))}: ${str(result)}</strong></div><dl class="result-grid">${[[t('Mixed number','মিশ্র সংখ্যা'),mixed(result)],[t('Decimal','দশমিক'),(dec.exact?t('Exact: ','নির্ভুল: '):t('Approximate: ','আনুমানিক: '))+dec.text],[t('Equivalent A','সমতুল্য A'),`${str(a)} = ${a.n*factor}/${a.d*factor}`],[t('Equivalent B','সমতুল্য B'),`${str(b)} = ${b.n*factor}/${b.d*factor}`],[t('Reduced A; reduced B','সরল A; সরল B'),str(simplify(a))+'; '+str(simplify(b))]].map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;}
  function bars(value,denom,y,label,piecesOpacity=1){
   const q=abs(value.n)/value.d,rem=abs(value.n)%value.d,small=q<3n,den=denom<=24n?Number(denom):12,W=wholeW,left=45;let out=txt(left,y-12,label+' '+str(value));
   const wholeCount=small?Math.max(1,Number(q)+(rem?1:0)):2;
   for(let whole=0;whole<wholeCount;whole++){
    const x=left+whole*(W+18),fraction=small?(whole<Number(q)?1:Number(rem)/Number(value.d)):whole===0?1:Number(rem)/Number(value.d);
    out+=`<rect class="fr-outline" x="${x}" y="${y}" width="${W}" height="26"/><rect class="fr-share" x="${x}" y="${y}" width="${W*fraction}" height="26" opacity="${piecesOpacity}"/>`;
    for(let i=1;i<den;i++)out+=`<path class="fr-partition" d="M${x+i*W/den} ${y}v26"/>`;
    if(!small)out+=txt(x,y+43,whole===0?'× '+q:t('remainder','অবশিষ্ট'));
   }
   return out;
  }
  function render(position){
   const step=Math.floor(position),join=clamp(position-2);let body='',note='',attrs='';
   if(op==='+'||op==='-'){
    const den=position>=2?common:a.d;
    body=bars(a,den,50,'A')+bars(b,position>=2?common:b.d,125,'B')+bars(result,common,220,t('Result','ফল'),join);
    // Fade in new boundaries on the same whole: subdivision changes partition,
    // never the represented filled length.
    if(position>1&&position<2&&common<=24n){for(const y of [50,125])for(let i=1;i<Number(common);i++)body+=`<path class="fr-partition" opacity="${position-1}" d="M${45+i*wholeW/Number(common)} ${y}v26"/>`;}
    const literal=!signed&&common<=24n&&a.n<=a.d&&b.n<=b.d&&(op==='+'||A>=B);
    if(literal&&position>=2){const count=Number(op==='+'?A+B:A),D=Number(common),W=wholeW;
     for(let i=0;i<count;i++){
      const fromB=op==='+'&&i>=Number(A),j=fromB?i-Number(A):i,remove=op==='-'&&i>=Number(A-B),fromX=45+j*W/D,fromY=fromB?125:50,targetX=45+(i%D)*W/D+Math.floor(i/D)*(W+18),targetY=remove?285:220;
      body+=`<rect class="fr-moving ${fromB||remove?'fr-second':''}" data-piece="${i}" x="${fromX+(targetX-fromX)*join}" y="${fromY+(targetY-fromY)*join}" width="${W/D}" height="26"/>`;
     }
     if(op==='-')body+=txt(45,326,t('Dashed pieces: removed, not part of result.','ছেদরেখার অংশ: সরানো হয়েছে, ফলের অংশ নয়।'));
    }
    note=common>24n?t('Grouped boundaries (12 divisions shown per representative whole), not literal denominator pieces. Exact quantities and LCM are written in the steps.','Grouped সীমানা (প্রতি প্রতিনিধি পূর্ণ এককে ১২ ভাগ), হরের আসল অংশ নয়। ধাপে নির্ভুল পরিমাণ ও LCM লেখা আছে।'):t('Every whole has the same width. Negative rows show magnitudes; the signed line gives direction. Repeated wholes are labeled ×count.','প্রতিটি পূর্ণ এককের প্রস্থ একই। ঋণাত্মক সারিতে পরিমাণ, সংখ্যারেখায় দিক দেখানো হয়েছে। পুনরাবৃত্ত পূর্ণ একক ×সংখ্যা দিয়ে চিহ্নিত।');
    attrs=`data-common="${common}" data-subdivision="${position>=2}"`;
   }else if(op==='*'){
    const x=65,y=60,W=400,H=185,aa=Math.abs(av),bb=Math.abs(bv),proper=aa<=1&&bb<=1,cols=a.d<=24n?Number(a.d):12,rows=b.d<=24n?Number(b.d):12;
    const sx=proper?aa:aa===0?0:1,sy=proper?bb:bb===0?0:1;
    body=`<rect class="fr-outline" x="${x}" y="${y}" width="${W}" height="${H}"/><rect class="fr-share" x="${x}" y="${y}" width="${W*sx}" height="${H}"/><rect class="fr-second" opacity="${clamp(position)}" x="${x}" y="${y}" width="${W}" height="${H*sy}"/><rect class="fr-overlap" opacity="${clamp(position-1)}" x="${x}" y="${y}" width="${W*sx}" height="${H*sy}"/>`;
    for(let i=1;i<cols;i++)body+=`<path class="fr-partition" d="M${x+i*W/cols} ${y}v${H}"/>`;for(let j=1;j<rows;j++)body+=`<path class="fr-partition" d="M${x} ${y+j*H/rows}h${W}"/>`;
    body+=txt(x,40,`|A| = ${str({n:abs(a.n),d:a.d})}`)+txt(x,275,`|B| = ${str({n:abs(b.n),d:b.d})}; |A×B| = ${str({n:abs(result.n),d:result.d})}`);
    note=proper&&a.d<=24n&&b.d<=24n?t('Unit rectangle: horizontal A, vertical B, dark overlap A×B. Negative signs are applied separately on the signed line.','একক আয়তক্ষেত্র: অনুভূমিক A, উল্লম্ব B, গাঢ় ছেদ A×B। ঋণাত্মক চিহ্ন আলাদা সংখ্যারেখায়।'):t('Normalized magnitude area model; rectangle width represents |A| and height |B|, not a single unit square. Partition lines are grouped when a denominator exceeds 24. Exact signs and dimensions are labeled.','Normalized পরিমাণের ক্ষেত্রফল model; প্রস্থ |A| ও উচ্চতা |B|, একক বর্গ নয়। হর ২৪ ছাড়ালে ভাগগুলো grouped। চিহ্ন ও সঠিক মাত্রা লেখা আছে।');
    attrs=`data-product="${str(result)}" data-selected-cells="${abs(a.n*b.n)}" data-total-cells="${a.d*b.d}"`;
   }else{
    const q=abs(result.n)/result.d,rem=abs(result.n)%result.d,grouped=q>8n,count=grouped?1:Number(q),fraction=Number(rem)/Number(result.d),groups=Math.max(1,count+(rem?1:0)),W=Math.min(180,460/groups),drop=clamp(position-1);
    body=txt(45,40,`|A| = ${str({n:abs(a.n),d:a.d})}; `+t('one measuring group','এক মাপের দল')+` = |B| = ${str({n:abs(b.n),d:b.d})}`);
    for(let i=0;i<groups;i++){const amount=i<count?1:fraction,x=45+i*W;body+=`<rect class="fr-outline" x="${x}" y="150" width="${W}" height="35"/><rect class="fr-moving" data-group="${i}" x="${x}" y="${70+80*drop}" width="${W*amount}" height="35"/>`;}
    body+=txt(45,225,t('Full groups: ','পূর্ণ দল: ')+q+(rem?' + '+rem+'/'+result.d+t(' of a group',' দলের অংশ'):''))+txt(45,265,`${str(a)} ÷ ${str(b)} = ${str(result)}`);
    note=(grouped?t('Grouped measurement: the full pictured group stands for ×','Grouped মাপ: দেখানো পূর্ণ দলটি বোঝায় ×')+q+'. ':t('Outlined boxes measure |B|; partial fill is a fraction of one group, not discarded remainder.','সীমানাযুক্ত বাক্সের মাপ |B|; আংশিক রং একটি দলের অংশ, বাদ দেওয়া অবশিষ্ট নয়।'))+' '+t('Signed quotient is explained on the line when needed.','দরকার হলে চিহ্নযুক্ত ভাগফল সংখ্যারেখায় বোঝানো হয়েছে।');
    attrs=`data-full-groups="${q}" data-partial-group="${rem}/${result.d}"`;
   }
   let signedMarkup='';
   if(signed){const start=op==='+'||op==='-'?av:0,range=Math.max(1,Math.abs(av),Math.abs(bv),Math.abs(rv)),px=v=>300+v/range*240;
    signedMarkup=`<svg class="fraction-svg fraction-signed" viewBox="0 0 600 100" role="img" aria-label="Signed number line"><defs><marker id="fr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#b87831"/></marker></defs><path class="fr-axis" d="M30 50H570"/><path class="fr-direction" marker-end="url(#fr-arrow)" d="M${px(start)} 50H${px(start+(rv-start)*clamp(position-2))}"/>${txt(px(0),80,'0')}${txt(35,20,t('Signed direction; normalized scale','চিহ্নসহ দিক; normalized scale'))}${txt(35,98,`${str(a)} ${op} ${str(b)} = ${str(result)}`)}</svg>`;}
   FormaAnimation.patch($('lab-visual'),`<svg class="fraction-svg" viewBox="0 0 600 350" role="img" aria-label="Fraction learning model" data-operation="${op}" data-position="${position}" ${attrs}>${body}</svg>${signedMarkup}<p class="fraction-drawing-note">${esc(note)}</p><p class="fraction-live-equation">${esc(details()[Math.min(4,step)][2])}</p>`);
  }
  return {data:model,count:5,describe:i=>details()[Math.min(4,i)],render,resultHTML};
 }
 window.FormaFractions={solve,normalize,simplify,gcd,decimal,mixed,form,bind,translate,calculate,lesson};
})();
