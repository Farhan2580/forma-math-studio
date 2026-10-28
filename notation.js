(function(){
  'use strict';
  const E=window.FormaEngine,originalParse=E.parse,cache=new Map(),ns='http://www.w3.org/1998/Math/MathML';
  function parse(source){if(cache.has(source))return cache.get(source);const ast=originalParse(source);cache.set(source,ast);if(cache.size>80)cache.delete(cache.keys().next().value);return ast;}
  E.parse=parse;
  const element=(tag,...children)=>{const node=document.createElementNS(ns,tag);for(const child of children)node.append(typeof child==='string'?document.createTextNode(child):child);return node;};
  function tree(n){
    if(n.type==='number')return element('mn',String(n.value));
    if(n.type==='variable')return element('mi',n.name==='pi'?'π':n.name==='ans'?'Ans':n.name);
    if(n.type==='op'){
      if(n.name==='neg')return element('mrow',element('mo','−'),fence(n.left));
      if(n.name==='/')return element('mfrac',tree(n.left),tree(n.right));
      if(n.name==='^')return element('msup',fence(n.left),tree(n.right));
      return element('mrow',fence(n.left),element('mo',n.name==='*'?'×':n.name==='-'?'−':n.name),fence(n.right));
    }
    if(n.name==='sqrt')return element('msqrt',tree(n.args[0]));
    if(n.name==='cbrt')return element('mroot',tree(n.args[0]),element('mn','3'));
    if(n.name==='root')return element('mroot',tree(n.args[0]),tree(n.args[1]));
    if(n.name==='abs')return element('mrow',element('mo','|'),tree(n.args[0]),element('mo','|'));
    if(n.name==='fact')return element('mrow',fence(n.args[0]),element('mo','!'));
    const args=[];n.args.forEach((arg,i)=>{if(i)args.push(element('mo',','));args.push(tree(arg));});
    return element('mrow',element('mi',n.name),element('mo','('),...args,element('mo',')'));
  }
  function fence(n){return n.type==='op'&&n.name!=='/'&&n.name!=='^'?element('mrow',element('mo','('),tree(n),element('mo',')')):tree(n);}
  function render(container,ast){const math=element('math',tree(ast));math.setAttribute('display','block');math.setAttribute('aria-label',E.text(ast));container.replaceChildren(math);}
  function equation(container,leftSource,rightSource){const left=parse(leftSource),right=parse(rightSource),math=element('math',tree(left),element('mo','='),tree(right));math.setAttribute('display','block');math.setAttribute('aria-label',E.text(left)+' = '+E.text(right));container.replaceChildren(math);}
  function preview(field,container){try{if(!field.value.trim()){container.replaceChildren();return null;}const ast=parse(field.value);render(container,ast);return ast;}catch{container.textContent=document.documentElement.lang==='bn'?'সঠিক রাশি লিখলে এখানে গাণিতিক চিত্র দেখাবে।':'Complete the expression to see its math preview.';return null;}}
  // Only integer-only rational expressions can receive an exact-integer badge.
  function rational(n){
    if(n.type==='number'){if(!Number.isSafeInteger(n.value))throw Error();return [BigInt(n.value),1n];}
    if(n.type!=='op')throw Error();const [a,b]=rational(n.left);if(n.name==='neg')return [-a,b];const [c,d]=rational(n.right);let p,q;
    if(n.name==='+'){p=a*d+c*b;q=b*d;}else if(n.name==='-'){p=a*d-c*b;q=b*d;}else if(n.name==='*'){p=a*c;q=b*d;}else if(n.name==='/'){p=a*d;q=b*c;}else if(n.name==='^'&&d===1n&&c>=0n&&c<=20n){p=a**c;q=b**c;}else throw Error();
    if(q===0n||p.toString().length>400||q.toString().length>400)throw Error();return [p,q];
  }
  function classify(ast,value){try{const [p,q]=rational(ast);if(p%q===0n&&Number.isSafeInteger(value)&&BigInt(value)===p/q)return 'exact';}catch{}return 'approximate';}
  window.FormaNotation={parse,render,equation,preview,classify};
})();
