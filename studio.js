(function(){
 'use strict';
 const $=id=>document.getElementById(id),t=(en,bn)=>document.documentElement.lang==='bn'?bn:en;
 const collapse=document.createElement('button');collapse.id='nav-collapse';collapse.type='button';collapse.textContent='☰';collapse.setAttribute('aria-controls','tool-sidebar');collapse.setAttribute('aria-expanded','true');document.querySelector('.app-topbar').prepend(collapse);
 collapse.onclick=()=>{const rail=document.body.classList.toggle('studio-rail');collapse.setAttribute('aria-expanded',String(!rail));labels();};
 function labels(){document.querySelector('.app-name').textContent=t('Forma · Math Studio','Forma · গণিত স্টুডিও');collapse.setAttribute('aria-label',document.body.classList.contains('studio-rail')?t('Expand topic navigation','বিভাগের navigation খুলুন'):t('Collapse topic navigation','বিভাগের navigation গুটান'));document.querySelectorAll('.studio-secondary>summary').forEach(el=>el.textContent=t('Details & other results','বিস্তারিত ও অন্য ফল'));$('stage-expand').textContent=t('⛶ Expand stage','⛶ বড় করে দেখুন');$('stage-reset').textContent=t('Reset view','দৃশ্য Reset');}
 let lastResult=null; const tools=document.createElement('div');tools.className='stage-tools';tools.innerHTML='<button id="stage-reset" type="button"></button><button id="stage-expand" type="button"></button>';
 $('lab-result').before(tools);$('stage-reset').hidden=true;$('stage-expand').onclick=()=>{ $('stage-expand').focus({preventScroll:true});FormaWorkspace.setFocus(true);};$('stage-reset').onclick=()=>window.FormaGeometry3D?.reset();
 // Keep the primary answer before the stage; secondary results remain available and copyable.
 function compact(){const result=$('lab-result');if(!result.children.length){lastResult=null;return;}if(result.firstElementChild===lastResult)return;const grids=[...result.querySelectorAll(':scope>.result-grid')];if(!grids.length)return;const grid=grids[0],items=[...grid.children];if(!items.length)return;
  let primary=items[0];if(FormaApp.mode==='geometry-lab')primary=items.find(el=>/Volume|আয়তন/i.test(el.querySelector('dt')?.textContent))||items[0];if(FormaApp.mode==='statistics')primary=items.find(el=>/mean|গড়/i.test(el.querySelector('dt')?.textContent))||items[0];
  const headline=result.querySelector(':scope>h3,.fraction-answer');if(!headline){const row=document.createElement('p');row.className='studio-primary-answer';const name=document.createElement('span');name.textContent=primary.querySelector('dt').textContent;const value=primary.querySelector('dd').textContent,exact=FormaFeedback.results.get(FormaApp.mode)?.accuracy==='exact';row.append(name,document.createTextNode((exact?' = ':' ≈ ')+value.replace(/^≈\s*/,'')));result.prepend(row);}
  const details=document.createElement('details');details.className='studio-secondary';const summary=document.createElement('summary');summary.textContent=t('Details & other results','বিস্তারিত ও অন্য ফল');details.append(summary);grid.before(details);details.append(grid);lastResult=result.firstElementChild;
 }
 new MutationObserver(compact).observe($('lab-result'),{childList:true});
 document.addEventListener('forma:mode',()=>{document.body.dataset.topic=FormaApp.mode;});$('language-toggle').addEventListener('click',()=>queueMicrotask(labels));labels();compact();
 function solidAnswer(model){if(FormaApp.mode!=='geometry-lab')return;const row=$('lab-result').querySelector('.studio-primary-answer');if(row)row.textContent=(model.variant==='net'?t('Surface area','পৃষ্ঠের ক্ষেত্রফল'):t('Volume','আয়তন'))+' ≈ '+FormaMath.format(model.variant==='net'?model.surface:model.volume)+' '+model.unit+(model.variant==='net'?'²':'³');}
 window.FormaStudio={compact,solidAnswer};
})();
