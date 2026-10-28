(function(){
  'use strict';
  const results=new Map(),messageFor=(en,bn)=>document.documentElement.lang==='bn'?bn:en;
  function clear(field){if(!field)return;field.removeAttribute('aria-invalid');const message=document.getElementById(field.id+'-validation');if(message)message.textContent='';}
  function error(field,message){if(typeof field==='string')field=document.getElementById(field);if(!field)return;let node=document.getElementById(field.id+'-validation');if(!node){node=document.createElement('small');node.id=field.id+'-validation';node.className='field-validation';node.setAttribute('role','alert');field.after(node);}if(node.textContent!==message)node.textContent=message;field.setAttribute('aria-invalid','true');field.setAttribute('aria-errormessage',node.id);}
  function numeric(id){const field=document.getElementById(id);if(!field.value.trim()||!Number.isFinite(field.valueAsNumber)){const message=messageFor('Please fill in a finite number.','সসীম একটি সংখ্যা লিখুন।');error(field,message);throw Error(message);}clear(field);return field.valueAsNumber;}
  function publish(mode,answer,accuracy='approximate',ast=null){const result={mode,answer:String(answer),accuracy,ast};results.set(mode,result);document.dispatchEvent(new CustomEvent('forma:result',{detail:result}));}
  function invalid(mode,message){publish(mode,'',/unsupported|not support|supports|degree|cannot be certified/i.test(message)?'unsupported':'invalid');}
  document.addEventListener('input',event=>clear(event.target),true);
  window.FormaFeedback={results,error,clear,numeric,publish,invalid};
})();
