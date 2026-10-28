(function(){
  'use strict';
  const $=id=>document.getElementById(id),F=window.FormaFeedback,N=window.FormaNotation;
  const tr=(en,bn)=>document.documentElement.lang==='bn'?bn:en;
  const tools={scientific:['Scientific Calculator','বৈজ্ঞানিক ক্যালকুলেটর','Expressions, functions, memory and history.','রাশি, ফাংশন, মেমরি ও হিসাবের ইতিহাস।'],basic:['Arithmetic','পাটিগণিত','Add, subtract, multiply or divide. Follow what the numbers mean.','যোগ, বিয়োগ, গুণ বা ভাগের অর্থ ধাপে ধাপে দেখুন।'],percentage:['Percentage','শতকরা','Find a share, increase or decrease a value.','কোনো অংশ বা শতকরা বৃদ্ধি–হ্রাস বের করুন।'],graph:['Graph Explorer','গ্রাফ এক্সপ্লোরার','Compare functions and explore their shape.','ফাংশনের তুলনা করুন ও তাদের আকার দেখুন।'],algebra:['Linear balance','সরল সমীকরণের ভারসাম্য','Follow both sides of a linear equation.','সরল সমীকরণের দুই পাশ অনুসরণ করুন।'],'algebra-lab':['Algebra Lab','বীজগণিত ল্যাব','Equations, systems and supported polynomial tools.','সমীকরণ, সমীকরণজোড়া ও সমর্থিত বহুপদীর হিসাব।'],geometry:['Circle','বৃত্ত','Explore radius, area and circumference.','ব্যাসার্ধ, ক্ষেত্রফল ও পরিধি দেখুন।'],'geometry-lab':['Geometry Lab','জ্যামিতি ল্যাব','Labeled shapes, formulas and consistent units.','চিহ্নিত আকার, সূত্র ও সামঞ্জস্যপূর্ণ একক।'],calculus:['Calculus','ক্যালকুলাস','Supported derivatives, tangents and proper definite integrals.','সমর্থিত অন্তরক, স্পর্শক ও সসীম নির্দিষ্ট সমাকলন।'],statistics:['Statistics','পরিসংখ্যান','Summaries, distributions and paired observations.','তথ্যের সারাংশ, বণ্টন ও জোড়া পর্যবেক্ষণ।'],matrix:['Matrix & Vector','ম্যাট্রিক্স ও ভেক্টর','Small matrices, systems and vector arithmetic.','ছোট ম্যাট্রিক্স, সমীকরণজোড়া ও ভেক্টরের হিসাব।'],tools:['Number & Units','সংখ্যা ও একক','Integer tools, bases and fixed unit conversions.','পূর্ণসংখ্যা, ভিত্তি ও স্থির একক রূপান্তর।']};
  tools.fraction=['Fraction Lab','ভগ্নাংশ ল্যাব','Exact fractions, common denominators, area and measurement.','নির্ভুল ভগ্নাংশ, সাধারণ হর, ক্ষেত্রফল ও মাপ।'];
  tools.trig=['Trigonometry Lab','ত্রিকোণমিতি ল্যাব','Explore a unit circle, signed projections and linked trigonometric graphs.','একক বৃত্ত, চিহ্নযুক্ত projection ও সংযুক্ত ত্রিকোণমিতির গ্রাফ দেখুন।'];
  tools.coordinates=['Coordinate Geometry','স্থানাঙ্ক জ্যামিতি','Drag points and connect coordinates to distances, slopes and lines.','বিন্দু সরিয়ে স্থানাঙ্কের সঙ্গে দূরত্ব, ঢাল ও রেখার সম্পর্ক দেখুন।'];
  tools.sequences=['Sequence & Series','ধারা ও যোগফল','Build arithmetic/geometric terms and explain finite or convergent infinite sums.','সমান্তর/গুণোত্তর পদ, সসীম যোগ ও অসীম ধারার convergence দেখুন।'];
  tools.probability=['Probability Lab','সম্ভাবনা ল্যাব','Compare fair-model theory with independent recorded trials and exact counting.','সুষম model-এর theory, স্বাধীন trial ও নির্ভুল গণনা তুলনা করুন।'];
  tools.complex=['Complex Number Plane','জটিল সংখ্যার সমতল','Explore complex arrows, reflections, magnitude and rotation.','জটিল সংখ্যার তীর, প্রতিফলন, modulus ও ঘূর্ণন দেখুন।'];
  const groups=[['Calculator','ক্যালকুলেটর',['scientific','basic','percentage','fraction']],['Graphs','গ্রাফ',['graph','trig']],['Algebra','বীজগণিত',['algebra-lab','algebra','complex']],['Geometry','জ্যামিতি',['geometry-lab','geometry','coordinates']],['Calculus','ক্যালকুলাস',['calculus']],['Statistics','পরিসংখ্যান',['statistics','probability']],['Matrix & Vector','ম্যাট্রিক্স ও ভেক্টর',['matrix']],['Number & Units','সংখ্যা ও একক',['tools','sequences']]];
  const sidebar=document.createElement('aside');sidebar.id='tool-sidebar';sidebar.setAttribute('aria-label','Tool navigation');
  const brand=document.querySelector('.brand');sidebar.append(brand);
  const searchLabel=document.createElement('label');searchLabel.htmlFor='tool-search';searchLabel.textContent='Search tools';
  const search=document.createElement('input');search.type='search';search.id='tool-search';search.autocomplete='off';search.setAttribute('aria-controls','tool-search-results');
  const searchResults=document.createElement('ul');searchResults.id='tool-search-results';searchResults.hidden=true;searchResults.setAttribute('aria-label','Tool search results');
  sidebar.append(searchLabel,search,searchResults);
  const nav=document.querySelector('nav');nav.replaceChildren(...groups.map(([en,bn,modes])=>{
    const group=document.createElement('div');group.className='tool-group';const heading=document.createElement('p');heading.textContent=en;group.append(heading);
    modes.forEach(mode=>{const button=document.createElement('button');button.type='button';button.dataset.mode=mode;const label=document.createElement('span');label.textContent=tools[mode][0];button.append(label);button.addEventListener('click',()=>{FormaApp.selectMode(mode);closeDrawer();});group.append(button);});return group;
  }));sidebar.append(nav);document.body.prepend(sidebar);
  const topbar=document.querySelector('header');topbar.className='app-topbar';
  topbar.querySelector('.tag')?.remove();topbar.querySelector('.version')?.remove();
  const menu=document.createElement('button');menu.id='menu-toggle';menu.type='button';menu.textContent='☰ Tools';menu.setAttribute('aria-controls','tool-sidebar');menu.setAttribute('aria-expanded','false');topbar.prepend(menu);
  const appName=document.createElement('span');appName.className='app-name';appName.textContent='Forma · Math Lab';menu.after(appName);
  const backdrop=document.createElement('button');backdrop.id='sidebar-backdrop';backdrop.type='button';backdrop.hidden=true;backdrop.setAttribute('aria-label','Close tool navigation');document.body.append(backdrop);
  document.querySelector('.intro').hidden=true;
  const toolbar=document.createElement('section');toolbar.className='tool-toolbar';toolbar.innerHTML='<div class="tool-heading"><p class="eyebrow">FORMA WORKSPACE</p><h1 id="active-tool-title"></h1><p id="active-tool-description"></p></div><div class="tool-actions"><button id="tool-example" type="button">Try an example</button><button id="tool-reset" type="button">Reset</button><button id="copy-answer" type="button" disabled>Copy answer</button></div><div class="view-switch" role="group" aria-label="Workspace view"><button id="view-quick" aria-pressed="false" type="button">Quick Calculate</button><button id="view-learn" aria-pressed="true" type="button">Learn Visually</button></div><span id="answer-accuracy" role="status"></span><span id="copy-feedback" role="status" aria-live="polite"></span><p id="visual-availability" class="lab-note" hidden></p>';
  document.querySelector('main').prepend(toolbar);
  let current=FormaApp.mode,view='learn',drawer=false,previousFocus=null;
  const mobile=matchMedia('(max-width: 900px)');
  function closeDrawer(){drawer=false;document.body.classList.remove('drawer-open');menu.setAttribute('aria-expanded','false');backdrop.hidden=true;if(mobile.matches){if(sidebar.contains(document.activeElement))menu.focus();sidebar.inert=true;}}
  function openDrawer(){drawer=true;previousFocus=document.activeElement;sidebar.inert=false;document.body.classList.add('drawer-open');menu.setAttribute('aria-expanded','true');backdrop.hidden=false;search.focus();}
  menu.addEventListener('click',()=>drawer?closeDrawer():openDrawer());backdrop.addEventListener('click',()=>{closeDrawer();previousFocus?.focus();});
  function responsive(){if(mobile.matches)closeDrawer();else{closeDrawer();sidebar.inert=false;}}mobile.addEventListener('change',responsive);responsive();
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){searchResults.hidden=true;if(drawer){event.preventDefault();closeDrawer();menu.focus();}}
    if(drawer&&event.key==='Tab'){const candidates=[...sidebar.querySelectorAll('button,input,a')].filter(el=>!el.disabled&&el.getClientRects().length);const first=candidates[0],last=candidates.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  });
  const searchItems=Object.entries(tools).map(([mode,data])=>({mode,en:data[0],bn:data[1]})).concat([
    {mode:'scientific',en:'Trigonometry · sin cos tan',bn:'ত্রিকোণমিতি · সাইন কোসাইন ট্যান',field:'sci-expression',value:'sin(30)'},
    {mode:'scientific',en:'Fractions and decimal calculator',bn:'ভগ্নাংশ ও দশমিক ক্যালকুলেটর',field:'sci-expression',value:'1/3 + 1/6'},
    {mode:'scientific',en:'Powers and roots · sqrt nth root',bn:'ঘাত ও মূল · বর্গমূল',field:'sci-expression',value:'root(32, 5)'},
    {mode:'scientific',en:'Logarithms · log ln',bn:'লগারিদম',field:'sci-expression',value:'log(8, 2)'},
    {mode:'algebra-lab',en:'Quadratic equation · complex roots',bn:'দ্বিঘাত সমীকরণ · জটিল মূল',field:'algebra-tool',value:'quadratic'},
    {mode:'algebra-lab',en:'Simultaneous equations',bn:'দুই চলকের সমীকরণজোড়া',field:'algebra-tool',value:'simultaneous'},
    {mode:'algebra-lab',en:'Polynomial factorization',bn:'বহুপদীর উৎপাদক বিশ্লেষণ',field:'algebra-tool',value:'factor'},
    {mode:'calculus',en:'Definite integral · signed area',bn:'নির্দিষ্ট সমাকলন · ক্ষেত্রফল',field:'calc-tool',value:'integral'},
    {mode:'matrix',en:'Matrix inverse',bn:'বিপরীত ম্যাট্রিক্স',field:'matrix-operation',value:'inverse'},
    {mode:'matrix',en:'Dot and cross product',bn:'ডট ও ক্রস গুণফল',field:'matrix-operation',value:'vector'},
    {mode:'tools',en:'Unit conversion',bn:'একক রূপান্তর',field:'number-tool',value:'unit'},
    {mode:'tools',en:'Binary hexadecimal base conversion',bn:'বাইনারি হেক্সাডেসিম্যাল ভিত্তি রূপান্তর',field:'number-tool',value:'base'},
    {mode:'geometry-lab',en:'Triangle area · Heron',bn:'ত্রিভুজের ক্ষেত্রফল · হেরন',field:'geo-shape',value:'triangle'},
    {mode:'statistics',en:'Mean median mode and variance',bn:'গড় মধ্যক প্রচুরক ভেদাঙ্ক'},
    ...['sin','cos','tan','exp','ln','sqrt','abs'].map(family=>({mode:'graph',en:family+' graph',bn:family+' গ্রাফ',field:'graph-family',value:family})),
    ...['rectangle','square','trapezoid','cube','cuboid','cylinder','cone','sphere'].map(shape=>({mode:'geometry-lab',en:shape+' area volume',bn:shape+' ক্ষেত্রফল আয়তন',field:'geo-shape',value:shape}))
  ]);
  function choose(id,value){$(id).value=value;$(id).dispatchEvent(new Event('change',{bubbles:true}));}
  function searchTools(){const query=search.value.trim().toLowerCase();searchResults.replaceChildren();searchResults.hidden=!query;if(!query)return;const items=searchItems.filter(item=>(item.en+' '+item.bn).toLowerCase().includes(query)).slice(0,10);if(!items.length){const li=document.createElement('li');li.textContent=tr('No matching tools','মিলে এমন টুল পাওয়া যায়নি');searchResults.append(li);}for(const item of items){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=tr(item.en,item.bn);button.addEventListener('click',()=>{FormaApp.selectMode(item.mode);if(item.field)choose(item.field,item.value);search.value='';searchResults.hidden=true;closeDrawer();$('active-tool-title').focus();});li.append(button);searchResults.append(li);}}
  search.addEventListener('input',searchTools);search.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();searchResults.querySelector('button')?.focus();}if(event.key==='Enter'){event.preventDefault();searchResults.querySelector('button')?.click();}});
  $('active-tool-title').tabIndex=-1;
  function root(){return current==='scientific'?$('scientific'):current==='graph'?$('graph-explorer'):Object.hasOwn(FormaLabs.titles,current)?$('lab-hub'):document.querySelector('.workspace');}
  function updateHeader(){
    menu.textContent=tr('☰ Tools','☰ টুলসমূহ');search.setAttribute('aria-label',tr('Search tools','টুল খুঁজুন'));nav.setAttribute('aria-label',tr('Tool navigation','টুলের তালিকা'));backdrop.setAttribute('aria-label',tr('Close tool navigation','টুলের তালিকা বন্ধ করুন'));$('input-math-preview').setAttribute('aria-label',tr('Formatted expression','সাজানো গাণিতিক রাশি'));
    const item=tools[current];$('active-tool-title').textContent=tr(item[0],item[1]);$('active-tool-description').textContent=tr(item[2],item[3]);
    nav.querySelectorAll('[data-mode]').forEach(button=>{button.classList.toggle('active',button.dataset.mode===current);button.setAttribute('aria-pressed',String(button.dataset.mode===current));if(button.dataset.mode===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    const unavailable=current==='scientific';$('visual-availability').hidden=view!=='learn'||!unavailable;
    $('visual-availability').textContent=tr('No visual lesson is available for scientific expressions yet. The formatted expression and result are shared by both views. Arithmetic and Percentage have complete interactive lessons.','বৈজ্ঞানিক রাশির চিত্রভিত্তিক পাঠ এখনো নেই। দুই view-তেই একই রাশি ও ফলাফল থাকে। পাটিগণিত ও শতকরায় সম্পূর্ণ ইন্টার‌্যাক্টিভ পাঠ আছে।');
    $('copy-feedback').textContent='';updateResult();refreshPreviews();
  }
  function updateResult(){
    const result=F.results.get(current);const labels={exact:['Exact integer / exact representation','নির্ভুল পূর্ণসংখ্যা / প্রকাশ'],approximate:['Approximate · floating-point arithmetic','আনুমানিক · ফ্লোটিং-পয়েন্ট হিসাব'],unsupported:['Unsupported for this tool','এই টুলে অসমর্থিত'],invalid:['Check the input','ইনপুট পরীক্ষা করুন'],pending:['Calculate to update the answer','ফলাফল পেতে হিসাব করুন']};
    const accuracy=result?.accuracy||'pending';$('answer-accuracy').textContent=tr(...labels[accuracy]);$('answer-accuracy').dataset.kind=accuracy;$('copy-answer').disabled=!result?.answer||['pending','invalid','unsupported'].includes(accuracy);
  }
  document.addEventListener('forma:result',event=>{if(event.detail.mode===current)updateResult();});
  document.addEventListener('forma:mode',event=>{current=event.detail.mode;document.body.dataset.tool=current;updateHeader();});
  function setView(next){FormaAnimation.cancelAll();FormaGraph.pause?.();view=next;document.body.dataset.view=view;$('view-quick').setAttribute('aria-pressed',String(view==='quick'));$('view-learn').setAttribute('aria-pressed',String(view==='learn'));updateHeader();}
  $('view-quick').addEventListener('click',()=>setView('quick'));$('view-learn').addEventListener('click',()=>setView('learn'));
  $('copy-answer').addEventListener('click',async()=>{const result=F.results.get(current);if(!result?.answer)return;try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(result.answer);$('copy-feedback').textContent=tr('Answer copied','উত্তর কপি হয়েছে');}catch{$('copy-feedback').textContent=tr('Copy failed. Select the answer and copy it manually.','কপি হয়নি। উত্তর বেছে নিজে কপি করুন।');}});
  function set(id,value){$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}));}
  function reset(){FormaAnimation.cancelAll();FormaApp.selectMode(current);if(current==='scientific')FormaScientific.reset();if(current==='graph'){window.FormaGraphTeaching?.reset();choose('graph-family','quadratic');set('graph-a',1);set('graph-b',0);set('graph-c',0);$('graph-functions').value='a*x^2+b*x+c';$('graph-reset').click();}root().querySelectorAll('[aria-invalid]').forEach(F.clear);refreshPreviews();}
  $('tool-reset').addEventListener('click',reset);
  $('tool-example').addEventListener('click',()=>{
    reset();
    if(current==='basic'){set('a',-3);set('b',5);choose('op','+');$('calculate').click();}
    else if(current==='percentage'){set('p',12.5);set('n',240);choose('percent-kind','increase');$('calculate').click();}
    else if(current==='scientific'){set('sci-expression','(1/3 + 1/6)^2');FormaScientific.calculate();}
    else if(current==='graph'){set('graph-functions','sin(x)\nx/2');$('graph-plot').click();}
    else if(current==='algebra'){set('a',3);set('b',-6);set('c',9);$('calculate').click();}
    else if(current==='geometry'){set('radius',8);$('calculate').click();}
    else{
      if(current==='algebra-lab')choose('algebra-tool','quadratic');
      if(current==='geometry-lab'){choose('geo-shape','triangle');set('geo-a',3);set('geo-b',4);set('geo-c',5);}
      if(current==='calculus')choose('calc-tool','integral');
      if(current==='statistics'){set('stats-values','1, 2, 3, 4');set('stats-paired','3, 5, 7, 9');}
      if(current==='tools'){choose('number-tool','unit');choose('unit-category','temperature');set('unit-value',32);choose('unit-from','°F');choose('unit-to','°C');}
      $('lab-calculate').click();
    }
    refreshPreviews();
  });
  function refreshPreviews(){
    for(const id of ['sci-expression','alg-expression','calc-function','graph-functions']){
      const field=$(id);if(!field)continue;let preview=id==='sci-expression'?$('sci-preview'):$(id+'-preview');if(!preview){preview=document.createElement('div');preview.id=id+'-preview';preview.className='math-preview';preview.setAttribute('aria-label','Formatted expression');field.after(preview);}
      preview.setAttribute('aria-label',tr('Formatted expression','সাজানো গাণিতিক রাশি'));if(preview.dataset.source===field.value)continue;preview.dataset.source=field.value;
      if(id==='graph-functions'){
        preview.replaceChildren();for(const source of field.value.split('\n').filter(Boolean).slice(0,3)){const part=document.createElement('div');preview.append(part);try{N.render(part,N.parse(source));}catch{part.textContent=tr('Complete the expression','রাশিটি সম্পূর্ণ করুন');}}
      }else N.preview(field,preview);
    }
  }
  document.addEventListener('input',event=>{if(root().contains(event.target)&&!event.target.closest('.shared-player')&&event.target.type!=='range')$('copy-feedback').textContent='';queueMicrotask(refreshPreviews);});
  document.addEventListener('change',()=>queueMicrotask(refreshPreviews));
  document.addEventListener('click',()=>queueMicrotask(refreshPreviews));
  document.addEventListener('input',event=>{if(root().contains(event.target)&&!event.target.closest('.shared-player')&&!event.target.id.includes('speed')&&!event.target.closest('.graph-teaching'))F.publish(current,'','pending');},true);
  document.addEventListener('change',event=>{if(root().contains(event.target)&&event.target.tagName==='SELECT'&&!event.target.closest('.graph-teaching'))F.publish(current,'','pending');},true);
  $('language-toggle').addEventListener('click',()=>queueMicrotask(()=>{updateHeader();searchTools();}));
  document.body.dataset.tool=current;document.body.dataset.view='learn';updateHeader();
  window.FormaWorkbench={setView,reset,get mode(){return current;},get view(){return view;}};
})();
