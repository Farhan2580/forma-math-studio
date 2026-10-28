'use strict';
const $=(id)=>document.getElementById(id), M=window.FormaMath, f=M.format;
let mode='basic';
let circlePlayer=null,circleHost=null,circleSteps=[];
const algebra={frames:[],index:0,timer:null};
const algebraPlayer=new FormaAnimation.Player({duration:1800,render:position=>showAlgebraStep(Math.floor(position+1e-8)),state:player=>{algebra.timer=player.playing?1:null;$('visual').classList.toggle('paused',!player.playing&&player.position%1>0&&player.position<player.count-1);}});
function pauseAlgebra(){algebraPlayer.pause();}
function resetAlgebra(){
  algebraPlayer.cancel();algebra.frames=[];algebra.index=0;
  $('visual').classList.remove('paused');$('algebra-controls').hidden=mode!=='algebra';
  $('steps').classList.toggle('algebra-steps',mode==='algebra');
  $('replay').hidden=mode==='basic'||mode==='percentage';if(mode==='geometry')$('replay').hidden=true;
}function showAlgebraStep(index){
  if(!algebra.frames.length)return;
  const nextIndex=Math.max(0,Math.min(index,algebra.frames.length-1));if(algebra.index===nextIndex&&$('visual').querySelector('.algebra-balance'))return;algebra.index=nextIndex;
  const frame=algebra.frames[algebra.index];
  // Labels describe equivalent expressions, not literal positive weights.
  $('visual').classList.remove('paused');
  $('visual').innerHTML='<div class="balance algebra-balance" style="--tilt:'+frame.tilt+'deg" role="img" aria-label="'+frame.equation+'. '+frame.note+'"><div class="balance-top"><div class="balance-pan"><span>'+frame.left+'</span><span>'+frame.right+'</span></div><div class="beam"></div></div><div class="stand"></div><div class="base"></div><div class="visual-note">'+frame.note+'</div><div class="balance-caption">Symbolic balance · matching expressions have equal value</div></div>';
  $('formula').textContent=frame.equation;
  [...$('steps').children].forEach((li,i)=>{
    li.classList.toggle('current-step',i===algebra.index);
    if(i===algebra.index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
  });
  $('previous').disabled=algebra.index===0;
  $('next').disabled=algebra.index===algebra.frames.length-1;
  $('play-pause').disabled=false;$('replay').disabled=false;
  $('step-status').textContent='Step '+(algebra.index+1)+' of '+algebra.frames.length;
}
function playAlgebra(){algebraPlayer.play();}
const configs={
 basic:{category:'THE EVERYDAY ESSENTIALS',title:'Small numbers.<br>Big understanding.',description:'Choose two numbers and an operation. Follow the result, one step at a time.',hint:'Positive whole-number products up to 100 become a grid.',fields:'<div class="fields-row"><label>First number<input id="a" type="number" value="12" step="any"></label><label>Second number<input id="b" type="number" value="4" step="any"></label></div><label>Operation<select id="op"><option value="*">× Multiply</option><option value="+">+ Add</option><option value="-">− Subtract</option><option value="/">÷ Divide</option></select></label>'},
 percentage:{category:'A PART OF THE WHOLE',title:'Make percentages<br>feel intuitive.',description:'See a percentage as a share of 100, then apply that share to your number.',hint:'Each square is 1%. Partial squares show fractional percentages.',fields:'<div class="fields-row"><label>Percentage (%)<input id="p" type="number" value="20" step="any"></label><label>Of this number<input id="n" type="number" value="250" step="any"></label></div><label>Percentage operation<select id="percent-kind"><option value="of">Percentage of total</option><option value="increase">Percentage increase</option><option value="decrease">Percentage decrease</option></select></label>'},
 algebra:{category:'FIND THE UNKNOWN',title:'A little balance.<br>A clear solution.',description:'Solve a linear equation of the form ax + b = c. Keep both sides balanced.',hint:'Change the coefficients below. The equation is ax + b = c.',fields:'<div class="fields-row"><label>a<input id="a" type="number" value="2" step="any"></label><label>b<input id="b" type="number" value="6" step="any"></label><label>c<input id="c" type="number" value="18" step="any"></label></div>'},
 geometry:{category:'GIVE NUMBERS A SHAPE',title:'One radius.<br>Endless discovery.',description:'Move the radius slider and see the circle grow. Its area grows with the square of its radius.',hint:'Double the radius and the area becomes four times as large.',fields:'<label>Radius (units)<input id="radius" type="number" min="0" max="20" value="5" step="0.1"></label><label for="radius-slider">Explore radius: 0–20 units</label><input id="radius-slider" aria-label="Circle radius" type="range" min="0" max="20" value="5" step="0.1">'}
};
function number(id){return FormaFeedback.numeric(id);}
function render(){if(circlePlayer)circlePlayer.cancel();if(circleHost)circleHost.hidden=true;FormaLessons.hide();resetAlgebra();$('input-math-preview').replaceChildren();try{
 let result,formula,visual,steps,lesson;
 if(mode==='basic'){
   const a=number('a'),b=number('b'),op=$('op').value;
   lesson=FormaLessons.arithmetic(a,b,op);result=f(lesson.result);formula=lesson.equation;steps=[];visual='';
 }else if(mode==='percentage'){
   lesson=FormaLessons.percentage(number('p'),number('n'),$('percent-kind').value);result=f(lesson.result);formula=lesson.equation;steps=[];visual=''; }else if(mode==='algebra'){
   const a=number('a'),b=number('b'),c=number('c'),r=M.equation(a,b,c);
   FormaNotation.equation($('input-math-preview'),'('+a+')*x+('+b+')',String(c));
   const left=f(a)+'x '+(b<0?'− '+f(-b):'+ '+f(b));
   formula=left+' = '+f(c);
   const frames=[{left,right:f(c),equation:formula,note:'Start with the original equation.',tilt:0}];
   if(r.kind==='unique'){
     result='x = '+f(r.x);
     frames.push({left:f(a)+'x',right:f(r.difference),equation:f(a)+'x = '+f(r.difference),note:'Subtract b ('+f(b)+') from both sides.',tilt:0});
     frames.push({left:'x',right:f(r.x),equation:result,note:'Divide both sides by a ('+f(a)+'). Both sides remain equal.',tilt:0});
   }else{
     result=r.kind==='infinite'?'Every x':'No solution';
     const equal=r.kind==='infinite',tilt=equal?0:(b>c?-7:7);
     frames.push({left:f(b),right:f(c),equation:f(b)+(equal?' = ':' ≠ ')+f(c),note:'Since a = 0, the x term disappears. Compare the two constants.',tilt});
     frames.push({left:f(b),right:f(c),equation:result,note:equal?'Both sides are equal regardless of x. Every real x is a solution.':'The two constants are unequal. Changing x cannot fix this, so there is no solution.',tilt});
   }
   algebra.frames=frames;
   steps=frames.map(frame=>frame.equation+'. '+frame.note);
   visual=''; }else{let r=number('radius');if(r>20)throw Error('For this visual, use a radius between 0 and 20.');const c=M.circle(r),rad=r*4.7;result=f(c.area);formula='square units · A = π × '+f(r)+'²';steps=['Use the circle area formula: A = πr².','Square the radius: '+f(r)+'² = '+f(r*r)+'.','Multiply by π: A ≈ '+f(c.area)+' square units. Circumference ≈ '+f(c.circumference)+' units.'];visual='<div><svg viewBox="0 0 260 235" role="img" aria-label="Circle with radius '+f(r)+' units"><g class="circle-shape"><circle cx="130" cy="115" r="'+rad+'" fill="#c3d79f" stroke="#2d5843" stroke-width="2"/><line x1="130" y1="115" x2="'+(130+rad)+'" y2="115" stroke="#2d5843" stroke-width="2" stroke-dasharray="4 3"/></g><circle cx="130" cy="115" r="3" fill="#2d5843"/><text x="130" y="225" text-anchor="middle" font-size="13" fill="#2d5843">r = '+f(r)+' units</text></svg><div class="visual-note">Fixed scale · radius range 0–20</div></div>';}
 FormaFeedback.clear($('fields'));$('error').textContent='';$('result').textContent=result;$('formula').textContent=formula;FormaAnimation.patch($('visual'),visual);$('steps').replaceChildren(...steps.map((text,i)=>{let li=document.createElement('li');li.textContent=text;li.style.animationDelay=i*.24+'s';return li;}));if(mode==='algebra')algebraPlayer.configure(algebra.frames.length,0);if(lesson)FormaLessons.load(lesson);if(mode==='geometry')circleWalkthrough(steps);FormaFeedback.publish(mode,result,lesson?FormaNotation.classify(lesson.ast,lesson.result):'approximate',lesson?.ast);
 }catch(e){FormaFeedback.invalid(mode,e.message);if(mode==='basic'&&$('op').value==='/'&&$('b').valueAsNumber===0)FormaFeedback.error('b',e.message);else if(mode==='geometry')FormaFeedback.error('radius',e.message);else if(!$('fields').querySelector('[aria-invalid=true]'))FormaFeedback.error('fields',e.message);resetAlgebra();$('error').textContent=e.message;$('result').textContent='—';$('formula').textContent='Update the values to continue.';$('visual').replaceChildren();$('steps').replaceChildren();}}
function circleWalkthrough(steps){
  circleSteps=steps;
  if(!circlePlayer){
    circleHost=document.createElement('div');circleHost.id='circle-controls';document.querySelector('.explanation').append(circleHost);
    circlePlayer=new FormaAnimation.Player({duration:1500,render:position=>{const index=Math.floor(position);[...$('steps').children].forEach((li,i)=>{li.classList.toggle('current-step',i===index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});}});
    FormaAnimation.controls(circleHost,circlePlayer,{prefix:'circle',describe:index=>{const bn=document.documentElement.lang==='bn';return [circleSteps[index]||'',bn?'একই ব্যাসার্ধে বৃত্তের সূত্র ও একক ধারাবাহিকভাবে প্রয়োগ করুন।':'Apply the circle formulas and units consistently for the same radius.',bn?'স্থির বৃত্ত ও হিসাবের ধাপ দেখানো হয়েছে; shape transformation animation এখনো নেই।':'Static circle and worked formula steps; a shape-transformation animation is not yet available.'];}});
  }
  circleHost.hidden=false;circlePlayer.configure(steps.length,0);
}function selectMode(next){
  FormaAnimation.cancelAll();FormaLessons.hide();if(circleHost)circleHost.hidden=true;
  window.FormaGraph.hide();window.FormaLabs.hide();window.FormaScientific.hide();mode=next;
  const graphMode=mode==='graph',scientificMode=mode==='scientific',labMode=Object.hasOwn(window.FormaLabs.titles,mode);
  document.querySelector('.workspace').hidden=graphMode||scientificMode||labMode;
  document.querySelector('.explanation').hidden=graphMode||scientificMode||labMode;
  $('graph-explorer').hidden=!graphMode;$('scientific').hidden=!scientificMode;$('lab-hub').hidden=!labMode;
  document.querySelectorAll('[data-mode]').forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  if(graphMode||scientificMode||labMode){
    resetAlgebra();
    if(graphMode)window.FormaGraph.show();else if(scientificMode)window.FormaScientific.show();else window.FormaLabs.show(mode);
    window.FormaI18n?.refresh();document.dispatchEvent(new CustomEvent('forma:mode',{detail:{mode}}));return;
  }  const cfg=configs[mode];document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});$('category').textContent=cfg.category;$('title').innerHTML=cfg.title;$('description').textContent=cfg.description;$('hint').textContent=cfg.hint;$('fields').innerHTML=cfg.fields;if(mode==='geometry'){for(const id of ['radius','radius-slider'])$(id).addEventListener('input',()=>{if(id==='radius-slider')$('radius').value=$('radius-slider').value;else if($('radius').value!==''&&number('radius')>=0&&number('radius')<=20)$('radius-slider').value=$('radius').value;render();});}render();document.dispatchEvent(new CustomEvent('forma:mode',{detail:{mode}}));}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
FormaAnimation.controls($('algebra-controls'),algebraPlayer,{prefix:'algebra-shared',existing:{prev:'previous',play:'play-pause',next:'next',replay:'replay',speed:'algebra-speed',value:'algebra-speed-value',status:'step-status'},describe:index=>{const frame=algebra.frames[index];return frame?[frame.note,'A solution must satisfy equality. Apply the same operation to both sides, or compare the constants.',frame.left+(frame.tilt?' ≠ ':' = ')+frame.right]:[];}});
$('calculate').addEventListener('click',render);
$('replay').addEventListener('click',()=>{if(mode==='geometry')render();});
$('fields').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();render();}});
$('fields').addEventListener('input',()=>{if(['basic','percentage','algebra'].includes(mode))render();});
$('fields').addEventListener('change',()=>{if(['basic','percentage'].includes(mode))render();});
window.FormaApp={selectMode,render,get mode(){return mode;}};
selectMode('basic');
