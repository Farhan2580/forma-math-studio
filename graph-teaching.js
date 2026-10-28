(function(){
  'use strict';
  const $=id=>document.getElementById(id),G=FormaGraph,M=FormaMath,svg=$('graph-svg'),ns='http://www.w3.org/2000/svg';
  const bn=()=>document.documentElement.lang==='bn',t=(en,ba)=>bn()?ba:en;
  const num=n=>Number(n.toPrecision(12)).toString(),f=(v,x)=>(v[0]*x+v[1])*x+v[2];
  const equation=v=>`y = ${num(v[0])}x² + (${num(v[1])})x + (${num(v[2])})`;
  const el=(tag,attrs,parent)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
  const reference=el('path',{id:'graph-reference',fill:'none','stroke-dasharray':'9 6','pointer-events':'none'},$('graph-curve').parentNode);
  const highlight=el('path',{id:'graph-teaching-highlight',fill:'none','pointer-events':'none'},$('graph-curve').parentNode);
  // A persistent, generous hit target; SVG group semantics keep the handle keyboard accessible.
  const handle=el('circle',{id:'graph-vertex-handle',r:18,tabindex:0,role:'button','aria-describedby':'graph-vertex-help',fill:'transparent'},$('graph-markers'));
  const panel=document.createElement('section');panel.className='graph-teaching';panel.setAttribute('aria-label','Graph investigation');
  panel.innerHTML=`<div class="graph-compare-actions"><button type="button" id="graph-pin"></button><button type="button" id="graph-unpin"></button><button type="button" id="graph-vertex-reset"></button></div><p id="graph-comparison-legend" class="graph-comparison-legend"></p><p id="graph-vertex-help" class="lab-note"></p><p id="graph-vertex-form" class="graph-vertex-form"></p><p id="graph-drag-feedback" role="status" class="lab-note"></p><details id="graph-predict"><summary id="graph-predict-title"></summary><p id="graph-predict-intro"></p><label for="graph-predict-kind" id="graph-predict-label"></label><select id="graph-predict-kind"><option value="sign"></option><option value="width"></option><option value="shift"></option></select><p id="graph-predict-question"></p><label for="graph-predict-answer" id="graph-answer-label"></label><select id="graph-predict-answer"><option value=""></option><option value="correct"></option><option value="other"></option><option value="same"></option></select><button type="button" id="graph-predict-reveal"></button><p id="graph-predict-feedback" role="status"></p></details><div class="graph-why-actions"><button type="button" id="graph-why-sign"></button><button type="button" id="graph-why-width"></button><button type="button" id="graph-why-shift"></button><button type="button" id="graph-why-clear"></button></div><p id="graph-why-text" role="status"></p><section aria-labelledby="graph-residual-title"><h3 id="graph-residual-title"></h3><div id="graph-root-checks"></div></section>`;
  $('graph-features').after(panel);
  let pinned=null,context=null,drag=null,lesson=null,cache='',lastSignature='',activity=null;
  const controls=['graph-vertex-reset','graph-predict-kind','graph-predict-answer','graph-predict-reveal'];
  function snapshot(){const s=G.snapshot();return {coeff:s.coeff,tree:s.custom?s.trees[0]:null,expression:s.custom?s.expressions[0]:equation(s.coeff)};}
  function pin(){if(!G.snapshot().valid)return;pinned=snapshot();cache='';render();G.repaint();}
  $('graph-pin').onclick=pin;
  $('graph-unpin').onclick=()=>{pinned=null;cache='';render();G.repaint();};
  function finish(){if(drag){try{handle.releasePointerCapture(drag.id);}catch{}drag=null;handle.classList.remove('dragging');}}
  function moveVertex(h,k){
    const s=G.snapshot(),a=s.coeff[0];if(s.custom||!s.valid||a===0)return;
    // Project the requested vertex onto the existing coefficient limits, without
    // independently clipping b/c (which would move the requested vertex again).
    const requested=[h,k],limit=10/Math.abs(a);h=Math.max(-limit,Math.min(limit,h));
    const offset=a*h*h;k=Math.max(-20-offset,Math.min(20-offset,k));
    const b=Math.max(-20,Math.min(20,-2*a*h)),c=Math.max(-20,Math.min(20,offset+k));
    if(![b,c].every(Number.isFinite))return;
    lesson=null;G.setCoefficients([a,b,c],{instant:true,keepView:true,source:'vertex'});
    $('graph-drag-feedback').textContent=requested[0]!==h||requested[1]!==k?t('Stopped at the coefficient limit (−20 to 20).','Coefficient-এর −20 থেকে 20 সীমায় থেমেছে।'):t(`Vertex (${num(h)}, ${num(k)}). a is unchanged.`,`শীর্ষ (${num(h)}, ${num(k)})। a অপরিবর্তিত।`);
  }
  function coordinate(event){
    const matrix=svg.getScreenCTM();if(!matrix||!context)return null;
    const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),q=context;
    return [q.xmin+(p.x-q.L)/(q.R-q.L)*(q.xmax-q.xmin),q.high-(p.y-q.T)/(q.B-q.T)*(q.high-q.low)];
  }
  handle.addEventListener('pointerdown',event=>{
    const s=G.snapshot();if(event.button!==0||!s.valid||s.custom||s.coeff[0]===0)return;
    event.preventDefault();event.stopPropagation();finish();G.pause();G.setCoefficients(s.coeff,{instant:true,keepView:true,source:'vertex'});
    const p=coordinate(event),v=M.quadratic(...s.coeff).vertex;if(!p)return;
    drag={id:event.pointerId,dx:v.x-p[0],dy:v.y-p[1]};handle.classList.add('dragging');handle.focus({preventScroll:true});try{handle.setPointerCapture(event.pointerId);}catch{}
  });
  handle.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;event.preventDefault();event.stopPropagation();const p=coordinate(event);if(p)moveVertex(p[0]+drag.dx,p[1]+drag.dy);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,event=>{if(drag&&event.pointerId===drag.id){event.stopPropagation();finish();}});
  handle.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    const s=G.snapshot();if(!s.valid||s.custom||s.coeff[0]===0||!context)return;
    event.preventDefault();const v=M.quadratic(...s.coeff).vertex,step=event.shiftKey?.1:1;
    moveVertex(event.key==='Home'?0:v.x+({ArrowLeft:-step,ArrowRight:step}[event.key]||0),event.key==='Home'?0:v.y+({ArrowDown:-step,ArrowUp:step}[event.key]||0));
  });
  $('graph-vertex-reset').onclick=()=>moveVertex(0,0);
  function rootChecks(s){
    const box=$('graph-root-checks');box.replaceChildren();
    if(!s.valid||s.custom){box.textContent=t('Substitution checks are available for the quadratic coefficient view.','Quadratic coefficient view-তে মূল বসিয়ে যাচাই করা যায়।');return;}
    const info=M.quadratic(...s.coeff),[a,b,c]=s.coeff;
    if(!info.roots.length){box.textContent=info.allRoots?t('y = 0: every real x is a root; residual = 0.','y = 0: প্রতিটি বাস্তব x মূল; residual = 0।'):a!==0?t('No real roots. Complex roots are not marked on the real x-axis.','বাস্তব মূল নেই। জটিল মূল বাস্তব x-axis-এ দেখানো হয় না।'):t('Nonzero constant: no roots.','শূন্য নয় এমন ধ্রুবক: কোনো মূল নেই।');return;}
    for(const r of info.roots){
      const residual=f(s.coeff,r),scale=Math.max(1,Math.abs(a*r*r)+Math.abs(b*r)+Math.abs(c)),tolerance=1e-9*scale;
      const finite=Number.isFinite(residual)&&Number.isFinite(tolerance),pass=finite&&Math.abs(residual)<=tolerance;
      const row=document.createElement('p');row.className='graph-root-check';row.dataset.root=r;row.dataset.residual=residual;row.dataset.tolerance=tolerance;row.dataset.pass=String(pass);
      row.textContent=`x ≈ ${num(r)}: (${num(a)})·x² + (${num(b)})·x + (${num(c)}) = ${num(residual)}. `+(finite?`|residual| ≤ ${num(tolerance)}: ${pass?t('verified','যাচাইকৃত'):t('outside tolerance','সহনসীমার বাইরে')}.`:t('Not verifiable at this floating-point scale.','এই floating-point scale-এ যাচাই করা যায়নি।'));
      box.append(row);
    }
    const note=document.createElement('p');note.className='lab-note';note.textContent=t('Approximate floating-point roots; full-precision values are substituted (display is rounded). Tolerance = 10⁻⁹ × max(1, |ax²| + |bx| + |c|).','মূলগুলো floating-point আনুমানিক মান; পূর্ণ precision-এ বসানো হয়েছে (প্রদর্শন গোল করা)। সহনসীমা = 10⁻⁹ × max(1, |ax²| + |bx| + |c|)।');box.append(note);
  }
  function prediction(){
    const s=G.snapshot(),kind=$('graph-predict-kind').value,[a,b,c]=s.coeff;
    let next=[...s.coeff],correct,other,question;
    if(kind==='sign'){next[0]=a===0?-1:-a;correct=next[0]<0?t('Opens downward','নিচের দিকে খুলবে'):t('Opens upward','ওপরের দিকে খুলবে');other=next[0]<0?t('Opens upward','ওপরের দিকে খুলবে'):t('Opens downward','নিচের দিকে খুলবে');question=`a: ${num(a)} → ${num(next[0])}`;}
    else if(kind==='width'){next[0]=Math.abs(a)<20?(a<0?-1:1)*Math.min(20,Math.max(.5,Math.abs(a)*2)):a/2;correct=a===0?t('Becomes a parabola','পরাবৃত্ত হবে'):Math.abs(next[0])>Math.abs(a)?t('Narrower about its vertex','নিজের শীর্ষের তুলনায় সরু হবে'):t('Wider about its vertex','নিজের শীর্ষের তুলনায় চওড়া হবে');other=Math.abs(next[0])>Math.abs(a)?t('Wider','চওড়া হবে'):t('Narrower','সরু হবে');question=`a: ${num(a)} → ${num(next[0])}`;}
    else{next[2]=c<=17?c+3:c-3;correct=next[2]>c?t('Moves up by 3','৩ একক ওপরে যাবে'):t('Moves down by 3','৩ একক নিচে যাবে');other=next[2]>c?t('Moves down','নিচে যাবে'):t('Moves up','ওপরে যাবে');question=`c: ${num(c)} → ${num(next[2])}`;}
    activity={before:[a,b,c],next,kind};
    $('graph-predict-question').textContent=question+'. '+t('What will happen? Other coefficients stay fixed.','কী হবে? অন্য coefficient একই থাকবে।');
    const opts=$('graph-predict-answer').options;opts[0].textContent=t('Choose a prediction','আপনার অনুমান বেছে নিন');opts[1].textContent=correct;opts[2].textContent=other;opts[3].textContent=t('No change','কিছু বদলাবে না');$('graph-predict-answer').value='';
  }
  $('graph-predict-kind').onchange=()=>{prediction();$('graph-predict-feedback').textContent='';};
  $('graph-predict-reveal').onclick=()=>{
    if(!activity||!$('graph-predict-answer').value){$('graph-predict-feedback').textContent=t('Choose an answer before revealing the graph.','গ্রাফ দেখার আগে একটি উত্তর বেছে নিন।');return;}
    const correct=$('graph-predict-answer').value==='correct',a=activity;
    G.setCoefficients(a.next,{source:'prediction'});
    const explanation=a.kind==='shift'?t('Adding 3 to c adds 3 to every y; subtracting 3 moves every point down.','c-তে ৩ যোগ হলে প্রতিটি y-তে ৩ যোগ হয়; ৩ বিয়োগ হলে প্রতিটি বিন্দু নিচে নামে।'):a.kind==='sign'?t('The squared distance from the vertex is nonnegative; the sign of a determines whether y−k is positive or negative.','শীর্ষ থেকে দূরত্বের বর্গ অঋণাত্মক; a-এর চিহ্ন বলে y−k ধনাত্মক হবে না ঋণাত্মক।'):t('At the same distance from its own vertex, |y−k| = |a|(x−h)². Larger |a| gives a narrower parabola. With b fixed, the vertex may also move.','নিজের শীর্ষ থেকে একই দূরত্বে |y−k| = |a|(x−h)²। |a| বেশি হলে পরাবৃত্ত সরু হয়। b একই থাকলে শীর্ষও সরতে পারে।');
    lesson={kind:a.kind,coeff:a.next};$('graph-predict-feedback').textContent=(correct?t('Correct. ','সঠিক। '):t('Try comparing the two values again. ','দুটি মান আবার তুলনা করুন। '))+explanation;
    activity.revealed=true;$('graph-predict-reveal').disabled=true;G.repaint();
  };
  const examples={sign:[-1,0,0],width:[2,0,0],shift:[1,0,3]};
  const why={
    sign:()=>t('Why? y−k = a(x−h)². Since (x−h)² ≥ 0, a > 0 gives y ≥ k and a < 0 gives y ≤ k. Example: x=1 gives 1 for y=x² and −1 for y=−x². Highlight: the sample at x=1.','কেন? y−k = a(x−h)²। (x−h)² ≥ 0 বলে a > 0 হলে y ≥ k, a < 0 হলে y ≤ k। উদাহরণ: x=1-এ y=x² হলে 1, y=−x² হলে −1। হাইলাইট: x=1 বিন্দু।'),
    width:()=>t('Why? At a fixed height |y−k|, |x−h| = √(|y−k|/|a|). Increasing |a| reduces this horizontal distance. Example: y=2 intersects x² at ±√2, but 2x² at ±1. Highlight: the y=2 cross-section.','কেন? নির্দিষ্ট উচ্চতা |y−k|-তে |x−h| = √(|y−k|/|a|)। |a| বাড়লে অনুভূমিক দূরত্ব কমে। উদাহরণ: y=2 রেখা x²-কে ±√2-তে, 2x²-কে ±1-এ ছেদ করে। হাইলাইট: y=2 ছেদরেখা।'),
    shift:()=>t('Why? f(x)+3 adds 3 to every output without changing x. Example: x=1 gives 1 for x² and 4 for x²+3. Highlight: a 3-unit vertical shift.','কেন? f(x)+3 প্রতিটি ফলাফলে ৩ যোগ করে, x বদলায় না। উদাহরণ: x=1-এ x²-এর মান 1, x²+3-এর মান 4। হাইলাইট: উল্লম্ব ৩ একক সরণ।')
  };
  for(const kind of Object.keys(why))$('graph-why-'+kind).onclick=()=>{lesson={kind,coeff:examples[kind],example:true};$('graph-why-text').textContent=why[kind]()+t(' Purple dotted curve: worked example; green curve: your function.',' বেগুনি বিন্দুরেখা: উদাহরণ; সবুজ রেখা: আপনার function।');G.repaint();};
  $('graph-why-clear').onclick=()=>{lesson=null;$('graph-why-text').textContent='';G.repaint();};
  function render(){
    const s=G.snapshot(),eligible=s.valid&&!s.custom&&s.coeff[0]!==0;
    $('graph-pin').textContent=t('Pin current as Before','বর্তমান রেখা Before হিসেবে রাখুন');$('graph-pin').disabled=!s.valid;
    $('graph-unpin').textContent=t('Clear reference','Reference সরান');$('graph-unpin').disabled=!pinned;
    $('graph-vertex-reset').textContent=t('Reset vertex to (0, 0)','শীর্ষ (0, 0)-এ ফেরান');
    $('graph-comparison-legend').textContent=t('━━ Green solid: current / After','━━ সবুজ নিরবচ্ছিন্ন: বর্তমান / After')+(pinned?'  '+t('┄┄ Orange dashed: pinned Before — ','┄┄ কমলা ছেদরেখা: রাখা Before — ')+pinned.expression+' ['+pinned.coeff.map(num).join(', ')+']':'');
    $('graph-vertex-help').textContent=eligible?t('Drag V with mouse or touch. Arrow keys: 1 unit; Shift+Arrow: 0.1; Home: (0,0). The viewport stays fixed while moving V. Coefficients remain within −20…20.','Mouse বা touch দিয়ে V টানুন। Arrow: ১ একক; Shift+Arrow: ০.১; Home: (0,0)। V সরানোর সময় viewport স্থির থাকে। Coefficient −20…20 সীমায় থাকে।'):s.custom?t('Vertex dragging is available in the quadratic coefficient view.','Quadratic coefficient view-তে শীর্ষ টানা যায়।'):t('Vertex dragging is disabled: a=0 is linear or constant, so there is no unique quadratic vertex.','শীর্ষ টানা বন্ধ: a=0 হলে সরলরেখা বা ধ্রুবক; একটি নির্দিষ্ট quadratic শীর্ষ নেই।');
    controls.forEach(id=>$(id).disabled=!s.valid||s.custom||(id==='graph-vertex-reset'&&!eligible));
    if(activity?.revealed)$('graph-predict-reveal').disabled=true;
    const v=eligible?M.quadratic(...s.coeff).vertex:null;
    $('graph-vertex-form').textContent=v?`y = ${num(s.coeff[0])}(x − (${num(v.x)}))² + (${num(v.y)}) · b = −2ah, c = ah² + k`:'';
    $('graph-predict-title').textContent=t('Optional: predict, then explore','ঐচ্ছিক: আগে অনুমান, পরে দেখুন');$('graph-predict-intro').textContent=t('Your graph changes only after you choose and reveal. A new parameter edit resets the activity.','উত্তর বেছে দেখুন চাপার পরই গ্রাফ বদলাবে। Parameter বদলালে activity নতুন করে শুরু হবে।');
    $('graph-predict-label').textContent=t('Explore a change','কোন পরিবর্তন দেখবেন');['Change the sign of a','Change |a|','Shift c'].forEach((en,i)=>$('graph-predict-kind').options[i].textContent=t(en,['a-এর চিহ্ন বদল','|a| বদল','c সরানো'][i]));
    $('graph-answer-label').textContent=t('Your prediction','আপনার অনুমান');$('graph-predict-reveal').textContent=t('Reveal graph','গ্রাফ দেখুন');
    $('graph-why-sign').textContent=t('Why? Opening','কেন? খোলার দিক');$('graph-why-width').textContent=t('Why? Width','কেন? প্রস্থ');$('graph-why-shift').textContent=t('Why? Vertical shift','কেন? উল্লম্ব সরণ');$('graph-why-clear').textContent=t('Clear highlight','হাইলাইট সরান');
    $('graph-residual-title').textContent=t('Check roots in the original equation','মূল সমীকরণে মূল বসিয়ে যাচাই');rootChecks(s);
  }
  function changed(source){
    if(source!=='vertex')finish();
    if(source!=='prediction'){activity=null;lesson=null;$('graph-predict-feedback').textContent='';$('graph-why-text').textContent='';$('graph-drag-feedback').textContent='';}
    render();if(source!=='prediction')prediction();lastSignature='';G.repaint();
  }
  function paint(q){
    context=q;const s=G.snapshot(),v=!q.custom&&q.valid?M.quadratic(...q.coeff).vertex:null;
    const visible=v&&v.x>=q.xmin&&v.x<=q.xmax&&v.y>=q.low&&v.y<=q.high;
    handle.style.display=visible?'':'none';handle.setAttribute('aria-disabled',String(!visible));
    if(visible){handle.setAttribute('cx',q.px(v.x));handle.setAttribute('cy',q.py(v.y));handle.setAttribute('aria-label',t(`Move vertex V (${num(v.x)}, ${num(v.y)})`,`শীর্ষ V (${num(v.x)}, ${num(v.y)}) সরান`));}
    const signature=JSON.stringify([s.coeff,s.custom,s.valid,bn()]);if(signature!==lastSignature){lastSignature=signature;render();}
    reference.style.display=pinned&&q.valid?'':'none';
    const key=JSON.stringify([q.L,q.R,q.T,q.B,q.xmin,q.xmax,q.low,q.high,pinned]);
    if(pinned&&key!==cache){
      cache=key;let path='',previous=null;
      for(let i=0;i<=360;i++){
        const x=q.xmin+(q.xmax-q.xmin)*i/360;let y;
        try{y=pinned.tree?FormaEngine.evaluate(pinned.tree,{x,a:pinned.coeff[0],b:pinned.coeff[1],c:pinned.coeff[2]}):f(pinned.coeff,x);}catch{y=NaN;}
        const py=q.py(y);if(!Number.isFinite(py)||Math.abs(py)>1e7){previous=null;continue;}
        let continuous=previous&&Math.abs(py-previous.py)<2*(q.B-q.T);
        if(continuous&&pinned.tree)try{FormaLabMath.interval(pinned.tree,previous.x,x,{a:pinned.coeff[0],b:pinned.coeff[1],c:pinned.coeff[2]});}catch{continuous=false;}
        path+=(continuous?'L':'M')+q.px(x).toFixed(3)+' '+py.toFixed(3);previous={x,py};
      }
      reference.setAttribute('d',path);
    }
    highlight.style.display=lesson&&q.valid?'':'none';
    if(lesson){
      let path='';
      if(lesson.example){for(let i=0;i<=120;i++){const x=q.xmin+(q.xmax-q.xmin)*i/120;path+=(i?'L':'M')+q.px(x)+' '+q.py(f(lesson.coeff,x));}}
      if(lesson.kind==='width')path+=` M${q.px(-Math.SQRT2)} ${q.py(2)}H${q.px(Math.SQRT2)} M${q.px(-1)} ${q.py(1.8)}V${q.py(2.2)} M${q.px(1)} ${q.py(1.8)}V${q.py(2.2)}`;
      else if(lesson.example)path+=` M${q.px(1)} ${q.py(1)}V${q.py(lesson.kind==='shift'?4:-1)}`;
      else{const info=M.quadratic(...lesson.coeff);if(info.vertex)path+=` M${q.px(info.vertex.x)} ${q.py(info.vertex.y)}L${q.px(info.vertex.x+1)} ${q.py(info.vertex.y+lesson.coeff[0])}`;}
      highlight.setAttribute('d',path);
    }
  }
  window.FormaGraphTeaching={paint,changed,snapshot(){return pinned?{coeff:[...pinned.coeff],expression:pinned.expression,custom:!!pinned.tree}:null;},restore(reference){if(reference===null){pinned=null;}else{if(!reference||!Array.isArray(reference.coeff)||reference.coeff.length!==3||!reference.coeff.every(n=>Number.isFinite(n)&&Math.abs(n)<=20)||typeof reference.expression!=='string'||reference.expression.length>1000)throw Error('Invalid graph reference.');pinned={coeff:[...reference.coeff],expression:reference.expression,tree:reference.custom?FormaEngine.parse(reference.expression):null};}cache='';render();G.repaint();},reset(){finish();pinned=null;lesson=null;cache='';changed('reset');G.repaint();}};
  // All family/custom edits cancel teaching gestures even when no coefficient changes.
  $('graph-family').addEventListener('change',()=>{changed('family');G.repaint();});
  $('graph-plot').addEventListener('click',()=>{changed('family');G.repaint();});
  $('graph-functions').addEventListener('input',()=>{changed('input');G.repaint();});
  let renderedLanguage=document.documentElement.lang;
  new MutationObserver(()=>{const language=document.documentElement.lang;if(language===renderedLanguage)return;renderedLanguage=language;render();prediction();if(lesson?.example)$('graph-why-text').textContent=why[lesson.kind]();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
  const oldHide=G.hide;G.hide=function(){finish();oldHide.call(G);};
  render();prediction();G.repaint();
})();
