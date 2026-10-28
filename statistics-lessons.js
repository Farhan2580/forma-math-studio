(function(){
 'use strict';
 const t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,num=n=>Number(n.toPrecision(7)).toString(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),clamp=n=>Math.max(0,Math.min(1,n));
 const text=(x,y,s)=>`<text x="${x}" y="${y}">${esc(s)}</text>`,line=(x1,y1,x2,y2,cls='st-axis')=>`<path class="${cls}" d="M${x1} ${y1}L${x2} ${y2}"/>`;
 function create(values,paired,r){
  const n=values.length,ordered=values.map((value,id)=>({value,id})).sort((a,b)=>a.value-b.value||a.id-b.id),middle=n%2?[ordered[(n-1)/2].id]:[ordered[n/2-1].id,ordered[n/2].id];
  const preview=[...new Set([...values.slice(0,n<=20?n:18).map((_,i)=>i),...middle])],sortPreview=[...preview].sort((a,b)=>values[a]-values[b]||a-b),rank=new Map(sortPreview.map((id,i)=>[id,i])),chunk=Math.ceil(n/20),groups=[];
  for(let i=0;i<n;i+=chunk){const items=values.slice(i,i+chunk),sum=items.reduce((s,x)=>s+x,0);groups.push({start:i,count:items.length,sum,mean:sum/items.length,squares:items.reduce((s,x)=>s+(x-r.mean)**2,0)});}
  const binCount=Math.min(15,Math.max(1,Math.ceil(Math.sqrt(n)))),bins=Array.from({length:binCount},()=>[]),binOf=v=>Math.min(binCount-1,Math.floor((v-r.min)/(r.range||1)*binCount));values.forEach((v,id)=>bins[binOf(v)].push(id));
  const ss=r.populationVariance*n,low=Math.min(0,r.min,r.mean),high=Math.max(0,r.max,r.mean),span=high-low||1,py=v=>235-(v-low)/span*165,px=v=>r.range?45+(v-r.min)/r.range*510:300;
  const count=paired?11:9,data={values:[...values],paired:paired?[...paired]:null,result:r,orderedIds:ordered.map(v=>v.id),medianIds:middle,groups,bins:bins.map(b=>b.length),squaredDeviationSum:ss};
  function describe(index){return [
   [t('Keep every observation identifiable','প্রতিটি পর্যবেক্ষণ আলাদা রাখি'),t('Duplicate values are distinct observations with different IDs.','সমান মানও আলাদা ID-সহ পৃথক পর্যবেক্ষণ।'),t('Input order is shown; preview order is not a value axis.','Input-এর ক্রম দেখা যাচ্ছে; preview ক্রম মানের অক্ষ নয়।')],
   [t('Sort stably by value','মান অনুযায়ী স্থিতিশীলভাবে সাজাই'),t('Equal values retain their input order.','সমান মানের input ক্রম অপরিবর্তিত থাকে।'),t('The same labeled observations move into sorted order.','একই চিহ্নিত পর্যবেক্ষণ সাজানো অবস্থানে সরেছে।')],
   [t('Select the middle observation(s)','মাঝের পর্যবেক্ষণ বেছে নিই'),t('Odd n uses one middle value; even n averages two.','বিজোড় n-এ একটি মাঝের মান; জোড় n-এ দুটির গড়।'),`median = ${num(r.median)}; IDs: ${middle.map(i=>i+1).join(', ')}`],
   [t('Share the total equally','মোট পরিমাণ সমান ভাগ করি'),t('Interpolating every group toward the mean conserves the weighted sum. Negative quantities remain signed.','সব দলকে গড়ের দিকে সরালে ওজনযুক্ত যোগফল থাকে। ঋণাত্মক পরিমাণের চিহ্ন থাকে।'),`mean = sum/n = ${num(r.sum)}/${n} = ${num(r.mean)}`],
   [t('Measure signed deviations','চিহ্নসহ বিচ্যুতি মাপি'),t('Gray outlines retain the originals; arrows run from original values to the equal-share mean.','ধূসর সীমানায় মূল মান থাকে; তীর মূল মান থেকে সমভাগের গড়ে যায়।'),`Σ(xᵢ − mean) ≈ 0; mean = ${num(r.mean)}`],
   [t('Square deviations and average','বিচ্যুতির বর্গ করে গড় নিই'),t('Squared areas avoid cancellation. For an estimated sample mean, deviations sum to zero: choosing n−1 determines the last. The usual unbiased correction assumes independent identically distributed finite-variance samples. Example 2,4,6: mean 4; deviations −2,0,+2; SS=8; sample variance=8/2=4.','বর্গক্ষেত্রে বিপরীত চিহ্ন কাটাকাটি হয় না। নমুনার গড় নির্ধারিত হলে বিচ্যুতির যোগ শূন্য: n−১টি নিলে শেষটি নির্ধারিত। প্রচলিত unbiased correction-এ স্বাধীন সমবণ্টিত finite-variance নমুনা ধরা হয়। উদাহরণ ২,৪,৬: গড় ৪; বিচ্যুতি −২,০,+২; SS=৮; sample variance=৮/২=৪।'),`SS = ${num(ss)}; population = SS/${n} = ${num(r.populationVariance)}; sample = ${n===1?t('undefined for n=1','n=১-এ অসংজ্ঞায়িত'):`SS/${n-1} = ${num(r.sampleVariance)}`}`],
   [t('Move observations into bins','পর্যবেক্ষণ সঠিক bin-এ রাখি'),t('Equal-width bins include their left edge; only the final bin also includes the maximum.','সমান প্রস্থের bin-এ বাম প্রান্ত অন্তর্ভুক্ত; শেষ bin-এ সর্বোচ্চ মানও থাকে।'),t('Each moving point or labeled cluster belongs to its exact bin.','প্রতিটি বিন্দু বা চিহ্নিত দল সঠিক bin-এ যায়।')],
   [t('Read the completed histogram','সম্পূর্ণ histogram পড়ি'),t('Counts include all input observations; count sum must equal n.','সব input-এর গণনা আছে; bin-এর যোগফল n হবে।'),`Σ counts = ${bins.reduce((s,b)=>s+b.length,0)} = n`],
   [t('Construct the Box plot','Box plot বানাই'),t('Quartiles use medians of halves excluding the odd overall median; n=1 uses the lone value. Whiskers are min/max, not Tukey fences.','বিজোড় n-এর মাঝের মান বাদ দিয়ে দুই অর্ধের median থেকে quartile; n=১-এ একমাত্র মান। Whisker min/max, Tukey fence নয়।'),`Q1=${num(r.q1)}, median=${num(r.median)}, Q3=${num(r.q3)}, IQR=${num(r.iqr)}`],
   [t('Fit the paired scatter line','জোড়া বিন্দুর fitted line বানাই'),t('Least squares minimizes the sum of squared vertical residuals.','Least squares উল্লম্ব residual-এর বর্গের যোগ সর্বনিম্ন করে।'),r.regression?`ŷ = ${num(r.regression.slope)}x + (${num(r.regression.intercept)})`:'' ],
   [t('Read the regression residuals','Regression residual পড়ি'),t('Residual = observed y − fitted y. Vertical lengths preserve their sign; x and y scales are labeled separately.','Residual = observed y − fitted y। উল্লম্ব দৈর্ঘ্যে চিহ্ন থাকে; x ও y-এর scale আলাদা লেখা।'),r.regression?`R² = ${r.regression.r2===null?t('undefined for constant y','ধ্রুব y-তে অসংজ্ঞায়িত'):num(r.regression.r2)}`:'']
  ][Math.min(index,count-1)];}
  function render(position){
   const stage=Math.floor(position),sort=clamp(position),equal=clamp(position-3),hist=clamp(position-6),reg=clamp(position-9);let body='',note='';
   if(stage<=2){
    body+=text(35,30,t('Observation IDs — preview order (not a metric axis)','পর্যবেক্ষণ ID — preview ক্রম (মানের অক্ষ নয়)'));
    preview.forEach((id,i)=>{const step=510/Math.max(1,preview.length-1),x0=preview.length===1?300:45+i*step,x1=preview.length===1?300:45+rank.get(id)*step,x=x0+(x1-x0)*sort,y=115-Math.sin(Math.PI*sort)*(id%3)*25;
     body+=`<g data-observation="${id}" transform="translate(${x} ${y})"><circle class="${stage===2&&middle.includes(id)?'st-median':'st-point'}" r="7"/><title>${esc('ID '+(id+1)+': '+values[id])}</title>${text(-8,-15,num(values[id]))}${text(-8,28,'#'+(id+1))}</g>`;
    });
    body+=text(35,220,stage===2?`median = ${num(r.median)}`:t('Equal values keep separate IDs.','সমান মান আলাদা ID রাখে।'));
    note=n>20?t('Bounded sorting preview: first 18 observations plus actual median IDs. Their shown order is schematic; calculations and median use all observations.','সীমিত sorting preview: প্রথম ১৮টি ও আসল median ID। দেখানো ক্রম schematic; হিসাব ও median সব তথ্য থেকে।'):t('Every observation is shown once, including duplicates. Horizontal position represents order, not numeric distance.','Duplicate-সহ প্রতিটি পর্যবেক্ষণ একবার আছে। অনুভূমিক অবস্থান ক্রম, সংখ্যার দূরত্ব নয়।');
   }else if(stage<=5){
    const W=500/n;let currentTotal=0;
    groups.forEach((g,i)=>{const x=45+g.start*W,width=g.count*W-2,v=g.mean+(r.mean-g.mean)*equal,currentY=py(v),originalY=py(g.mean);currentTotal+=g.count*v;
     body+=`<rect class="st-reference" x="${x}" y="${Math.min(py(0),originalY)}" width="${Math.max(.5,width)}" height="${Math.abs(py(0)-originalY)}"/><rect class="st-bar" data-group="${i}" data-weight="${g.count}" data-value="${v}" x="${x}" y="${Math.min(py(0),currentY)}" width="${Math.max(.5,width)}" height="${Math.abs(py(0)-currentY)}"/>`;
     if(stage>=4)body+=line(x+width/2,originalY,x+width/2,originalY+(py(r.mean)-originalY)*clamp(position-4),'st-deviation');
     if(stage===5){const side=Math.sqrt(g.squares/Math.max(1,...groups.map(g=>g.squares)))*Math.min(width,55);body+=`<rect class="st-square" data-squared-sum="${g.squares}" x="${x}" y="270" width="${side}" height="${side}"/>`;}
     body+=text(x,252,g.count===1?'#'+(g.start+1):'×'+g.count);
    });
    body+=line(40,py(0),555,py(0))+line(40,py(r.mean),555,py(r.mean),'st-mean')+text(35,30,t('Signed value (input units)','চিহ্নসহ মান (input-এর একক)'))+text(35,50,`min=${num(low)}, max=${num(high)}, mean=${num(r.mean)}`)+text(35,350,stage===5?`Σ squared deviations = ${num(ss)}`:`Σ weighted values = ${num(currentTotal)}`);
    note=n>20?t('Grouped bars preserve counts as widths and group means as heights. The weighted sum uses every observation. Squares show each group’s sum of individual squared deviations, including within-group variation.','Grouped bar-এর প্রস্থে সংখ্যা ও উচ্চতায় দলের গড়। ওজনযুক্ত যোগে সব তথ্য আছে। বর্গে দলের প্রতিটি মূল বিচ্যুতির বর্গ যোগ করা, দলের ভেতরের variation-ও আছে।'):t('Gray outlines: original values. Green bars: equal sharing. Dashed signed deviations point toward the mean; squares represent squared deviations on a separate area scale.','ধূসর সীমানা: মূল মান। সবুজ bar: সমভাগ। ছেদরেখার signed বিচ্যুতি গড়ের দিকে; আলাদা area scale-এ বর্গে বিচ্যুতির বর্গ।');
   }else if(stage<=7){
    const maximum=Math.max(1,...bins.map(b=>b.length)),width=510/binCount;
    bins.forEach((ids,i)=>{const height=ids.length/maximum*180*hist;body+=`<rect class="st-bar" data-bin="${i}" data-count="${ids.length}" x="${45+i*width}" y="${265-height}" width="${width-3}" height="${height}"/>`+text(45+(i+.2)*width,285,num(r.min+(i+.5)*(r.range||1)/binCount))+text(45+(i+.3)*width,260-height,ids.length);
     const dots=n<=40?ids.map(id=>({value:values[id],count:1,id})):ids.length?[{value:ids.reduce((s,id)=>s+values[id],0)/ids.length,count:ids.length,id:i}]:[];
     dots.forEach((dot,j)=>{const target=45+(i+.5)*width,from=px(dot.value),y0=55+(j%3)*14,y1=255-ids.length/maximum*180;body+=`<circle class="st-point" data-bin-target="${i}" data-count="${dot.count}" cx="${from+(target-from)*hist}" cy="${y0+(y1-y0)*hist}" r="5"/><title>${dot.count} observations</title>`;});
    });body+=line(45,265,555,265)+text(35,25,t('Histogram — value bins / observation count','Histogram — মানের bin / পর্যবেক্ষণ সংখ্যা'))+text(35,320,t('Bin labels: midpoints; final bin includes maximum.','Bin label: মধ্যবিন্দু; শেষ bin-এ সর্বোচ্চ মান থাকে।'));
    note=(n<=40?t('Each dot is one observation. Counts and axis scale use the full data.','প্রতিটি বিন্দু একটি পর্যবেক্ষণ। গণনা ও scale সব তথ্য থেকে।'):t('Grouped motion: each bin’s cluster represents its labeled full observation count; all observations contribute.','Grouped সরণ: প্রতিটি bin-এর দল চিহ্নিত সংখ্যার সব পর্যবেক্ষণ বোঝায়; সব তথ্য গণনায় আছে।'))+(r.range===0?' '+t('Constant data use a unit-wide display interval beginning at that value.','ধ্রুব তথ্যের ছবিতে ওই মান থেকে এক একক প্রস্থের interval ব্যবহার করা হয়।'):'');
   }else if(stage===8){
    body+=text(35,30,t('Box plot — min/max whiskers','Box plot — min/max whisker'))+line(px(r.min),160,px(r.max),160)+line(px(r.min),135,px(r.min),185)+line(px(r.max),135,px(r.max),185)+`<rect class="st-box" x="${px(r.q1)}" y="120" width="${px(r.q3)-px(r.q1)}" height="80"/>`+line(px(r.median),120,px(r.median),200,'st-mean')+text(35,245,`min=${num(r.min)}; Q1=${num(r.q1)}; median=${num(r.median)}`)+text(35,275,`Q3=${num(r.q3)}; max=${num(r.max)}`);
    note=describe(8)[1];
   }else{
    const minY=Math.min(...paired,...values.map(x=>r.regression.slope*x+r.regression.intercept)),maxY=Math.max(...paired,...values.map(x=>r.regression.slope*x+r.regression.intercept)),ry=y=>260-(y-minY)/(maxY-minY||1)*200,ids=n<=40?values.map((_,i)=>i):preview;
    body+=text(35,25,t('Paired scatter and vertical residuals','জোড়া scatter ও উল্লম্ব residual'))+line(45,260,555,260)+line(45,45,45,260);
    ids.forEach(id=>{const x=px(values[id]),y=ry(paired[id]),fit=r.regression.slope*values[id]+r.regression.intercept;body+=`<circle class="st-point" data-paired-id="${id}" cx="${x}" cy="${y}" r="5"/>`+`<path class="st-deviation" data-residual="${paired[id]-fit}" d="M${x} ${y}V${y+(ry(fit)-y)*reg}"/>`;});
    const lastX=r.min+r.range*reg;body+=line(px(r.min),ry(r.regression.slope*r.min+r.regression.intercept),px(lastX),ry(r.regression.slope*lastX+r.regression.intercept),'st-fit')+text(35,300,`x: ${num(r.min)}…${num(r.max)}; y: ${num(minY)}…${num(maxY)}`);
    note=n<=40?describe(10)[1]:t('Bounded scatter preview; fitted line and R² use all paired inputs.','সীমিত scatter preview; fitted line ও R² সব জোড়া input থেকে।');
   }
   const deviations=stage===4||stage===5?`<details><summary>${t('All signed deviations','সব চিহ্নযুক্ত বিচ্যুতি')} (${n})</summary><p>${values.map((v,i)=>esc(`#${i+1}: ${num(v)} − (${num(r.mean)}) = ${v-r.mean>=0?'+':''}${num(v-r.mean)}${stage===5?`; Δ² = ${num((v-r.mean)**2)}`:''}`)).join(' · ')}</p></details>`:'';
   FormaAnimation.patch(document.getElementById('lab-visual'),`<svg class="statistics-lesson-svg" viewBox="0 0 600 370" role="img" aria-label="${esc(describe(stage)[0])}" data-position="${position}" data-stage="${stage}" data-sum="${r.sum}" data-squared-sum="${ss}">${body}</svg><p class="lab-note statistics-drawing-note">${esc(note)}</p>${deviations}`);
  }
  return {data,count,describe,render};
 }
 window.FormaStatisticsLessons={create};
})();
