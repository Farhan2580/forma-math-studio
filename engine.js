(function(){
  'use strict';
  const fail=message=>{throw Error(message);},finite=n=>Number.isFinite(n)?n:fail('Overflow or undefined result. Use smaller values.');
  const num=n=>({type:'number',value:n}),op=(name,left,right)=>({type:'op',name,left,right}),call=(name,...args)=>({type:'call',name,args});
  const arity={sin:1,cos:1,tan:1,asin:1,acos:1,atan:1,sqrt:1,cbrt:1,root:2,abs:1,ln:1,log10:1,log:2,exp:1,pow10:1,fact:1,npr:2,ncr:2};
  function parse(source){
    if(typeof source!=='string'||source.length>800)fail('Expression must contain 1–800 characters.');
    source=source.replace(/π/g,'pi').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/²/g,'^2').replace(/³/g,'^3');
    const tokens=[];let position=0;
    while(position<source.length){
      const rest=source.slice(position);let match;
      if(/^\s/.test(rest)){position++;continue;}
      if((match=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/))){const value=Number(match[0]);finite(value);tokens.push({type:'number',value});position+=match[0].length;}
      else if((match=rest.match(/^[a-zA-Z][a-zA-Z0-9]*/))){tokens.push({type:'name',value:match[0].toLowerCase()});position+=match[0].length;}
      else if('+-*/^!%(),'.includes(rest[0])){tokens.push({type:rest[0]});position++;}
      else fail('Unknown character at position '+(position+1)+'.');
      if(tokens.length>350)fail('Expression is too complex.');
    }
    let index=0,depth=0;const peek=()=>tokens[index]?.type,accept=t=>peek()===t?(index++,true):false;
    const expect=t=>{if(!accept(t))fail('Expected '+t+'. Check parentheses and commas.');};
    function expression(min=0){
      if(++depth>70)fail('Too many nested operations.');
      const token=tokens[index++];if(!token)fail('Expression is incomplete.');let left;
      if(token.type==='number')left=num(token.value);
      else if(token.type==='+'||token.type==='-')left=token.type==='-'?op('neg',expression(25)):expression(25);
      else if(token.type==='('){left=expression();expect(')');}
      else if(token.type==='name'){
        if(Object.prototype.hasOwnProperty.call(arity,token.value)){
          expect('(');const args=[expression()];while(accept(','))args.push(expression());expect(')');
          if(args.length!==arity[token.value])fail(token.value+' needs '+arity[token.value]+' argument(s).');
          left=call(token.value,...args);
        }else if(['pi','e','ans','x','a','b','c'].includes(token.value))left={type:'variable',name:token.value};
        else fail('Unknown name: '+token.value+'. Use the supported functions.');
      }else fail('Expected a number, function, or opening parenthesis.');
      while(index<tokens.length){
        const type=peek();
        if((type==='!'||type==='%')&&40>=min){index++;left=type==='!'?call('fact',left):op('/',left,num(100));continue;}
        const implicit=type==='number'||type==='name'||type==='(';
        const name=implicit?'*':type,priority={'+':10,'-':10,'*':20,'/':20,'^':30}[name];
        if(priority===undefined||priority<min)break;
        if(!implicit)index++;
        left=op(name,left,expression(name==='^'?priority:priority+1));
      }
      depth--;return left;
    }
    const tree=expression();if(index!==tokens.length)fail('Unexpected token. Check parentheses or operators.');return tree;
  }
  function factorial(n){if(!Number.isInteger(n)||n<0||n>170)fail('Factorial needs an integer from 0 to 170.');let result=1;for(let i=2;i<=n;i++)result*=i;return finite(result);}
  function combinations(n,r,permutation){
    if(!Number.isSafeInteger(n)||!Number.isSafeInteger(r)||n<0||r<0||r>n||n>100000)fail('nPr/nCr need integers with 0 ≤ r ≤ n ≤ 100000.');
    if(!permutation)r=Math.min(r,n-r);let result=1;
    for(let i=1;i<=r;i++)result=finite(result*(n-i+1)/(permutation?1:i));return result;
  }
  function evaluate(tree,variables={},angle='RAD'){
    function walk(node){
      if(node.type==='number')return node.value;
      if(node.type==='variable'){
        if(node.name==='pi')return Math.PI;if(node.name==='e')return Math.E;
        if(Object.prototype.hasOwnProperty.call(variables,node.name))return finite(variables[node.name]);
        fail('Provide a value for '+node.name+'.');
      }
      if(node.type==='op'){
        const a=walk(node.left);if(node.name==='neg')return -a;const b=walk(node.right);
        if(node.name==='/ '||node.name==='/'){if(b===0)fail('Division by zero is undefined.');return finite(a/b);}
        return finite(({'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'^':()=>Math.pow(a,b)})[node.name]());
      }
      const args=node.args.map(walk),a=args[0],b=args[1],radians=angle==='DEG'?a*Math.PI/180:a,fromRad=x=>angle==='DEG'?x*180/Math.PI:x;
      let result;
      switch(node.name){
        case 'sin':result=Math.sin(radians);break;case 'cos':result=Math.cos(radians);break;
        case 'tan':if(Math.abs(Math.cos(radians))<1e-14)fail('tan is undefined at this angle.');result=Math.tan(radians);break;
        case 'asin':case 'acos':if(Math.abs(a)>1)fail('Inverse sine/cosine needs a value between −1 and 1.');result=fromRad(node.name==='asin'?Math.asin(a):Math.acos(a));break;
        case 'atan':result=fromRad(Math.atan(a));break;
        case 'sqrt':if(a<0)fail('Square root needs a non-negative real number.');result=Math.sqrt(a);break;
        case 'cbrt':result=Math.cbrt(a);break;
        case 'root':if(!Number.isInteger(b)||b<=0)fail('root(value, n) needs a positive integer n.');if(a<0&&b%2===0)fail('Even roots of negative numbers are not real.');result=(a<0?-1:1)*Math.pow(Math.abs(a),1/b);break;
        case 'abs':result=Math.abs(a);break;
        case 'ln':case 'log10':if(a<=0)fail('Logarithms need a positive argument.');result=node.name==='ln'?Math.log(a):Math.log10(a);break;
        case 'log':if(a<=0||b<=0||b===1)fail('log(value, base) needs value > 0 and base > 0, base ≠ 1.');result=Math.log(a)/Math.log(b);break;
        case 'exp':result=Math.exp(a);break;case 'pow10':result=10**a;break;
        case 'fact':result=factorial(a);break;
        case 'npr':case 'ncr':result=combinations(a,b,node.name==='npr');break;
        default:fail('Unsupported function.');
      }
      return finite(result);
    }
    return finite(walk(tree));
  }
  function text(node){
    if(node.type==='number')return String(node.value);
    if(node.type==='variable')return node.name;
    if(node.type==='call')return node.name+'('+node.args.map(text).join(', ')+')';
    if(node.name==='neg')return '(-'+text(node.left)+')';
    return '('+text(node.left)+' '+node.name+' '+text(node.right)+')';
  }
  function simplify(node){
    if(node.type==='number'||node.type==='variable')return node;
    if(node.type==='call'){const args=node.args.map(simplify);if(args.every(n=>n.type==='number'))return num(evaluate({...node,args}));return {...node,args};}
    const left=simplify(node.left),right=node.right?simplify(node.right):null;
    const is=(x,n)=>x?.type==='number'&&x.value===n;
    if(left.type==='number'&&(!right||right.type==='number'))return num(evaluate({...node,left,right}));
    if(node.name==='+'&&is(right,0)||node.name==='-'&&is(right,0)||node.name==='*'&&is(right,1)||node.name==='/'&&is(right,1)||node.name==='^'&&is(right,1))return left;
    if(node.name==='+'&&is(left,0)||node.name==='*'&&is(left,1))return right;
    // Do not turn 0/f(x) into 0: that would silently discard domain holes.
    return {...node,left,right};
  }
  function derivative(node){
    const d=n=>derivative(n),binary=(o,a,b)=>op(o,a,b),mul=(a,b)=>binary('*',a,b),add=(a,b)=>binary('+',a,b);
    let result;
    if(node.type==='number'||node.type==='variable'&&node.name!=='x')result=num(0);
    else if(node.type==='variable')result=num(1);
    else if(node.type==='op'){
      const u=node.left,v=node.right;
      if(node.name==='neg')result=op('neg',d(u));
      else if(node.name==='+'||node.name==='-')result=binary(node.name,d(u),d(v));
      else if(node.name==='*')result=add(mul(d(u),v),mul(u,d(v)));
      else if(node.name==='/')result=binary('/',binary('-',mul(d(u),v),mul(u,d(v))),binary('^',v,num(2)));
      else if(node.name==='^'){
        if(v.type!=='number')fail('Symbolic derivative supports constant powers only.');
        result=v.value===0?num(0):v.value===1?d(u):mul(mul(v,binary('^',u,num(v.value-1))),d(u));
      }
    }else{
      const u=node.args[0];let outer;
      switch(node.name){
        case 'sin':outer=call('cos',u);break;case 'cos':outer=op('neg',call('sin',u));break;
        case 'tan':outer=op('/',num(1),op('^',call('cos',u),num(2)));break;
        case 'exp':outer=call('exp',u);break;
        case 'ln':outer=op('/',num(1),u);break;
        case 'log10':outer=op('/',num(1),op('*',u,call('ln',num(10))));break;
        case 'sqrt':outer=op('/',num(.5),call('sqrt',u));break;
        case 'cbrt':outer=op('/',num(1),op('*',num(3),op('^',call('cbrt',u),num(2))));break;
        default:fail('Symbolic differentiation does not support '+node.name+'. No symbolic steps were generated.');
      }
      result=mul(outer,d(u));
    }
    if(!result)fail('Derivative is unsupported.');return simplify(result);
  }
  function polynomial(tree){
    const trim=p=>{while(p.length>1&&p.at(-1)===0)p.pop();if(p.length>13)fail('Polynomial degree must be at most 12.');return p;};
    const add=(a,b,sign=1)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>finite((a[i]||0)+sign*(b[i]||0))));
    const mul=(a,b)=>{const p=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>p[i+j]=finite(p[i+j]+x*y)));return trim(p);};
    function walk(n){
      if(n.type==='number')return [n.value];
      if(n.type==='variable'){if(n.name==='x')return [0,1];if(n.name==='pi'||n.name==='e')return [evaluate(n)];fail('Polynomial supports x, π and e only.');}
      if(n.type!=='op')fail('Only polynomial expressions are supported here.');
      const a=walk(n.left);if(n.name==='neg')return a.map(x=>-x);const b=walk(n.right);
      if(n.name==='+'||n.name==='-')return add(a,b,n.name==='+'?1:-1);
      if(n.name==='*')return mul(a,b);
      if(n.name==='/'&&b.length===1&&b[0]!==0)return a.map(x=>finite(x/b[0]));
      if(n.name==='^'&&b.length===1&&Number.isInteger(b[0])&&b[0]>=0&&b[0]<=12){let p=[1];for(let i=0;i<b[0];i++)p=mul(p,a);return p;}
      fail('Use powers 0–12 and divide by nonzero constants only.');
    }
    return walk(tree);
  }
  function fraction(value){
    finite(value);if(Math.abs(value)>1e12)return null;
    const sign=value<0?-1:1,x=Math.abs(value);let a=x,h0=0,h1=1,k0=1,k1=0;
    for(let i=0;i<40;i++){
      const whole=Math.floor(a),h=whole*h1+h0,k=whole*k1+k0;
      if(k>1000000||!Number.isSafeInteger(h))break;
      if(Math.abs(h/k-x)<1e-12*Math.max(1,x))return {numerator:sign*h,denominator:k,approximate:Math.abs(sign*h/k-value)>0};
      h0=h1;h1=h;k0=k1;k1=k;if(a===whole)break;a=1/(a-whole);
    }
    return null;
  }
  window.FormaEngine={parse,evaluate,calculate:(source,vars,angle)=>evaluate(parse(source),vars,angle),text,simplify,derivative,polynomial,fraction,finite};
})();
