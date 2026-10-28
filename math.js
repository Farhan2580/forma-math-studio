(function(root){
  'use strict';
  const finite=(n)=>{if(!Number.isFinite(n))throw Error('Please use finite numbers.');return n;};
  const format=(n)=>Number.isInteger(n)?String(n):Number(n.toPrecision(10)).toString();
  function arithmetic(a,b,op){finite(a);finite(b);if(op==='/'&&b===0)throw Error('Division by zero is undefined. Try another number.');const operations={'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b};if(!Object.prototype.hasOwnProperty.call(operations,op))throw Error('Choose a valid operation.');return finite(operations[op]());}
  function percentage(p,n){finite(p);finite(n);return finite(p/100*n);}
  function equation(a,b,c){finite(a);finite(b);finite(c);if(a===0)return {kind:b===c?'infinite':'none'};return {kind:'unique',x:finite((c-b)/a),difference:finite(c-b)};}
  function circle(r){finite(r);if(r<0)throw Error('Radius cannot be negative.');return {area:finite(Math.PI*r*r),circumference:finite(2*Math.PI*r)};}
  function quadratic(a,b,c){
    finite(a);finite(b);finite(c);
    if(a===0)return {kind:b===0?'constant':'linear',vertex:null,roots:b===0?[]:[finite(-c/b)],allRoots:b===0&&c===0};
    const scale=Math.max(Math.abs(a),Math.abs(b),Math.abs(c));
    const A=a/scale,B=b/scale,C=c/scale;
    const discriminant=finite(B*B-4*A*C),vx=finite((-b/a)/2);
    const vertex={x:vx,y:finite(c+(b/2)*vx)};
    let roots=[];
    if(discriminant===0)roots=[vx];
    else if(discriminant>0){
      // This form avoids cancellation when one root is close to zero.
      const q=-0.5*(B+(B>=0?1:-1)*Math.sqrt(discriminant));
      roots=[finite(q/A),finite(C/q)].sort((x,y)=>x-y);
    }
    return {kind:'quadratic',vertex,roots,allRoots:false};
  }
  const api={format,arithmetic,percentage,equation,circle,quadratic};root.FormaMath=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
