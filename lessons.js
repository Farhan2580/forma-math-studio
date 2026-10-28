(function(){
  'use strict';
  const M=window.FormaMath,E=window.FormaEngine,f=M.format,$=id=>document.getElementById(id),A=window.FormaAnimation;
  const text=(en,bn)=>({en,bn}),step=(what,why,changed)=>({what,why,changed});
  const pick=value=>value[document.documentElement.lang==='bn'?'bn':'en'];
  function arithmetic(a,b,op){
    const result=M.arithmetic(a,b,op),sign={'+':'+','-':'−','*':'×','/':'÷'}[op],ast=E.parse('('+a+')'+op+'('+b+')');
    const equation=f(a)+' '+sign+' '+f(b)+' = '+f(result),model={type:'arithmetic',a,b,op,result,ast,equation};
    if(op==='+'||op==='-'){
      const delta=op==='+'?b:-b,direction=delta>0?'right':delta<0?'left':'nowhere',bn=delta>0?'ডানে':delta<0?'বাঁয়ে':'স্থির';
      model.steps=[step(text('Locate the starting value '+f(a)+'.','শুরুর মান '+f(a)+' খুঁজুন।'),text('The first number is our starting position.','প্রথম সংখ্যাই শুরুর অবস্থান।'),text('Marker at '+f(a)+'.','বিন্দু '+f(a)+'-এ।')),
        step(text((op==='+'?'Add ':'Subtract ')+f(b)+'.',(op==='+'?'যোগ করুন ':'বিয়োগ করুন ')+f(b)+'।'),text(op==='+'?'Adding a signed value changes position by that value.':'Subtracting b is the same as adding −b.',op==='+'?'চিহ্নসহ মান যোগ করলে সেই পরিমাণ অবস্থান বদলায়।':'b বিয়োগ মানে −b যোগ করা।'),text('Signed displacement = '+f(delta)+'.','চিহ্নযুক্ত সরণ = '+f(delta)+'।')),
        step(text('Move '+direction+' by '+f(Math.abs(delta))+'.',f(Math.abs(delta))+' একক '+bn+' চলুন।'),text('Positive displacement moves right; negative displacement moves left.','ধনাত্মক সরণ ডানে, ঋণাত্মক সরণ বাঁয়ে যায়।'),text('Arrive at '+f(result)+'.',f(result)+'-এ পৌঁছান।')),
        step(text(equation,equation),text('The endpoint is the sum or difference.','শেষ অবস্থানই যোগফল বা বিয়োগফল।'),text('Answer: '+f(result)+'.','উত্তর: '+f(result)+'।'))];
    }else if(op==='*'){
      model.grid=Number.isInteger(a)&&Number.isInteger(b)&&a>0&&b>0&&result<=100;
      const description=model.grid?f(a)+' equal groups of '+f(b):'a signed, scaled area model';
      model.steps=[step(text('Represent '+description+'.',model.grid?f(b)+'টি করে '+f(a)+'টি সমান দল সাজান।':'চিহ্নসহ স্কেল করা ক্ষেত্রের মডেল নিন।'),text('Multiplication combines equal groups or scales an area.','গুণ সমান দল একত্র করে বা ক্ষেত্রফল দিয়ে বোঝায়।'),text('Factors: '+f(a)+' and '+f(b)+'.','গুণনীয়ক: '+f(a)+' এবং '+f(b)+'।')),
        step(text(model.grid?'Count one group, then repeat it.':'Draw the magnitude lengths |a| and |b| on a common scale.',model.grid?'একটি দল গুনে একই দল পুনরাবৃত্তি করুন।':'একই স্কেলে পরমমানের দৈর্ঘ্য |a| ও |b| আঁকুন।'),text(model.grid?'Every group contains the same amount.':'Decimal/signed factors are labeled lengths, not a fractional or negative count of recipients.',model.grid?'প্রতিটি দলে সমান পরিমাণ থাকে।':'দশমিক/চিহ্নযুক্ত গুণনীয়ক এখানে লেখা দৈর্ঘ্য; দশমিক বা ঋণাত্মক সংখ্যক ভাগগ্রহীতা নয়।'),text(model.grid?'One group has '+f(b)+'; there are '+f(a)+' groups.':'|a| = '+f(Math.abs(a))+', |b| = '+f(Math.abs(b))+'.',model.grid?'এক দলে '+f(b)+'; মোট '+f(a)+' দল।':'|a| = '+f(Math.abs(a))+', |b| = '+f(Math.abs(b))+'।')),
        step(text(model.grid?'Combine the groups; keep track of the sign.':'Extend the magnitude area, then apply the sign.',model.grid?'দলগুলো একত্র করুন এবং চিহ্ন হিসাব করুন।':'পরমমানের ক্ষেত্রটি বাড়িয়ে গুণফলের চিহ্ন প্রয়োগ করুন।'),text('A zero factor gives zero; otherwise like signs give +, unlike signs give −.','শূন্য গুণনীয়কে গুণফল শূন্য; অন্যথায় একই চিহ্নে +, বিপরীত চিহ্নে −।'),text('Magnitude of product = '+f(Math.abs(result))+'.','গুণফলের পরমমান = '+f(Math.abs(result))+'।')),
        step(text(equation,equation),text(model.grid?'Rows × columns counts all blocks.':'Dimensions are schematic; use the labeled values, not drawn lengths.',model.grid?'সারি × কলাম সব ঘর গুনে দেয়।':'চিত্রের মাপ প্রতীকী; আঁকা দৈর্ঘ্যের বদলে লেখা মান ব্যবহার করুন।'),text('Answer: '+f(result)+'.','উত্তর: '+f(result)+'।'))];
    }else{
      model.distribution=Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&a<=100&&b>=1&&b<=12;
      model.quotient=model.distribution?Math.floor(a/b):null;model.remainder=model.distribution?a%b:null;
      model.steps=[step(text('Start with '+f(a)+' and divide by '+f(b)+'.',f(a)+'-কে '+f(b)+' দিয়ে ভাগ করুন।'),text('Division asks how much belongs in each equal share.','ভাগ সমান অংশে কত থাকে তা জানতে চায়।'),text(model.distribution?f(b)+' recipient groups.':'Use a scaled quotient model for signed or decimal values.',model.distribution?f(b)+'টি ভাগগ্রহীতা দল।':'চিহ্নযুক্ত বা দশমিক মানে স্কেল করা ভাগফলের মডেল।')),
        step(text(model.distribution?'Distribute equally without changing the total.':'Find the multiplier x such that b × x = a.',model.distribution?'মোট পরিমাণ অক্ষুণ্ণ রেখে সমানভাবে বণ্টন করুন।':'b × x = a হয় এমন গুণক x খুঁজুন।'),text(model.distribution?'Every full group must receive the same count.':'Division is the inverse of multiplication.',model.distribution?'প্রতিটি পূর্ণ দলে সমান সংখ্যা থাকতে হবে।':'ভাগ গুণের বিপরীত অপারেশন।'),text(model.distribution?'Each full group receives '+model.quotient+'.':'Solve '+f(b)+' × x = '+f(a)+'.',model.distribution?'প্রতিটি পূর্ণ দলে '+model.quotient+'টি।':f(b)+' × x = '+f(a)+' সমাধান করুন।')),
        step(text(model.distribution?'Separate any remainder.':'Scale to the quotient; retain the signs.',model.distribution?'অবশিষ্ট অংশ আলাদা রাখুন।':'চিহ্ন রেখে ভাগফল অনুযায়ী স্কেল করুন।'),text(model.distribution?'A remainder is left after complete integer distribution.':'This is a ratio, not a count of fractional recipients.',model.distribution?'পূর্ণসংখ্যায় সমবণ্টনের পর যা থাকে সেটি ভাগশেষ।':'এটি অনুপাত; দশমিক সংখ্যক ভাগগ্রহীতা নয়।'),text(model.distribution?f(a)+' = '+f(b)+' × '+model.quotient+' + '+model.remainder+'.':'Quotient = '+f(result)+'.',model.distribution?f(a)+' = '+f(b)+' × '+model.quotient+' + '+model.remainder+'।':'ভাগফল = '+f(result)+'।')),
        step(text(equation,equation),text('The numerical quotient can include a fractional part.','সংখ্যাগত ভাগফলে ভগ্নাংশ থাকতে পারে।'),text(model.distribution?'Integer distribution: '+model.quotient+' each, remainder '+model.remainder+'. Decimal quotient ≈ '+f(result)+'.':'Answer ≈ '+f(result)+'.',model.distribution?'পূর্ণসংখ্যায় প্রতি দলে '+model.quotient+', ভাগশেষ '+model.remainder+'। দশমিক ভাগফল ≈ '+f(result)+'।':'উত্তর ≈ '+f(result)+'।'))];
    }
    return model;
  }
  function percentage(p,n,kind='of'){
    const share=M.percentage(p,n),change=kind==='decrease'?-share:share,result=kind==='of'?share:M.arithmetic(n,change,'+');
    const source=kind==='of'?'('+p+'/100)*('+n+')':'('+n+')'+(kind==='decrease'?'-':'+')+'(('+p+'/100)*('+n+'))';
    const model={type:'percentage',p,n,kind,share,change,result,ast:E.parse(source),equation:kind==='of'?f(p)+'% of '+f(n)+' = '+f(result):f(n)+(kind==='decrease'?' − (':' + (')+f(share)+') = '+f(result)};
    model.steps=[step(text('Read '+f(p)+'%.',f(p)+'% পড়ুন।'),text('Percent means parts per hundred.','শতকরা মানে প্রতি একশ ভাগে অংশ।'),text('One grid = 100 cells = 100%.','একটি গ্রিড = ১০০ ঘর = ১০০%।')),
      step(text(f(p)+'% = '+f(p)+' / 100 = '+f(p/100)+'.',f(p)+'% = '+f(p)+' / 100 = '+f(p/100)+'।'),text('Divide by 100 to obtain the signed multiplier.','চিহ্নসহ গুণক পেতে ১০০ দিয়ে ভাগ করুন।'),text('Multiplier: '+f(p/100)+'.','গুণক: '+f(p/100)+'।')),
      step(text(f(p/100)+' × '+f(n)+' = '+f(share)+'.',f(p/100)+' × '+f(n)+' = '+f(share)+'।'),text('Apply that share to the original total.','মূল মোট পরিমাণে সেই অংশ প্রয়োগ করুন।'),text('Percentage amount: '+f(share)+'.','শতকরার পরিমাণ: '+f(share)+'।')),
      step(text(model.equation,model.equation),text(kind==='of'?'Report the percentage amount.':kind==='increase'?'Add the signed percentage amount to the original.':'Subtract the signed percentage amount from the original.',kind==='of'?'শতকরার পরিমাণটি দেখান।':kind==='increase'?'মূল মানের সঙ্গে চিহ্নসহ পরিবর্তন যোগ করুন।':'মূল মান থেকে চিহ্নসহ পরিবর্তন বিয়োগ করুন।'),text(kind==='of'?'Answer: '+f(result)+'.':'Original '+f(n)+', signed change '+f(change)+', new value '+f(result)+'.',kind==='of'?'উত্তর: '+f(result)+'।':'মূল '+f(n)+', চিহ্নসহ পরিবর্তন '+f(change)+', নতুন মান '+f(result)+'।'))];
    return model;
  }
  let model=null,player=null,host=null,refs=null,width=500;
  const ns='http://www.w3.org/2000/svg';
  function node(tag,attrs,parent){const el=document.createElementNS(ns,tag);attrsTo(el,attrs);parent.append(el);return el;}
  function attrsTo(el,attrs){for(const [key,value] of Object.entries(attrs))if(el.getAttribute(key)!==String(value))el.setAttribute(key,value);}
  function write(el,value){if(el.textContent!==String(value))el.textContent=value;}
  function initialize(){
    host=document.createElement('div');host.id='meaningful-lesson';
    const svg=node('svg',{id:'lesson-svg',role:'img','aria-label':'Arithmetic and percentage lesson'},host);
    const defs=node('defs',{},svg),marker=node('marker',{id:'lesson-arrow',markerWidth:8,markerHeight:8,refX:7,refY:4,orient:'auto-start-reverse'},defs);node('path',{d:'M0 0L8 4L0 8Z',class:'lesson-arrow-head'},marker);
    const lineGroup=node('g',{},svg),axis=node('line',{},lineGroup),ticks=Array.from({length:7},()=>({line:node('line',{},lineGroup),label:node('text',{'text-anchor':'middle'},lineGroup)})),arrow=node('path',{'marker-end':'url(#lesson-arrow)',fill:'none',class:'lesson-travel'},lineGroup),start=node('circle',{r:5,class:'lesson-start'},lineGroup),dot=node('circle',{r:7,class:'lesson-dot'},lineGroup),dotLabel=node('text',{'text-anchor':'middle'},lineGroup),startLabel=node('text',{'text-anchor':'middle'},lineGroup);
    const area=node('g',{},svg),areaRect=node('rect',{rx:8,class:'lesson-area'},area),areaTop=node('text',{'text-anchor':'middle'},area),areaSide=node('text',{'text-anchor':'middle'},area),areaSign=node('text',{'text-anchor':'middle'},area);
    const distribution=node('g',{},svg),recipients=Array.from({length:12},()=>({rect:node('rect',{rx:6},distribution),label:node('text',{'text-anchor':'middle'},distribution)})),dots=Array.from({length:100},()=>node('circle',{r:3.5},distribution)),remainder=node('text',{'text-anchor':'middle'},distribution);
    const bars=node('g',{},svg),barRows=Array.from({length:3},()=>({track:node('rect',{height:20,rx:4,class:'lesson-bar-target',fill:'none'},bars),rect:node('rect',{height:20,rx:4},bars),label:node('text',{},bars)}));
    const cells=document.createElement('div');cells.id='lesson-cells';cells.className='blocks';const blocks=Array.from({length:100},()=>{const cell=document.createElement('span');cells.append(cell);return cell;});host.append(cells);
    const note=document.createElement('p');note.id='lesson-model-note';note.className='visual-note';host.append(note);
    refs={svg,lineGroup,axis,ticks,arrow,start,dot,dotLabel,startLabel,area,areaRect,areaTop,areaSide,areaSign,distribution,recipients,dots,remainder,bars,barRows,cells,blocks,note};
    const controls=document.createElement('div');controls.id='lesson-controls';document.querySelector('.explanation').append(controls);
    player=new A.Player({duration:1400,render:paint});A.controls(controls,player,{prefix:'lesson'});
    const detail=document.createElement('dl');detail.id='lesson-detail';detail.className='step-detail';document.querySelector('.explanation').append(detail);
    new ResizeObserver(()=>{if(host.isConnected){width=Math.max(245,Math.min(680,svg.clientWidth));paint(player.position);}}).observe(svg);
    document.getElementById('language-toggle').addEventListener('click',()=>queueMicrotask(()=>{if(model){renderSteps();paint(player.position);}}));
  }
  function visible(el,yes){el.style.display=yes?'':'none';}
  function linePaint(position){
    const {a,b,op,result}=model,division=op==='/',from=division?0:a,to=result,scale=Math.max(Math.abs(from),Math.abs(to))||1,lo=Math.min(0,from/scale,to/scale)-.15,hi=Math.max(0,from/scale,to/scale)+.15;
    const px=n=>30+(n/scale-lo)/(hi-lo)*(width-60),travel=Math.max(0,Math.min(1,position-1)),current=from*(1-travel)+to*travel,y=160;
    attrsTo(refs.axis,{x1:30,y1:y,x2:width-30,y2:y});
    const raw=(hi-lo)/6*scale,power=10**Math.floor(Math.log10(raw)),base=raw/power,increment=power>0&&Number.isFinite(power)?(base<=1?1:base<=2?2:base<=5?5:10)*power/scale:(hi-lo)/6,first=Math.ceil(lo/increment)*increment;
    refs.ticks.forEach((tick,i)=>{const normalized=first+increment*i,n=normalized*scale,x=30+(normalized-lo)/(hi-lo)*(width-60),show=normalized<=hi;visible(tick.line,show);visible(tick.label,show);attrsTo(tick.line,{x1:x,y1:y-5,x2:x,y2:y+5});attrsTo(tick.label,{x,y:y+29});write(tick.label,Number.isFinite(n)?Number(n.toPrecision(3)):'');});
    attrsTo(refs.start,{cx:px(from),cy:y});attrsTo(refs.dot,{cx:px(current),cy:y});attrsTo(refs.arrow,{d:'M'+px(from)+' '+(y-35)+' H'+px(current)});
    visible(refs.arrow,travel>0&&from!==to);
    attrsTo(refs.startLabel,{x:px(from),y:y+58});write(refs.startLabel,pick(text('Start ','শুরু '))+f(from));
    attrsTo(refs.dotLabel,{x:Math.max(45,Math.min(width-45,px(current))),y:y-60});write(refs.dotLabel,pick(text('Value ','মান '))+f(current));
    write(refs.note,pick(text(division?'Scaled quotient model: b × quotient = a. No fractional recipient groups are implied.':'Adaptive labeled number line. Tick spacing is scaled; the signed arrow indicates the actual direction.',division?'স্কেল করা ভাগফলের মডেল: b × ভাগফল = a। দশমিক সংখ্যক ভাগগ্রহীতা বোঝানো হয়নি।':'মান অনুযায়ী স্কেল করা সংখ্যারেখা। চিহ্নযুক্ত তীর প্রকৃত চলার দিক দেখায়।')));
  }
  function paint(position=0){
    if(!model||!refs||!host.isConnected)return;
    const height=model.type==='percentage'?245:(model.op==='+'||model.op==='-'?250:300);attrsTo(refs.svg,{viewBox:'0 0 '+width+' '+height});refs.svg.style.height=height+'px';
    const isPercentage=model.type==='percentage',isLine=!isPercentage&&(model.op==='+'||model.op==='-'||model.op==='/'&&!model.distribution),grid=!isPercentage&&model.grid,isArea=!isPercentage&&model.op==='*'&&!grid,isDistribution=!isPercentage&&model.distribution;
    visible(refs.lineGroup,isLine);visible(refs.area,isArea);visible(refs.distribution,isDistribution);visible(refs.bars,isPercentage);visible(refs.cells,isPercentage||grid);visible(refs.svg,!grid);
    const index=Math.min(model.steps.length-1,Math.floor(position+1e-8));
    [...$('steps').children].forEach((li,i)=>{li.classList.toggle('current-step',i===index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    const current=model.steps[index],detail=$('lesson-detail');
    ['what','why','changed'].forEach((key,i)=>{const dt=detail.children[i*2],dd=detail.children[i*2+1];if(dt){write(dt,pick([text('What we do','কী করছি'),text('Why','কেন করছি'),text('What changed','কী বদলাল')][i]));write(dd,pick(current[key]));}});
    if(isLine)linePaint(position);
    if(grid){
      const {a,b,result}=model,longest=Math.max(a,b),gap=Math.min(5,50/longest),cell=Math.min(30,(235-gap*(longest-1))/longest);refs.cells.style.cssText='width:'+Math.min(235,b*cell+(b-1)*gap)+'px;gap:'+gap+'px;grid-template-columns:repeat('+b+',minmax(0,1fr))';
      const revealed=Math.min(result,Math.max(b,(position/2)*result));refs.blocks.forEach((block,i)=>{block.className=i<result?'block '+(i<revealed?'selected':'empty'):'lesson-unused';block.style.display=i<result?'':'none';block.style.background='';block.dataset.row=Math.floor(i/b)+1;});
      write(refs.note,pick(text(f(a)+' equal rows × '+f(b)+' columns = '+f(result)+' blocks. Each row is one group.',f(a)+'টি সমান সারি × '+f(b)+' কলাম = '+f(result)+' ঘর। প্রতি সারি একটি দল।')));
    }
    if(isArea){
      const {a,b,result}=model,amount=Math.min(1,Math.max(.05,position/2)),scale=Math.max(Math.abs(a),Math.abs(b))||1,unit=Math.min(width-80,160),areaWidth=Math.abs(a)/scale*unit,areaHeight=Math.abs(b)/scale*unit;
      attrsTo(refs.areaRect,{x:(width-areaWidth)/2,y:65,width:areaWidth,height:areaHeight*amount});attrsTo(refs.areaTop,{x:width/2,y:45});write(refs.areaTop,'|a| = '+f(Math.abs(a)));attrsTo(refs.areaSide,{x:width/2,y:245});write(refs.areaSide,'|b| = '+f(Math.abs(b)));attrsTo(refs.areaSign,{x:width/2,y:280});write(refs.areaSign,(result<0?'−':'+')+' |a × b| = '+f(result));write(refs.note,pick(text('Scaled area model; drawn lengths are schematic. Labeled dimensions and sign determine the product.','স্কেল করা ক্ষেত্রফলের মডেল; আঁকা দৈর্ঘ্য প্রতীকী। লেখা মাপ ও চিহ্ন গুণফল নির্ধারণ করে।')));
    }
    if(isDistribution){
      const {a,b,quotient:q,remainder:r}=model,columns=Math.min(b,Math.max(1,Math.floor((width-30)/70))),rows=Math.ceil(b/columns),cw=(width-30)/columns,rh=215/rows,limit=Math.round(Math.min(1,Math.max(0,position/2))*a);
      refs.recipients.forEach((g,i)=>{visible(g.rect,i<b);visible(g.label,i<b);if(i>=b)return;const x=15+(i%columns)*cw,y=15+Math.floor(i/columns)*rh;attrsTo(g.rect,{x:x+3,y:y+20,width:cw-8,height:rh-27});attrsTo(g.label,{x:x+cw/2,y:y+14});write(g.label,pick(text('Group ','দল '))+(i+1));});
      refs.dots.forEach((dot,i)=>{visible(dot,i<a&&i<limit);if(i>=a)return;const remaining=i>=q*b,group=i%b,within=Math.floor(i/b),ncols=Math.max(1,Math.ceil(Math.sqrt(q))),x=remaining?30+(i-q*b)*12:15+(group%columns)*cw+12+(within%ncols)*(cw-28)/ncols,y=remaining?255:15+Math.floor(group/columns)*rh+32+Math.floor(within/ncols)*(rh-42)/Math.max(1,Math.ceil(q/ncols));attrsTo(dot,{cx:x,cy:y,class:remaining?'lesson-remainder':'lesson-share'});});
      attrsTo(refs.remainder,{x:width/2,y:288});write(refs.remainder,pick(text('Each: ','প্রতি দলে: '))+q+pick(text(' · remainder: ',' · ভাগশেষ: '))+r);write(refs.note,pick(text(a+' items → '+b+' equal groups, '+q+' each and '+r+' left over. Numerical quotient = '+f(model.result)+'.',a+'টি বস্তু → '+b+'টি সমান দল, প্রতি দলে '+q+' এবং অবশিষ্ট '+r+'। সংখ্যাগত ভাগফল = '+f(model.result)+'।')));
    }
    if(isPercentage){
      const {p,n,share,change,result,kind}=model,absolute=Math.abs(p),ordinary=absolute<=Number.MAX_SAFE_INTEGER,wholes=ordinary?Math.floor(absolute/100):0,part=ordinary?absolute-wholes*100:0;
      const gridAmount=part===0&&absolute>0?100:part;
      visible(refs.cells,ordinary);refs.cells.dataset.wholes=String(wholes);refs.cells.dataset.sign=p<0?'negative':'positive';refs.cells.dataset.percentage=String(p);
      refs.cells.style.cssText='width:235px;gap:5px;grid-template-columns:repeat(10,minmax(0,1fr));'+(ordinary?'':'display:none;');refs.blocks.forEach((cell,i)=>{const amount=Math.max(0,Math.min(1,gridAmount-i));cell.className='block '+(amount===1?'selected':amount===0?'empty':'partial');cell.style.display='';cell.style.background=amount>0&&amount<1?'linear-gradient(to right,var(--green) '+amount*100+'%,var(--paper) '+amount*100+'%)':'';cell.dataset.fill=String(amount);});
      const values=[n,kind==='of'?share:change,result],max=Math.max(...values.map(Math.abs))||1,labels=[pick(text('Original','মূল মান')),pick(text(kind==='of'?'Percentage amount':'Signed change',kind==='of'?'শতকরার অংশ':'চিহ্নসহ পরিবর্তন')),pick(text('Answer','উত্তর'))];
      refs.barRows.forEach((row,i)=>{const factor=i===0?1:i===1?Math.min(1,Math.max(0,position-1)):Math.min(1,Math.max(0,position-2)),v=values[i]*factor,len=Math.abs(v/max)*(width-80)/2,full=Math.abs(values[i]/max)*(width-80)/2;attrsTo(row.track,{x:values[i]<0?width/2-full:width/2,y:50+i*75,width:full});attrsTo(row.rect,{x:v<0?width/2-len:width/2,y:50+i*75,width:len,class:v<0?'lesson-bar negative':'lesson-bar positive'});attrsTo(row.label,{x:18,y:35+i*75});write(row.label,labels[i]+': '+f(values[i]));});
      write(refs.note,pick(ordinary?text((p<0?'Negative share: −(':'')+wholes+' full 100% whole(s) + '+f(part)+'% of one whole'+(p<0?')':'')+'. Each cell = 1%; partial cells keep decimal precision.'+(part===0&&absolute>0?' The grid shows one representative full whole.':''),(p<0?'ঋণাত্মক অংশ: −(':'')+wholes+'টি পূর্ণ ১০০% + একটি পূর্ণের '+f(part)+'%'+(p<0?')':'')+'। প্রতি ঘর ১%; দশমিক অংশ আংশিক ঘরে দেখানো।'+(part===0&&absolute>0?' গ্রিডে উদাহরণ হিসেবে একটি পূর্ণ অংশ দেখানো।':'')):text('Magnitude exceeds reliable whole-count labeling. Signed multiplier = '+f(p/100)+'. Bars use a labeled common scale; no whole-count grid is shown.','নির্ভরযোগ্য পূর্ণ অংশ গুনে দেখানোর সীমার বাইরে। চিহ্নসহ গুণক = '+f(p/100)+'। বারগুলো একই স্কেলে; পূর্ণ অংশ গোনার গ্রিড দেখানো হয়নি।')));
    }
  }
  function renderSteps(){
    $('steps').replaceChildren(...model.steps.map(frame=>{const li=document.createElement('li');li.textContent=pick(frame.what);return li;}));
    const detail=$('lesson-detail');detail.replaceChildren();for(let i=0;i<3;i++)detail.append(document.createElement('dt'),document.createElement('dd'));
  }
  function load(next){if(!host)initialize();model=next;$('visual').replaceChildren(host);host.style.width='100%';$('lesson-controls').hidden=$('lesson-detail').hidden=false;renderSteps();player.configure(model.steps.length,0);window.FormaNotation.render($('input-math-preview'),model.ast);write($('hint'),pick(text(model.type==='percentage'?'One whole = 100%. Dashed bars show targets; solid bars reveal amounts on a common scale.':model.op==='+'||model.op==='-'?'Follow the signed displacement on the number line.':model.op==='*'?'Count equal groups or use the labeled, scaled area model.':'Distribute equally; keep any integer remainder separate.',model.type==='percentage'?'একটি পূর্ণ অংশ = ১০০%। একই স্কেলে ড্যাশ বার লক্ষ্যমান, ভরা বার প্রকাশিত পরিমাণ।':model.op==='+'||model.op==='-'?'সংখ্যারেখায় চিহ্নযুক্ত সরণ অনুসরণ করুন।':model.op==='*'?'সমান দল গুনুন অথবা চিহ্নিত ও স্কেল করা ক্ষেত্রফলের মডেল দেখুন।':'সমানভাবে বণ্টন করুন; পূর্ণসংখ্যার ভাগশেষ আলাদা রাখুন।')));return model;}
  function hide(){if(player)player.cancel();if($('lesson-controls'))$('lesson-controls').hidden=$('lesson-detail').hidden=true;model=null;}
  window.FormaLessons={arithmetic,percentage,load,hide,get player(){return player;},get model(){return model;}};
})();
