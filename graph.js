(function(){
  'use strict';
  const $=id=>document.getElementById(id),M=window.FormaMath;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const state={active:false,valid:true,playing:false,progress:1,speed:1,raf:null,last:null,
    current:[1,0,0],target:[1,0,0],from:[1,0,0],bounds:[-5,40],fromBounds:[-5,40],targetBounds:[-5,40],morphStart:null,width:700,height:430};
  Object.assign(state,{custom:false,trees:[],expressions:[],view:[-6,6],manual:false});
  const ns='http://www.w3.org/2000/svg';
  const make=(tag,attrs,parent)=>{const el=document.createElementNS(ns,tag);attrsTo(el,attrs);parent.append(el);return el;};
  const attrsTo=(el,attrs)=>{for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);};
  const short=n=>Number(n.toPrecision(5)).toString();
  const value=(coeff,x)=>(coeff[0]*x+coeff[1])*x+coeff[2];
  const fmtEquation=([a,b,c])=>'y = '+M.format(a)+'x² '+(b<0?'− '+M.format(-b):'+ '+M.format(b))+'x '+(c<0?'− '+M.format(-c):'+ '+M.format(c));
  const tickStep=range=>{const raw=range/7,power=10**Math.floor(Math.log10(raw)),base=raw/power;return (base<=1?1:base<=2?2:base<=5?5:10)*power;};
  function boundsFor(coeff){
    const values=[0,value(coeff,-6),value(coeff,6)];
    const vx=coeff[0]===0?Infinity:-coeff[1]/(2*coeff[0]);
    if(vx>=-6&&vx<=6)values.push(value(coeff,vx));
    // Keep a baseline window and a fixed margin. Scaling the window exactly
    // with a would make x² and 2x² look identical despite different curvature.
    return [Math.min(-10,Math.min(...values)-8),Math.max(10,Math.max(...values)+8)];
  }
  const xTicks=[],yTicks=[];
  for(let i=0;i<7;i++)xTicks.push({line:make('line',{},$('graph-grid')),text:make('text',{'text-anchor':'middle'},$('graph-ticks'))});
  for(let i=0;i<12;i++)yTicks.push({line:make('line',{},$('graph-grid')),text:make('text',{'text-anchor':'end'},$('graph-ticks'))});
  const xAxis=make('line',{},$('graph-axes')),yAxis=make('line',{},$('graph-axes'));
  const xName=make('text',{},$('graph-axes')),yName=make('text',{},$('graph-axes'));xName.textContent='x';yName.textContent='y';
  const vertex={point:make('circle',{r:5,class:'graph-vertex'},$('graph-markers')),label:make('text',{},$('graph-marker-labels'))};
  const roots=[0,1].map(()=>({point:make('circle',{r:5,class:'graph-root'},$('graph-markers')),label:make('text',{},$('graph-marker-labels'))}));
  const extraPaths=[1,2].map((_,i)=>make('path',{fill:'none',stroke:['#ac6c35','#6878ab'][i],'stroke-width':2.5},$('graph-curve').parentNode));
  const featureLayer=make('g',{},$('graph-markers'));
  const colors=['#2d5843','#ac6c35','#6878ab'];
  const customControls=document.createElement('div');customControls.className='graph-custom-controls';
  customControls.innerHTML=`<label for="graph-family">Function family</label><select id="graph-family"><option value="quadratic">Quadratic · ax² + bx + c</option><option value="linear">Linear · ax + b</option><option value="polynomial">Polynomial · ax³ + bx + c</option><option value="sin">Sine · a sin(bx) + c</option><option value="cos">Cosine · a cos(bx) + c</option><option value="tan">Tangent · a tan(bx) + c</option><option value="exp">Exponential · a exp(bx) + c</option><option value="ln">Logarithm · a ln(x) + c</option><option value="sqrt">Square root · a sqrt(x) + c</option><option value="abs">Absolute · a abs(x − b) + c</option><option value="custom">Custom / compare</option></select><label for="graph-functions">Custom y = f(x) · one per line, up to 3</label><textarea id="graph-functions" rows="3" spellcheck="false">a*x^2+b*x+c</textarea><button id="graph-plot" type="button">Plot functions</button><p class="lab-note">Use x, a, b, c, pi, e. Trigonometric graphs use radians. Parameters apply to every function.</p>`;
  $('graph-coefficients').before(customControls);
  const viewControls=document.createElement('div');viewControls.className='graph-view-controls';
  viewControls.innerHTML='<button id="graph-zoom-in" aria-label="Zoom in">+</button><button id="graph-zoom-out" aria-label="Zoom out">−</button><button id="graph-left" aria-label="Pan left">←</button><button id="graph-right" aria-label="Pan right">→</button><button id="graph-up" aria-label="Pan up">↑</button><button id="graph-down" aria-label="Pan down">↓</button><button id="graph-reset">Reset view</button>';
  $('graph-svg').before(viewControls);
  const legend=document.createElement('div');legend.id='graph-legend';legend.className='graph-legend';$('graph-equation').after(legend);
  const E=window.FormaEngine;
  const safeValue=(tree,x,coeff)=>{try{return E.evaluate(tree,{x,a:coeff[0],b:coeff[1],c:coeff[2]});}catch{return NaN;}};
  function sampledRoots(fn){
    const found=[],[min,max]=state.view,n=400,add=x=>{if(found.every(v=>Math.abs(v-x)>(max-min)/1000))found.push(x);};
    let x0=min,y0=fn(x0);
    for(let i=1;i<=n;i++){
      const x1=min+(max-min)*i/n,y1=fn(x1);
      if(Number.isFinite(y0)&&Math.abs(y0)<1e-8)add(x0);
      if(Number.isFinite(y0)&&Number.isFinite(y1)&&y0*y1<0){
        let l=x0,r=x1,fl=y0,m,fm;
        for(let k=0;k<45;k++){m=(l+r)/2;fm=fn(m);if(!Number.isFinite(fm))break;if(fl*fm<=0)r=m;else{l=m;fl=fm;}}
        m=(l+r)/2;fm=fn(m);if(Number.isFinite(fm)&&Math.abs(fm)<1e-6)add(m);
      }
      x0=x1;y0=y1;
    }
    if(Number.isFinite(y0)&&Math.abs(y0)<1e-8)add(max);
    return found.slice(0,20);
  }
  function customSummary(){
    featureLayer.replaceChildren();legend.replaceChildren();
    const parts=[];state.features=[];
    state.expressions.forEach((expression,i)=>{const item=document.createElement('span');item.style.color=colors[i];item.textContent='● '+expression;legend.append(item);});
    const fn=x=>safeValue(state.trees[0],x,state.target),rootList=sampledRoots(fn);
    const h=(state.view[1]-state.view[0])*1e-5,df=x=>(fn(x+h)-fn(x-h))/(2*h);
    const critical=sampledRoots(df).filter(x=>{
      const left=df(x-h*2),right=df(x+h*2);return Number.isFinite(fn(x))&&left*right<0;
    });
    critical.forEach(x=>{if(Math.abs(fn(x))<1e-6&&rootList.every(v=>Math.abs(v-x)>h))rootList.push(x);});
    parts.push('Sampled roots ≈ '+(rootList.length?rootList.map(short).join(', '):'none detected'));
    parts.push('Local extrema ≈ '+(critical.length?critical.map(x=>'('+short(x)+', '+short(fn(x))+')').join(', '):'none detected'));
    rootList.forEach(x=>state.features.push({x,y:0,label:'root ≈ '+short(x)}));
    critical.forEach(x=>state.features.push({x,y:fn(x),label:'extremum ≈ '+short(x)}));
    for(let i=1;i<state.trees.length;i++){
      const crosses=sampledRoots(x=>fn(x)-safeValue(state.trees[i],x,state.target));
      parts.push('f1 ∩ f'+(i+1)+' ≈ '+(crosses.length?crosses.map(x=>'('+short(x)+', '+short(fn(x))+')').join(', '):'none detected'));
      crosses.forEach(x=>state.features.push({x,y:fn(x),label:'intersection'}));
    }
    state.features.slice(0,30).forEach(p=>{p.node=make('circle',{r:4,fill:'#fff8c4',stroke:'#68793d'},featureLayer);const title=make('title',{},p.node);title.textContent=p.label;});
    $('graph-features').textContent=parts.join(' | ')+'. Numerical search in the visible x range; not an exhaustive symbolic solution.';
    $('graph-equation').textContent='y = '+state.expressions[0];
    $('graph-svg-desc').textContent=state.expressions.join('; ')+'. '+$('graph-features').textContent;
    FormaFeedback.publish('graph',$('graph-equation').textContent,'approximate');
  }
  function paintCustom({L,R,T,B,px,py}){
    featureLayer.style.display=state.morphStart!==null?'none':'';
    [vertex,...roots].forEach(item=>{item.point.style.display=item.label.style.display='none';});
    const [xmin,xmax]=state.view,end=xmin+(xmax-xmin)*state.progress,n=Math.max(1,Math.ceil(600*state.progress));
    const paths=[$('graph-curve'),...extraPaths];
    paths.forEach((path,index)=>{
      path.style.display=index<state.trees.length?'':'none';if(index>=state.trees.length)return;
      const tree=state.trees[index];let d='',previous=null;
      for(let i=0;i<=n;i++){
        const x=xmin+(end-xmin)*i/n,y=safeValue(tree,x,state.current),screen=py(y);
        if(!Number.isFinite(screen)||Math.abs(screen)>1e7){previous=null;continue;}
        let continuous=previous!==null;
        if(previous){
          const middle=py(safeValue(tree,(x+previous.x)/2,state.current));
          if(!Number.isFinite(middle)||Math.abs(screen-previous.screen)>2*(B-T)||Math.abs(middle-(screen+previous.screen)/2)>(B-T)*.3)continuous=false;
          if(continuous)try{window.FormaLabMath.interval(tree,previous.x,x,{a:state.current[0],b:state.current[1],c:state.current[2]});}catch{continuous=false;}
        }
        d+=(continuous?'L':'M')+px(x).toFixed(3)+' '+screen.toFixed(3);previous={x,screen};
      }
      path.setAttribute('d',d);
    });
    const y=safeValue(state.trees[0],end,state.current),visible=Number.isFinite(y)&&py(y)>=T&&py(y)<=B;
    $('graph-point').style.display=$('graph-guides').style.display=visible?'':'none';
    if(visible){attrsTo($('graph-point'),{cx:px(end),cy:py(y)});$('graph-guides').setAttribute('d','M'+px(end)+' '+py(0)+'V'+py(y)+'H'+px(0));}
    $('graph-coordinates').textContent=Number.isFinite(y)?'('+short(end)+', '+short(y)+')'+(visible?'':' · outside view'):'('+short(end)+', undefined)';
    $('graph-progress').textContent=state.progress===1?'Complete · 100%':Math.round(state.progress*100)+'% drawn';
    (state.features||[]).forEach(p=>{if(!p.node)return;attrsTo(p.node,{cx:px(p.x),cy:py(p.y)});});
  }
  function applyCustom(){
    stop();try{
      const expressions=$('graph-functions').value.split(/\n/).map(s=>s.trim()).filter(Boolean);
      if(!expressions.length||expressions.length>3)throw Error('Provide 1–3 functions, one per line.');
      const trees=expressions.map(E.parse);
      function validate(n){if(n.type==='variable'&&!['x','a','b','c','pi','e'].includes(n.name))throw Error('Only x, a, b, c, pi and e are allowed.');if(n.type==='call'&&['fact','npr','ncr'].includes(n.name))throw Error('Discrete factorial/permutation/combination functions are not supported as continuous graphs.');if(n.left)validate(n.left);if(n.right)validate(n.right);if(n.args)n.args.forEach(validate);}
      trees.forEach(validate);state.custom=true;state.trees=trees;state.expressions=expressions;state.bounds=[-10,10];state.targetBounds=[...state.bounds];state.valid=true;state.progress=1;state.morphStart=null;
      $('graph-svg').classList.remove('graph-invalid');$('graph-error').textContent='';customSummary();graphPlayer.configure(101,100);paint();syncButtons();
    }catch(error){state.valid=false;$('graph-error').textContent=error.message;$('graph-svg').classList.add('graph-invalid');FormaFeedback.error('graph-functions',error.message);FormaFeedback.invalid('graph',error.message);graphPlayer.cancel();syncButtons();}
  }
  $('graph-plot').addEventListener('click',()=>{$('graph-family').value='custom';applyCustom();});
  $('graph-functions').addEventListener('input',()=>{stop();state.valid=false;syncButtons();$('graph-error').textContent='Apply the edited expressions with Plot functions.';});
  $('graph-family').addEventListener('change',()=>{
    const family=$('graph-family').value;
    if(family==='quadratic'){
      stop();state.custom=false;state.manual=false;state.view=[-6,6];extraPaths.forEach(p=>p.style.display='none');featureLayer.replaceChildren();legend.replaceChildren();$('graph-point').style.display=$('graph-guides').style.display='';updateCoefficients();return;
    }
    if(family==='custom'){stop();return;}
    const presets={linear:'a*x+b',polynomial:'a*x^3+b*x+c',sin:'a*sin(b*x)+c',cos:'a*cos(b*x)+c',tan:'a*tan(b*x)+c',exp:'a*exp(b*x)+c',ln:'a*ln(x)+c',sqrt:'a*sqrt(x)+c',abs:'a*abs(x-b)+c'};
    if(['sin','cos','tan','exp'].includes(family)&&state.target[1]===0){$('graph-b').value=1;$('graph-b-slider').value=1;state.target[1]=state.current[1]=1;}
    $('graph-functions').value=presets[family];applyCustom();
  });
  function moveView(zoom=1,dx=0,dy=0){
    stop();state.morphStart=null;state.manual=true;
    const [l,r]=state.view,[lo,hi]=state.bounds,w=(r-l)*zoom,h=(hi-lo)*zoom;
    if(w<.0001||w>1e6||h<.0001||h>1e12)return;
    const mid=(l+r)/2+dx*(r-l),ym=(lo+hi)/2+dy*(hi-lo);
    state.view=[mid-w/2,mid+w/2];state.bounds=[ym-h/2,ym+h/2];state.targetBounds=[...state.bounds];
    if(state.custom)customSummary();paint();
  }
  for(const [id,args] of Object.entries({'zoom-in':[.8],'zoom-out':[1.25],left:[1,-.15,0],right:[1,.15,0],up:[1,0,.15],down:[1,0,-.15]}))$('graph-'+id).addEventListener('click',()=>moveView(...args));
  $('graph-reset').addEventListener('click',()=>{stop();state.view=[-6,6];state.manual=false;state.bounds=state.custom?[-10,10]:boundsFor(state.target);state.targetBounds=[...state.bounds];state.progress=1;if(state.custom)customSummary();paint();});
  let pointer=null;
  $('graph-svg').addEventListener('pointerdown',event=>{if(event.defaultPrevented||event.button!==0)return;pointer={x:event.clientX,y:event.clientY,id:event.pointerId};try{$('graph-svg').setPointerCapture(event.pointerId);}catch{}});
  $('graph-svg').addEventListener('pointermove',event=>{if(!pointer)return;const box=$('graph-svg').getBoundingClientRect();moveView(1,(pointer.x-event.clientX)/box.width,(event.clientY-pointer.y)/box.height);pointer={x:event.clientX,y:event.clientY};});
  for(const name of ['pointerup','pointercancel'])$('graph-svg').addEventListener(name,()=>pointer=null);

  function summary(coeff){
    const info=M.quadratic(...coeff),parts=[];
    if(info.vertex)parts.push('Vertex ('+short(info.vertex.x)+', '+short(info.vertex.y)+')'+(Math.abs(info.vertex.x)>6?' · outside x window':''));
    else parts.push(info.kind==='linear'?'Linear function · no vertex':'Constant function · no unique vertex');
    parts.push(info.allRoots?'Every x is a root (y = 0)':info.roots.length?'Real roots: '+info.roots.map(short).join(', ')+(info.roots.some(x=>Math.abs(x)>6)?' · some outside x window':''):'No real roots');
    $('graph-features').textContent=parts.join('  |  ');
    $('graph-equation').textContent=fmtEquation(coeff);
    $('graph-svg-desc').textContent=fmtEquation(coeff)+'. '+parts.join('. ')+'. x ranges from −6 to 6. The y-axis uses an automatic scale.';
    FormaFeedback.publish('graph',$('graph-equation').textContent,'approximate');
  }
  function paint(){
    const {width:W,height:H}=state,L=W<400?44:56,R=W-22,T=24,B=H-35;
    const [low,high]=state.bounds;
    const [xmin,xmax]=state.view;const px=x=>L+(x-xmin)/(xmax-xmin)*(R-L),py=y=>B-(y-low)/(high-low)*(B-T);
    attrsTo($('graph-clip-rect'),{x:L,y:T,width:R-L,height:B-T});
    attrsTo(xAxis,{x1:L,y1:py(0),x2:R,y2:py(0)});attrsTo(yAxis,{x1:px(0),y1:T,x2:px(0),y2:B});
    attrsTo(xName,{x:R+9,y:py(0)+4});attrsTo(yName,{x:px(0)+9,y:T-8});
    attrsTo($('graph-origin'),{x:px(0)+7,y:py(0)+15});
    xTicks.forEach((tick,i)=>{
      const x=xmin+i*(xmax-xmin)/6;
      attrsTo(tick.line,{x1:px(x),y1:T,x2:px(x),y2:B});
      attrsTo(tick.text,{x:px(x),y:B+20});tick.text.textContent=short(x);
    });
    const step=tickStep(high-low),first=Math.ceil(low/step)*step;
    yTicks.forEach((tick,i)=>{
      const y=first+i*step,visible=y<=high;
      tick.line.hidden=!visible;tick.text.hidden=!visible;
      tick.line.style.display=tick.text.style.display=visible?'':'none';
      if(visible){attrsTo(tick.line,{x1:L,y1:py(y),x2:R,y2:py(y)});attrsTo(tick.text,{x:L-8,y:py(y)+4});tick.text.textContent=short(y);}
    });
    const context={L,R,T,B,px,py,xmin,xmax,low,high,coeff:[...state.current],custom:state.custom,valid:state.valid};
    if(state.custom){paintCustom({L,R,T,B,px,py});window.FormaGraphTeaching?.paint(context);return;}
    const end=xmin+(xmax-xmin)*state.progress,segments=Math.max(1,Math.ceil(240*state.progress));
    let path='';
    for(let i=0;i<=segments;i++){
      const x=xmin+(end-xmin)*i/segments;
      path+=(i?' L':'M')+px(x).toFixed(3)+' '+py(value(state.current,x)).toFixed(3);
    }
    $('graph-curve').setAttribute('d',path);
    const y=value(state.current,end),cx=px(end),cy=py(y);
    attrsTo($('graph-point'),{cx,cy});
    $('graph-guides').setAttribute('d','M'+cx+' '+py(0)+'V'+cy+'H'+px(0));
    $('graph-coordinates').textContent='('+short(end)+', '+short(y)+')';
    $('graph-progress').textContent=state.progress===1?'Complete · 100%':Math.round(state.progress*100)+'% drawn';
    const info=M.quadratic(...state.current);
    function marker(item,x,y,label,dy){
      const visible=Number.isFinite(x)&&x>=xmin&&x<=xmax&&y>=low&&y<=high;
      item.point.style.display=item.label.style.display=visible?'':'none';
      if(!visible)return;
      attrsTo(item.point,{cx:px(x),cy:py(y)});
      attrsTo(item.label,{x:Math.max(L+2,Math.min(R-2,px(x))),y:Math.max(T+12,Math.min(B-4,py(y)+dy)),'text-anchor':x>4?'end':x< -4?'start':'middle'});
      item.label.textContent=label;
    }
    marker(vertex,info.vertex?info.vertex.x:Infinity,info.vertex?info.vertex.y:0,'V ('+(info.vertex?short(info.vertex.x)+', '+short(info.vertex.y):'')+')',-13);
    roots.forEach((item,i)=>marker(item,info.roots[i]??Infinity,0,'x = '+short(info.roots[i]??0),28));
    window.FormaGraphTeaching?.paint(context);
  }
  function syncButtons(){
    $('graph-play').textContent=state.playing?'Pause':'Play';
    $('graph-play').setAttribute('aria-pressed',String(state.playing));
    $('graph-play').disabled=!state.valid||motion.matches;
    $('graph-draw').disabled=$('graph-replay').disabled=!state.valid;
    $('graph-speed').disabled=motion.matches;
    $('graph-status').textContent=!state.valid?'Check coefficients':motion.matches?'Reduced motion':state.playing?'Drawing curve':state.progress<1?'Paused':'Ready to explore';
    $('graph-motion-note').textContent=motion.matches?'Reduced motion is on. Draw and Replay show the complete curve instantly.':'Draw from left to right. Pause to inspect any point.';
  }
  function schedule(){if(state.active&&state.raf===null)state.raf=requestAnimationFrame(frame);}
  function frame(now){
    state.raf=null;if(!state.active||!state.valid)return;
    const elapsed=state.last===null?0:Math.min(now-state.last,100);state.last=now;
    if(state.morphStart!==null){
      if(state.morphStart===-1)state.morphStart=now;
      const t=Math.min(1,(now-state.morphStart)/280),ease=t*t*(3-2*t);
      state.current=state.from.map((n,i)=>n+(state.target[i]-n)*ease);
      state.bounds=state.fromBounds.map((n,i)=>n+(state.targetBounds[i]-n)*ease);
      if(t===1)state.morphStart=null;
    }

    paint();
    if(state.morphStart!==null)schedule();else state.last=null;
  }
  function stop(){
    if(typeof graphPlayer!=="undefined")graphPlayer.pause();state.playing=false;state.last=null;
    if(state.raf!==null)cancelAnimationFrame(state.raf);
    state.raf=null;syncButtons();
  }
  function updateCoefficients(options={}){
    stop();
    try{
      const coeff=['a','b','c'].map(name=>{
        const input=$('graph-'+name),n=input.valueAsNumber;
        if(!input.value.trim()||!Number.isFinite(n)||Math.abs(n)>20)throw Error('Use a number between −20 and 20 for every coefficient.');
        return n;
      });
      if(!state.custom)M.quadratic(...coeff);
      state.valid=true;$('graph-error').textContent='';$('graph-svg').classList.remove('graph-invalid');
      ['a','b','c'].forEach((name,i)=>{$('graph-'+name+'-slider').value=coeff[i];FormaFeedback.clear($('graph-'+name));});
      state.from=[...state.current];state.target=coeff;state.fromBounds=[...state.bounds];state.targetBounds=state.custom||state.manual?[...state.bounds]:boundsFor(coeff);
      state.progress=1;graphPlayer.configure(101,100);
      if(state.custom)customSummary();else summary(coeff);
      if(motion.matches||options.instant){state.current=[...coeff];state.bounds=[...state.targetBounds];state.morphStart=null;paint();}
      else{state.morphStart=-1;schedule();}
      syncButtons();
    }catch(e){
      state.valid=false;state.morphStart=null;$('graph-error').textContent=e.message;
      const bad=['a','b','c'].map(name=>$('graph-'+name)).find(input=>!input.value.trim()||!Number.isFinite(input.valueAsNumber)||Math.abs(input.valueAsNumber)>20);if(bad)FormaFeedback.error(bad,e.message);FormaFeedback.invalid('graph',e.message);graphPlayer.cancel();
      $('graph-svg').classList.add('graph-invalid');$('graph-equation').textContent='Update the coefficients to continue.';
      $('graph-features').textContent='';$('graph-coordinates').textContent='—';syncButtons();
    }
    window.FormaGraphTeaching?.changed(options.source||'input');
  }
  const graphPlayer=new FormaAnimation.Player({count:101,duration:60,render:position=>{state.progress=position/100;if(state.active&&state.valid)paint();},state:player=>{state.playing=player.playing;if(player.playing){state.morphStart=null;state.current=[...state.target];}syncButtons();}});
  FormaAnimation.controls(document.querySelector('.graph-playback'),graphPlayer,{prefix:'graph-shared',existing:{play:'graph-play',replay:'graph-replay',speed:'graph-speed',value:'graph-speed-value'},describe:()=>{const bn=document.documentElement.lang==='bn';return [bn?'বাঁ থেকে ডানে ফাংশনের মান অনুসরণ করুন।':'Trace function values from left to right.',bn?'প্রতিটি বৈধ x-এর জন্য y = f(x)। সংজ্ঞায়িত নয় এমন স্থানে রেখা জোড়া হয় না।':'Each valid x maps to y = f(x); undefined intervals are not bridged.',(bn?'বর্তমান বিন্দু: ':'Current point: ')+$('graph-coordinates').textContent];}});
  function draw(){
    if(!state.valid)return;
    stop();state.morphStart=null;state.current=[...state.target];state.bounds=[...state.targetBounds];
    graphPlayer.configure(101,motion.matches?100:0);paint();syncButtons();if(!motion.matches)graphPlayer.play();
  }
  function resize(){
    if(!state.active)return;
    const W=Math.max(240,$('graph-svg').getBoundingClientRect().width);
    state.width=W;state.height=Math.max(310,Math.min(470,W*.68));
    $('graph-svg').setAttribute('viewBox','0 0 '+W+' '+state.height);
    $('graph-svg').style.height=state.height+'px';paint();
  }
  ['a','b','c'].forEach((name,i)=>{
    const label=document.createElement('div');label.className='graph-coefficient';
    label.innerHTML='<label for="graph-'+name+'">'+name+' <span>'+(i===0?'curvature':i===1?'slope & position':'vertical shift')+'</span></label><input id="graph-'+name+'" type="number" min="-20" max="20" step="any" value="'+(i===0?1:0)+'"><input id="graph-'+name+'-slider" aria-label="Coefficient '+name+'" type="range" min="-20" max="20" step="any" value="'+(i===0?1:0)+'">';
    $('graph-coefficients').append(label);
    $('graph-'+name).addEventListener('input',updateCoefficients);
    $('graph-'+name+'-slider').addEventListener('input',()=>{$('graph-'+name).value=$('graph-'+name+'-slider').value;updateCoefficients();});
  });
  $('graph-draw').addEventListener('click',draw);
  $('graph-speed').addEventListener('input',()=>{state.speed=$('graph-speed').valueAsNumber;$('graph-speed-value').textContent=state.speed+'×';});
  motion.addEventListener('change',()=>{
    if(motion.matches){stop();state.current=[...state.target];state.bounds=[...state.targetBounds];state.morphStart=null;state.progress=1;if(state.active)paint();}
    syncButtons();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new ResizeObserver(resize).observe($('graph-svg'));
  window.FormaGraph={
    snapshot(){return {coeff:[...state.target],custom:state.custom,valid:state.valid,trees:[...state.trees],expressions:[...state.expressions],view:[...state.view],bounds:[...state.bounds]};},
    repaint(){if(state.active)paint();},
    applyFunctions(){applyCustom();},
    setViewport(view,bounds){const valid=range=>Array.isArray(range)&&range.length===2&&range.every(Number.isFinite)&&Number.isFinite(range[1]-range[0])&&range[1]>range[0];if(!valid(view)||!valid(bounds)||view[1]-view[0]<.0001||view[1]-view[0]>1e6||bounds[1]-bounds[0]<.0001||bounds[1]-bounds[0]>1e12)throw Error('Invalid graph viewport.');stop();state.morphStart=null;state.current=[...state.target];state.manual=true;state.view=[...view];state.bounds=[...bounds];state.targetBounds=[...bounds];if(state.custom)customSummary();paint();},
    setCoefficients(coeff,{instant=false,keepView=false,source='external'}={}){if(keepView)state.manual=true;['a','b','c'].forEach((name,i)=>{$('graph-'+name).value=coeff[i];});updateCoefficients({instant,source});},
    show(){state.active=true;state.targetBounds=state.custom||state.manual?[...state.bounds]:boundsFor(state.target);state.bounds=[...state.targetBounds];state.current=[...state.target];state.morphStart=null;resize();if(state.valid){if(state.custom)customSummary();else summary(state.target);}graphPlayer.configure(state.valid?101:0,100);syncButtons();},
    pause(){stop();if(state.morphStart!==null){state.morphStart=null;state.current=[...state.target];state.bounds=[...state.targetBounds];if(state.active&&state.valid)paint();}},get player(){return graphPlayer;},
    hide(){stop();state.active=false;state.morphStart=null;state.progress=1;}
  };
})();
