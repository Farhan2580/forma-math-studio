(function(){
  'use strict';
  const E=window.FormaEngine,$=id=>document.getElementById(id);let angle='DEG',ans=0,memory=0,lastValue=null,fractionMode=false,history=[];
  const storageKey='forma.scientific.history.v1';let lastEvaluation=null;
  const section=document.createElement('section');section.id='scientific';section.hidden=true;section.className='lab-section';
  section.innerHTML=`<div class="lab-heading"><span class="eyebrow">PRECISION MEETS CURIOSITY</span><h2 data-i18n="Scientific Calculator">Scientific Calculator</h2><p data-i18n="Build an expression. Explore the result.">Build an expression. Explore the result.</p></div>
  <div class="science-layout"><section class="science-calculator"><div class="science-toolbar"><div class="segmented" role="group" aria-label="Angle mode"><button id="sci-deg" aria-pressed="true">DEG</button><button id="sci-rad" aria-pressed="false">RAD</button></div><span id="sci-memory-state">M = 0</span><button id="sci-fraction">Fraction / Decimal</button></div>
  <label for="sci-expression" data-i18n="Expression">Expression</label><textarea id="sci-expression" rows="2" spellcheck="false" autocomplete="off" aria-describedby="sci-syntax" placeholder="sin(30) + 2^3 / (1 + 1)"></textarea><div id="sci-preview" class="math-preview" aria-label="Formatted expression"></div><output id="sci-result" aria-live="polite">0</output><p id="sci-error" role="alert"></p><div id="sci-keypad" class="sci-keypad"></div>
  <p id="sci-syntax" class="lab-note">% always divides by 100: 200 × 10% = 20; 200 + 10% = 200.1. For a 10% increase, use 200 × (1 + 10%). Fractions use /; log(value, base), root(value, n), npr(n, r), ncr(n, r). Scientific notation: 1.2e-3.</p>
  <p class="lab-note">≈ indicates a decimal approximation. All calculations use IEEE-754 numbers; fraction display reconstructs a rational approximation (denominator ≤ 1,000,000). Trigonometric functions use the selected DEG/RAD mode.</p></section>
  <aside class="science-history"><div class="panel-top"><span data-i18n="Calculation history">Calculation history</span><button id="sci-history-clear" data-i18n="Clear history">Clear history</button></div><ol id="sci-history"></ol><p id="sci-storage-note" class="lab-note"></p></aside></div>`;
  document.querySelector('footer').before(section);
  const keypad=$('sci-keypad');
  const keys=[['MC','mc'],['MR','mr'],['M+','mplus'],['M−','mminus'],['Ans','ans'],['AC','clear'],['CE','entry'],['⌫','back'],
    ['sin','sin('],['cos','cos('],['tan','tan('],['asin','asin('],['acos','acos('],['atan','atan('],['(', '('],[')',')'],
    ['x²','^2'],['x³','^3'],['xʸ','^'],['√','sqrt('],['∛','cbrt('],['ⁿ√','root('],['1/x','reciprocal'],['|x|','abs('],
    ['log₁₀','log10('],['ln','ln('],['eˣ','exp('],['10ˣ','pow10('],['logᵦ','log('],['n!','!'],['nPr','npr('],['nCr','ncr('],
    ['π','pi'],['e','e'],['EE','e'],[',',','],['%','%'],['a/b','/']];
  const numeric=[['7','7'],['8','8'],['9','9'],['÷','/'],['4','4'],['5','5'],['6','6'],['×','*'],['1','1'],['2','2'],['3','3'],['−','-'],['0','0'],['.','.'],['±','sign'],['+','+'],['(','('],[')',')'],['⌫','back'],['=','equals']];
  for(const [className,group] of [['sci-functions',keys],['sci-numbers',numeric]]){
    const container=document.createElement('div');container.className=className;
    for(const [label,action] of group){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.action=action;button.setAttribute('aria-label',action==='back'?'Backspace':action==='equals'?'Calculate':label);if(action==='equals')button.className='sci-equals';container.append(button);}keypad.append(container);
  }
  function insert(text){
    const field=$('sci-expression'),start=field.selectionStart,end=field.selectionEnd;
    if(field.value.length+text.length>800)return;
    if(text.endsWith('(')&&start!==end){const selected=field.value.slice(start,end);text+=selected+')';}
    field.setRangeText(text,start,end,'end');field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();$('sci-error').textContent='';
  }
  function showResult(){
    if(lastValue===null){$('sci-result').textContent='0';return;}
    const result=E.fraction(lastValue);
    $('sci-result').textContent=fractionMode&&result?(result.denominator!==1?'≈ ':'')+result.numerator+(result.denominator===1?'':' / '+result.denominator):Number.isSafeInteger(lastValue)?String(lastValue):'≈ '+Number(lastValue.toPrecision(12)).toString();
    $('sci-fraction').setAttribute('aria-pressed',String(fractionMode));
  }
  function saveHistory(){try{localStorage.setItem(storageKey,JSON.stringify(history));}catch{$('sci-storage-note').textContent='Storage is unavailable. History works for this session.';}}
  function renderHistory(){
    $('sci-history').replaceChildren();
    for(const entry of history){
      const li=document.createElement('li'),button=document.createElement('button');
      button.textContent=entry.expression+' = '+entry.result+'  ['+entry.angle+']';button.type='button';button.title='Reuse this expression';
      button.addEventListener('click',()=>{$('sci-expression').value=entry.expression;if(Number.isFinite(entry.ans))ans=entry.ans;setAngle(entry.angle);$('sci-expression').focus();});li.append(button);$('sci-history').append(li);
    }
  }
  function calculate(record=true){
    const expression=$('sci-expression').value.trim();
    try{
      const ast=FormaNotation.parse(expression),previousAns=ans,value=E.evaluate(ast,{ans},angle);lastEvaluation={expression,ans:previousAns};lastValue=value;ans=value;showResult();$('sci-error').textContent='';FormaFeedback.clear($('sci-expression'));FormaFeedback.publish('scientific',$('sci-result').textContent,FormaNotation.classify(ast,value),ast);FormaNotation.render($('sci-preview'),ast);
      if(record){history.unshift({expression,result:Number.isSafeInteger(value)?String(value):'≈ '+Number(value.toPrecision(12)).toString(),angle,ans:previousAns});history=history.slice(0,40);saveHistory();renderHistory();}
      return value;
    }catch(error){$('sci-error').textContent=error.message;$('sci-result').textContent='—';FormaFeedback.error('sci-expression',error.message);FormaFeedback.invalid('scientific',error.message);lastValue=null;return null;}
  }
  function setAngle(next){angle=next;for(const name of ['DEG','RAD'])$('sci-'+name.toLowerCase()).setAttribute('aria-pressed',String(name===angle));}
  keypad.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;const action=button.dataset.action,field=$('sci-expression');
    if(action==='equals')calculate();
    else if(action==='clear'){field.value='';lastValue=null;$('sci-error').textContent='';showResult();field.focus();}
    else if(action==='back'){const start=field.selectionStart,end=field.selectionEnd;field.setRangeText('',start===end?Math.max(0,start-1):start,end,'end');field.focus();}
    else if(action==='entry'){const start=field.selectionStart,before=field.value.slice(0,start),match=before.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$|[a-zA-Z]+\(?$|.$/);field.setRangeText('',Math.max(0,start-(match?.[0].length||0)),field.selectionEnd,'end');field.focus();}
    else if(action==='reciprocal'||action==='sign'){field.value=action==='reciprocal'?'1/('+(field.value||'Ans')+')':'-('+(field.value||'Ans')+')';field.focus();}
    else if(action==='mc'){memory=0;updateMemory();}
    else if(action==='mr')insert('('+memory+')');
    else if(action==='mplus'||action==='mminus'){const value=field.value.trim()?calculate(false):lastValue;if(value!==null){try{memory=E.finite(memory+(action==='mplus'?value:-value));updateMemory();}catch(e){$('sci-error').textContent=e.message;}}}
    else insert(action);
  });
  function updateMemory(){$('sci-memory-state').textContent='M = '+Number(memory.toPrecision(10));}
  $('sci-expression').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key==='='){event.preventDefault();calculate();}if(event.key==='Escape'){event.preventDefault();fieldClear();}});
  function fieldClear(){$('sci-expression').value='';lastValue=null;lastEvaluation=null;showResult();$('sci-error').textContent='';}
  $('sci-deg').addEventListener('click',()=>setAngle('DEG'));$('sci-rad').addEventListener('click',()=>setAngle('RAD'));
  $('sci-fraction').addEventListener('click',()=>{fractionMode=!fractionMode;showResult();});
  $('sci-history-clear').addEventListener('click',()=>{history=[];saveHistory();renderHistory();});
  try{const stored=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(stored))history=stored.filter(x=>typeof x.expression==='string'&&x.expression.length<=800&&typeof x.result==='string'&&['DEG','RAD'].includes(x.angle)).slice(0,40);}catch{$('sci-storage-note').textContent='Saved history could not be loaded. New calculations still work.';}
  $('sci-expression').addEventListener('input',()=>FormaNotation.preview($('sci-expression'),$('sci-preview')));
  keypad.addEventListener('click',()=>queueMicrotask(()=>FormaNotation.preview($('sci-expression'),$('sci-preview'))));
  const functions=$('sci-keypad').querySelector('.sci-functions'),allButtons=[...functions.children];functions.replaceChildren();
  for(const [label,start,end] of [['Memory & editing',0,8],['Trigonometry',8,14],['Powers & roots',14,24],['Logs & counting',24,32],['Constants & fractions',32,keys.length]]){
    const group=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=label;group.append(legend,...allButtons.slice(start,end));functions.append(group);
  }
  renderHistory();window.FormaScientific={show(){},hide(){},calculate,snapshot(){return {angle,ans:lastEvaluation?.expression===$('sci-expression').value.trim()?lastEvaluation.ans:ans,memory,fractionMode};},restoreContext(context){if(!context||!['DEG','RAD'].includes(context.angle)||![context.ans,context.memory].every(Number.isFinite))throw Error('Invalid scientific context.');setAngle(context.angle);ans=context.ans;memory=context.memory;fractionMode=!!context.fractionMode;lastEvaluation=null;lastValue=null;updateMemory();},reset(){ans=memory=0;lastValue=null;fractionMode=false;setAngle('DEG');fieldClear();updateMemory();$('sci-preview').replaceChildren();FormaFeedback.clear($('sci-expression'));FormaFeedback.publish('scientific','0','exact');}};
})();
