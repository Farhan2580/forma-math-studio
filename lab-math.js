(function(){
  'use strict';
  const E=window.FormaEngine,F=E.finite,fail=s=>{throw Error(s);};
  const positive=(n,name)=>{F(n);if(n<=0)fail(name+' must be positive.');return n;};
  function matrix(A){if(!Array.isArray(A)||A.length<1||A.length>4||!Array.isArray(A[0])||A[0].length<1||A[0].length>4||A.some(row=>row.length!==A[0].length||row.some(x=>!Number.isFinite(x))))fail('Use a rectangular 1×1 to 4×4 matrix with finite numbers.');return A;}
  function transpose(A){matrix(A);return A[0].map((_,j)=>A.map(row=>row[j]));}
  function matrixOp(A,B,operation){
    matrix(A);matrix(B);
    if(operation==='multiply'){
      if(A[0].length!==B.length)fail('Multiplication requires columns(A) = rows(B).');
      return A.map(row=>B[0].map((_,j)=>F(row.reduce((sum,x,k)=>F(sum+x*B[k][j]),0))));
    }
    if(A.length!==B.length||A[0].length!==B[0].length)fail('Addition/subtraction require matching dimensions.');
    return A.map((row,i)=>row.map((x,j)=>F(x+(operation==='subtract'?-1:1)*B[i][j])));
  }
  function eliminate(A,extra){
    matrix(A);if(A.length!==A[0].length)fail('This operation needs a square matrix.');
    const n=A.length,rows=A.map((row,i)=>row.concat(extra?extra[i]:[])),scale=Math.max(...A.flat().map(Math.abs));
    let determinant=1;
    for(let k=0;k<n;k++){
      let pivot=k;for(let i=k+1;i<n;i++)if(Math.abs(rows[i][k])>Math.abs(rows[pivot][k]))pivot=i;
      if(extra&&Math.abs(rows[pivot][k])<=scale*1e-12||rows[pivot][k]===0)return {singular:true,determinant:0};
      if(pivot!==k){[rows[pivot],rows[k]]=[rows[k],rows[pivot]];determinant=-determinant;}
      const p=rows[k][k];determinant=F(determinant*p);rows[k]=rows[k].map(x=>F(x/p));
      for(let i=0;i<n;i++)if(i!==k){const factor=rows[i][k];rows[i]=rows[i].map((x,j)=>F(x-factor*rows[k][j]));}
    }
    return {determinant,rows};
  }
  function determinant(A){return eliminate(A).determinant;}
  function inverse(A){const n=A.length,identity=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j))),result=eliminate(A,identity);if(result.singular)fail('Matrix is singular or numerically ill-conditioned; inverse does not exist reliably.');return result.rows.map(row=>row.slice(n));}
  function solveMatrix(A,b){matrix(A);if(b.length!==A.length)fail('The right-hand vector must match the row count.');b.forEach(F);const result=eliminate(A,b.map(x=>[x]));if(result.singular)fail('No unique solution: singular or numerically ill-conditioned system.');return result.rows.map(row=>row[A.length]);}
  function simultaneous(a,b,c,d,e,f){
    [a,b,c,d,e,f].forEach(F);const det=F(a*e-b*d),dx=F(c*e-b*f),dy=F(a*f-c*d);
    if(det!==0)return {kind:'unique',x:F(dx/det),y:F(dy/det),det,dx,dy};
    if(a===0&&b===0&&c!==0||d===0&&e===0&&f!==0||dx!==0||dy!==0)return {kind:'none',det};
    return {kind:'infinite',det};
  }
  function quadratic(a,b,c){
    [a,b,c].forEach(F);if(a===0)return {kind:'linear',solution:window.FormaMath.equation(b,c,0)};
    const D=F(b*b-4*a*c);
    if(D>=0)return {kind:'real',D,roots:window.FormaMath.quadratic(a,b,c).roots};
    return {kind:'complex',D,real:F(-b/(2*a)),imaginary:F(Math.sqrt(-D)/(2*Math.abs(a)))};
  }
  function statistics(values,paired){
    if(!values.length||values.length>500)fail('Enter 1–500 finite numbers.');values.forEach(F);
    const sorted=[...values].sort((a,b)=>a-b),n=sorted.length,sum=F(values.reduce((s,x)=>F(s+x),0)),mean=sum/n;
    const median=a=>a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]/2+a[a.length/2]/2);
    const middle=Math.floor(n/2),q1=n===1?sorted[0]:median(sorted.slice(0,middle)),q3=n===1?sorted[0]:median(sorted.slice(n%2?middle+1:middle));
    const counts=new Map();values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));const maxCount=Math.max(...counts.values());
    const ss=F(values.reduce((s,x)=>F(s+(x-mean)**2),0));
    const result={count:n,sum,mean,median:median(sorted),mode:maxCount===1?[]:[...counts].filter(([,c])=>c===maxCount).map(([v])=>v).sort((a,b)=>a-b),min:sorted[0],max:sorted.at(-1),range:F(sorted.at(-1)-sorted[0]),q1,q3,iqr:F(q3-q1),populationVariance:ss/n,sampleVariance:n>1?ss/(n-1):null,populationSD:Math.sqrt(ss/n),sampleSD:n>1?Math.sqrt(ss/(n-1)):null,sorted};
    if(paired){
      if(paired.length!==n||n<2)fail('Regression needs at least two paired points and matching list lengths.');paired.forEach(F);
      const ym=paired.reduce((s,y)=>F(s+y),0)/n,sxx=values.reduce((s,x)=>F(s+(x-mean)**2),0),sxy=values.reduce((s,x,i)=>F(s+(x-mean)*(paired[i]-ym)),0);
      if(sxx===0)fail('Regression is undefined when every x is equal.');
      const slope=F(sxy/sxx),intercept=F(ym-slope*mean),sst=paired.reduce((s,y)=>F(s+(y-ym)**2),0),sse=values.reduce((s,x,i)=>F(s+(paired[i]-slope*x-intercept)**2),0);
      result.regression={slope,intercept,r2:sst===0?null:1-sse/sst};
    }
    return result;
  }
  function geometry(shape,p){
    Object.values(p).forEach(F);for(const [key,n] of Object.entries(p))if(key!=='s')positive(n,key);
    let area,perimeter,volume,surface,formula,dimensions={...p};const pi=Math.PI;
    switch(shape){
      case 'circle':area=pi*p.r**2;perimeter=2*pi*p.r;formula='A = πr²; P = 2πr';break;
      case 'rectangle':area=p.w*p.h;perimeter=2*(p.w+p.h);formula='A = w × h; P = 2(w + h)';break;
      case 'square':area=p.a**2;perimeter=4*p.a;formula='A = a²; P = 4a';break;
      case 'triangle':{
        const [a,b,c]=[p.a,p.b,p.c].sort((a,b)=>b-a);if(c<=a-b)fail('Triangle sides must satisfy the strict triangle inequality.');
        area=(.5*Math.sqrt(a+(b+c))*Math.sqrt(c-(a-b)))*(.5*Math.sqrt(c+(a-b))*Math.sqrt(a+(b-c)));perimeter=a+b+c;dimensions.height=area>Number.MAX_VALUE/2?2*(area/p.a):(2*area)/p.a;formula='s = (a+b+c)/2; A = √[s(s−a)(s−b)(s−c)]; P = a+b+c';break;
      }
      case 'parallelogram':if(p.h>p.b)fail('Height cannot exceed the slanted side.');area=p.a*p.h;perimeter=2*(p.a+p.b);formula='A = base × height; P = 2(base + side)';break;
      case 'trapezoid':area=((p.a+p.b)/2)*p.h;dimensions.left=Math.hypot(p.h,p.s);dimensions.right=Math.hypot(p.h,p.a-p.b-p.s);perimeter=p.a+p.b+dimensions.left+dimensions.right;formula='A = (a+b)h/2; legs = √(h²+s²), √(h²+(a−b−s)²); P = sum of four sides';break;
      case 'pythagorean':dimensions.c=Math.hypot(p.a,p.b);formula='c² = a²+b²; c = √(a²+b²)';break;
      case 'cube':volume=p.a**3;surface=6*p.a**2;formula='V = a³; S = 6a²';break;
      case 'cuboid':volume=p.w*p.h*p.d;surface=2*(p.w*p.h+p.h*p.d+p.w*p.d);formula='V = whd; S = 2(wh+hd+wd)';break;
      case 'cylinder':volume=pi*p.r**2*p.h;surface=2*pi*p.r*(p.r+p.h);formula='V = πr²h; S = 2πr(r+h)';break;
      case 'cone':dimensions.slant=Math.hypot(p.r,p.h);volume=pi*p.r**2*p.h/3;surface=pi*p.r*(p.r+dimensions.slant);formula='l = √(r²+h²); V = πr²h/3; S = πr(r+l), including base';break;
      case 'sphere':volume=4*pi*p.r**3/3;surface=4*pi*p.r**2;formula='V = 4πr³/3; S = 4πr²';break;
      default:fail('Unsupported shape.');
    }
    if(area===0||volume===0)fail('Positive dimensions produced an unrepresentable underflow. Use larger dimensions.');[area,perimeter,volume,surface,...Object.values(dimensions)].filter(x=>x!==undefined).forEach(F);return {area,perimeter,volume,surface,formula,dimensions};
  }
  function vector(a,b){if(![2,3].includes(a.length)||a.length!==b.length)fail('Use two matching 2D or 3D vectors.');[...a,...b].forEach(F);return {magnitudeA:F(Math.hypot(...a)),magnitudeB:F(Math.hypot(...b)),dot:F(a.reduce((s,x,i)=>F(s+x*b[i]),0)),cross:a.length===3?[F(a[1]*b[2]-a[2]*b[1]),F(a[2]*b[0]-a[0]*b[2]),F(a[0]*b[1]-a[1]*b[0])]:null};}
  const units={
    length:{m:[1,0],km:[1000,0],cm:[.01,0],mm:[.001,0],inch:[.0254,0],ft:[.3048,0],yd:[.9144,0],mile:[1609.344,0]},
    area:{'m²':[1,0],'cm²':[.0001,0],'km²':[1e6,0],'ft²':[.09290304,0],acre:[4046.8564224,0]},
    volume:{'m³':[1,0],L:[.001,0],mL:[.000001,0],'cm³':[.000001,0],'US gal':[.003785411784,0]},
    mass:{kg:[1,0],g:[.001,0],mg:[1e-6,0],lb:[.45359237,0],oz:[.028349523125,0]},
    temperature:{'°C':[1,0],'°F':[5/9,-32*5/9],K:[1,-273.15]},
    angle:{rad:[1,0],deg:[Math.PI/180,0],turn:[2*Math.PI,0]},
    time:{s:[1,0],ms:[.001,0],min:[60,0],h:[3600,0],day:[86400,0]},
    speed:{'m/s':[1,0],'km/h':[1/3.6,0],mph:[.44704,0],knot:[.5144444444444445,0]}
  };
  function convert(category,value,from,to){F(value);if(!units[category]||!Object.hasOwn(units[category],from)||!Object.hasOwn(units[category],to))fail('Choose compatible units.');const [a,b]=units[category][from],[c,d]=units[category][to],base=F(value*a+b);if(category==='temperature'&&base< -273.15-1e-10)fail('Temperature cannot be below absolute zero.');return {value:F((base-d)/c),formula:'('+value+' × '+a+' + '+b+' − '+d+') ÷ '+c};}
  function gcd(a,b){a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;}
  function integerTools(first,second){
    if(!/^[+-]?\d{1,100}$/.test(first)||!/^[+-]?\d{1,100}$/.test(second))fail('Enter integer strings of at most 100 digits.');const a=BigInt(first),b=BigInt(second),g=gcd(a,b),abs=a<0n?-a:a;
    let prime=null,factors=[];
    if(abs<=1000000000000n){let n=abs;for(let p=2n;p*p<=n;p=p===2n?3n:p+2n)while(n%p===0n){factors.push(p.toString());n/=p;}if(n>1n)factors.push(n.toString());prime=a>=2n&&factors.length===1;}
    return {gcd:g.toString(),lcm:(g===0n?0n:((a/g)*b<0n?-(a/g)*b:(a/g)*b)).toString(),prime,factors,negative:a<0n};
  }
  function baseConvert(source,from,to){
    if(![2,8,10,16].includes(from)||![2,8,10,16].includes(to))fail('Choose base 2, 8, 10, or 16.');
    let s=source.trim().toLowerCase(),negative=false;if(s[0]==='-'){negative=true;s=s.slice(1);}if(!s.length||s.length>128)fail('Use 1–128 integer digits, with an optional minus sign.');let n=0n;
    for(const ch of s){const digit='0123456789abcdef'.indexOf(ch);if(digit<0||digit>=from)fail('Digit '+ch+' is not valid in base '+from+'.');n=n*BigInt(from)+BigInt(digit);}
    return (negative&&n!==0n?'-':'')+n.toString(to).toUpperCase();
  }
  // Conservative interval arithmetic proves continuity before integration.
  function interval(tree,left,right,variables={}){
    const sorted=(a,b)=>[Math.min(a,b),Math.max(a,b)],walk=n=>{const bounds=visit(n);bounds.forEach(F);return bounds;},visit=n=>{
      if(n.type==='number')return [n.value,n.value];if(n.type==='variable'){if(n.name==='x')return [left,right];const v=E.evaluate(n,variables);return [v,v];}
      if(n.type==='op'){
        const a=walk(n.left);if(n.name==='neg')return [-a[1],-a[0]];const b=walk(n.right);
        if(n.name==='+')return [a[0]+b[0],a[1]+b[1]];if(n.name==='-')return [a[0]-b[1],a[1]-b[0]];
        if(n.name==='*'){const p=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return [Math.min(...p),Math.max(...p)];}
        if(n.name==='/'){if(b[0]<=0&&b[1]>=0)fail('Possible pole or zero denominator in this interval. Improper integrals are not supported.');const p=[a[0]/b[0],a[0]/b[1],a[1]/b[0],a[1]/b[1]];return [Math.min(...p),Math.max(...p)];}
        if(n.name==='^'){
          if(b[0]!==b[1]){if(a[0]<=0)fail('Variable powers require a strictly positive base over the whole interval.');const values=[a[0]**b[0],a[0]**b[1],a[1]**b[0],a[1]**b[1]];return [Math.min(...values),Math.max(...values)];}const exponent=b[0];
          if(exponent<0&&a[0]<=0&&a[1]>=0||!Number.isInteger(exponent)&&a[0]<0)fail('Power has an invalid domain or possible singularity.');
          const vals=[a[0]**exponent,a[1]**exponent];if(exponent>0&&a[0]<=0&&a[1]>=0)vals.push(0);return [Math.min(...vals),Math.max(...vals)];
        }
      }
      const a=walk(n.args[0]);
      if(n.name==='sin'||n.name==='cos'){
        // At huge phases k++ can stop advancing in binary64. A conservative
        // range also avoids pretending argument reduction has exact accuracy.
        if(Math.max(Math.abs(a[0]),Math.abs(a[1]))>1e12)return [-1,1];
        if(a[1]-a[0]>=2*Math.PI)return [-1,1];
        const fn=n.name==='sin'?Math.sin:Math.cos,offset=n.name==='sin'?Math.PI/2:0,vals=[fn(a[0]),fn(a[1])];
        for(let k=Math.ceil((a[0]-offset)/Math.PI);k<=Math.floor((a[1]-offset)/Math.PI);k++)vals.push(k%2===0?1:-1);
        return [Math.min(...vals),Math.max(...vals)];
      }
      if(n.name==='tan'){if(Math.ceil((a[0]-Math.PI/2)/Math.PI)<=Math.floor((a[1]-Math.PI/2)/Math.PI))fail('A tangent asymptote lies in the interval.');return sorted(Math.tan(a[0]),Math.tan(a[1]));}
      if(n.name==='ln'||n.name==='log10'){if(a[0]<=0)fail('Logarithm is not defined throughout this interval.');return sorted(Math.log(a[0])/(n.name==='log10'?Math.LN10:1),Math.log(a[1])/(n.name==='log10'?Math.LN10:1));}
      if(n.name==='sqrt'){if(a[0]<0)fail('Square root is not real throughout this interval.');return [Math.sqrt(a[0]),Math.sqrt(a[1])];}
      if(n.name==='cbrt')return [Math.cbrt(a[0]),Math.cbrt(a[1])];
      if(n.name==='exp')return [Math.exp(a[0]),Math.exp(a[1])];
      if(n.name==='pow10')return [10**a[0],10**a[1]];
      if(n.name==='asin'||n.name==='acos'){if(a[0]< -1||a[1]>1)fail('Inverse trigonometric argument leaves its real domain.');const fn=n.name==='asin'?Math.asin:Math.acos;return sorted(fn(a[0]),fn(a[1]));}
      if(n.name==='atan')return [Math.atan(a[0]),Math.atan(a[1])];
      if(n.name==='root'){const degree=walk(n.args[1]);if(degree[0]!==degree[1]||!Number.isInteger(degree[0])||degree[0]<=0||degree[0]%2===0&&a[0]<0)fail('Root domain cannot be certified.');const fn=x=>(x<0?-1:1)*Math.abs(x)**(1/degree[0]);return [fn(a[0]),fn(a[1])];}
      if(n.name==='log'){
        const base=walk(n.args[1]);if(a[0]<=0||base[0]<=0||base[0]<=1&&base[1]>=1)fail('Logarithm argument or base leaves its domain.');
        const values=[Math.log(a[0])/Math.log(base[0]),Math.log(a[0])/Math.log(base[1]),Math.log(a[1])/Math.log(base[0]),Math.log(a[1])/Math.log(base[1])];return [Math.min(...values),Math.max(...values)];
      }
      if(n.name==='abs')return [a[0]<=0&&a[1]>=0?0:Math.min(Math.abs(a[0]),Math.abs(a[1])),Math.max(Math.abs(a[0]),Math.abs(a[1]))];
      fail('Continuity cannot be certified for '+n.name+'. This integral is unsupported.');
    };
    const result=walk(tree);result.forEach(F);return result;
  }
  function integrate(tree,a,b){
    [a,b].forEach(F);if(a===b){E.evaluate(tree,{x:a});return {value:0,error:0,evaluations:1};}
    const sign=b<a?-1:1,l=Math.min(a,b),r=Math.max(a,b);interval(tree,l,r);
    let evaluations=0,error=0,panels=0,work=0;const fn=x=>{if(++evaluations>50000)fail('Integral could not resolve sampling/error within the 50000 evaluation limit. Try a smaller interval or lower frequency.');return E.evaluate(tree,{x});};
    const phases=[];
    function collect(n){if(n.type==='call'&&['sin','cos','tan'].includes(n.name))phases.push(n.args[0]);if(n.left)collect(n.left);if(n.right)collect(n.right);if(n.args)n.args.forEach(collect);}
    collect(tree);
    function phaseResolved(a,b){
      let span=0;
      for(const phase of phases){const [lo,hi]=interval(phase,a,b);if(Math.max(Math.abs(lo),Math.abs(hi))>1e12)fail('Trigonometric phase is too large to resolve reliably at floating-point precision.');span+=hi-lo;}
      return span<=Math.PI/8;
    }
    const simpson=(a,b,fa,fm,fb)=>(b-a)*(fa+4*fm+fb)/6;
    function adaptive(a,b,fa,fm,fb,whole,tol,depth,minimum){
      if(++work>50000)fail('Integral exceeded the subdivision work limit.');
      const mid=a+(b-a)/2,lm=a+(mid-a)/2,rm=mid+(b-mid)/2,fl=fn(lm),fr=fn(rm),left=simpson(a,mid,fa,fl,fm),right=simpson(mid,b,fm,fr,fb),delta=left+right-whole;
      if(minimum<=0&&phaseResolved(a,b)&&Math.abs(delta)<=15*tol){panels++;error+=Math.abs(delta)/15;return F(left+right+delta/15);}
      if(depth===0||lm===a||rm===b)fail('Integral could not resolve phase/error within the depth or floating-point subdivision limit. Try a smaller interval.');
      return F(adaptive(a,mid,fa,fl,fm,left,tol/2,depth-1,minimum-1)+adaptive(mid,b,fm,fr,fb,right,tol/2,depth-1,minimum-1));
    }
    const fa=fn(l),fm=fn(l+(r-l)/2),fb=fn(r),whole=F(simpson(l,r,fa,fm,fb)),value=F(sign*adaptive(l,r,fa,fm,fb,whole,1e-8*Math.max(1,Math.abs(whole)),22,5));
    return {value,error,evaluations,panels,errorKind:'estimate'};
  }
  window.FormaLabMath={matrix,transpose,matrixOp,determinant,inverse,solveMatrix,simultaneous,quadratic,statistics,geometry,vector,units,convert,gcd,integerTools,baseConvert,interval,integrate};
})();
