(function(){
 'use strict';
 const $=id=>document.getElementById(id),t=(en,bn)=>document.documentElement.lang==='bn'?bn:en,num=n=>Number(n.toPrecision(15)).toString();
 function check(left,right,scale){const residual=left-right,tolerance=1e-9*Math.max(1,scale),finite=[left,right,residual,tolerance].every(Number.isFinite);return {left,right,residual,tolerance,finite,pass:finite&&Math.abs(residual)<=tolerance};}
 function linear(a,b,c,x){return {...check(a*x+b,c,Math.abs(a*x)+Math.abs(b)+Math.abs(c)),x};}
 function quadratic(a,b,c,x){return {...check((a*x+b)*x+c,0,Math.abs(a*x*x)+Math.abs(b*x)+Math.abs(c)),x};}
 function complex(a,b,c,re,im){const real=a*(re*re-im*im)+b*re+c,imag=2*a*re*im+b*im,tolerance=1e-9*Math.max(1,Math.abs(a)*(re*re+im*im)+Math.abs(b)*Math.hypot(re,im)+Math.abs(c)),residual=Math.hypot(real,imag),finite=[real,imag,tolerance,residual].every(Number.isFinite);return {left:real,right:0,imag,residual,tolerance,finite,pass:finite&&residual<=tolerance,x:`${num(re)} + (${num(im)})i`};}
 function nodeFor(mode){const id=mode==='algebra'?'linear-answer-check':'lab-answer-check';let node=$(id);if(!node){node=document.createElement('section');node.id=id;node.className='solution-verification';(mode==='algebra'?document.querySelector('.answer'):$('lab-result')).append(node);}return node;}
 function render(mode){
  if(!['algebra','algebra-lab'].includes(mode)||FormaApp.mode!==mode)return;const status=FormaFeedback.results.get(mode);if(!status||['invalid','pending','unsupported'].includes(status.accuracy)){$(mode==='algebra'?'linear-answer-check':'lab-answer-check')?.remove();return;}
  const tool=mode==='algebra'?'linear':$('algebra-tool')?.value;if(!['linear','quadratic'].includes(tool))return;
  const [a,b,c]=['a','b','c'].map(id=>Number($(mode==='algebra'?id:'alg-'+id).value));let checks=[],note='';
  try{
   if(tool==='linear'){const r=FormaMath.equation(a,b,c);if(r.kind==='unique')checks=[linear(a,b,c,r.x)];else note=`${b} = ${c}. `+(r.kind==='infinite'?t('Identical constants: every real x satisfies the equation.','একই ধ্রুবক: প্রতিটি বাস্তব x সমীকরণ মেলায়।'):t('Unequal constants: no x satisfies the equation.','অসমান ধ্রুবক: কোনো x সমীকরণ মেলায় না।'));}
   else{const r=FormaLabMath.quadratic(a,b,c);if(r.kind==='real')checks=r.roots.map(x=>quadratic(a,b,c,x));else if(r.kind==='complex')checks=[complex(a,b,c,r.real,r.imaginary),complex(a,b,c,r.real,-r.imaginary)];else if(r.solution.kind==='unique')checks=[quadratic(a,b,c,r.solution.x)];else note=r.solution.kind==='infinite'?t('Zero polynomial: every x satisfies 0=0.','শূন্য বহুপদী: সব x-এ ০=০।'):t('Nonzero constant: there is no solution.','শূন্য নয় এমন ধ্রুবক: সমাধান নেই।');}
   const host=nodeFor(mode);host.replaceChildren();const heading=document.createElement('h3');heading.textContent=t('Substitute into the original equation','মূল সমীকরণে বসিয়ে যাচাই');host.append(heading);
   for(const row of checks){const p=document.createElement('p');p.dataset.residual=row.residual;p.dataset.tolerance=row.tolerance;p.dataset.pass=String(row.pass);const x=typeof row.x==='number'?num(row.x):row.x;p.textContent=`x ≈ ${x}; `+t('left','বাম')+`=${num(row.left)}${row.imag===undefined?'':`+(${num(row.imag)})i`}; `+t('right','ডান')+`=${num(row.right)}; residual=${num(row.residual)}; tolerance=${num(row.tolerance)}. `+(row.finite?row.pass?t('Within tolerance.','সহনসীমার মধ্যে।'):t('VERIFICATION FAILED: outside tolerance.','যাচাই ব্যর্থ: সহনসীমার বাইরে।'):t('Not verifiable at this floating-point scale.','এই floating-point scale-এ যাচাই করা যায়নি।'));host.append(p);}
   const p=document.createElement('p');p.className='lab-note';p.textContent=note||t('Full-precision roots are substituted; only the display is rounded. Tolerance is 10⁻⁹ × max(1, sum of absolute term magnitudes). This is a numerical check, not a guaranteed symbolic proof.','পূর্ণ precision-এর মূল বসানো হয়েছে; শুধু প্রদর্শন গোল করা। সহনসীমা ১০⁻⁹ × max(১, প্রতিটি পদের পরিমাণের যোগ)। এটি সংখ্যাগত যাচাই, নিশ্চিত প্রতীকী প্রমাণ নয়।');host.append(p);
  }catch(error){const host=nodeFor(mode);host.textContent=t('Verification unavailable: ','যাচাই করা যায়নি: ')+error.message;}
 }
 document.addEventListener('forma:result',event=>render(event.detail.mode));$('language-toggle').addEventListener('click',()=>queueMicrotask(()=>render(FormaApp.mode)));
 document.addEventListener('forma:mode',()=>{$('linear-answer-check')?.remove();$('lab-answer-check')?.remove();render(FormaApp.mode);});
 window.FormaVerification={linear,quadratic,complex,check,render};render(FormaApp.mode);
})();
