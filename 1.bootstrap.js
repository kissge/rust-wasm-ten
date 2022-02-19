(window.webpackJsonp=window.webpackJsonp||[]).push([[1],[,function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__);var wasm_ten__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(5),wasm_ten_wasm_ten_bg_wasm__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(2),_solve__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(4);const WASM_MEMORY_BUFFER_SIZE=4e3,input=document.getElementById("input"),textareas=document.getElementsByTagName("textarea"),REPEAT=50;function term(e,n,r){switch(r){case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.Add:return`${e} + ${n}`;case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.Sub:return`${e} - ${n}`;case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.SubInversed:return`${n} - ${e}`;case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.Mul:return`${e} * ${n}`;case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.Div:return`${e} / ${n}`;case wasm_ten__WEBPACK_IMPORTED_MODULE_0__.b.DivInversed:return`${n} / ${e}`}}function paren(e){return"("+e+")"}input.addEventListener("keyup",()=>{if(!input.value.match(/^\d{4}$/))return;const problem=input.value.split("").map(e=>Number.parseInt(e));let results;[{name:"Wasm (Rust)",textarea:textareas[0],enumerate:wasm_ten__WEBPACK_IMPORTED_MODULE_0__.c},{name:"Plain JS",textarea:textareas[1],enumerate:_solve__WEBPACK_IMPORTED_MODULE_2__.a}].forEach(({name:name,textarea:textarea,enumerate:enumerate})=>{const start=performance.now();for(let e=0;e<REPEAT;++e)results=enumerate(...problem);if(enumerate===wasm_ten__WEBPACK_IMPORTED_MODULE_0__.c){const e=new Uint32Array(wasm_ten_wasm_ten_bg_wasm__WEBPACK_IMPORTED_MODULE_1__.b.buffer).subarray(results/4,results/4+WASM_MEMORY_BUFFER_SIZE+1);results=Array.from({length:e[0]},(n,r)=>e.subarray(8*r+1,8*r+9))}const time=((performance.now()-start)/REPEAT).toFixed(3);let formulae=results.map(([e,n,r,t,a,o,_,u])=>u===wasm_ten__WEBPACK_IMPORTED_MODULE_0__.a.A?term(paren(term(paren(term(e,n,a)),r,o)),t,_):term(paren(term(e,n,a)),paren(term(r,t,o)),_));formulae=formulae.filter((e,n)=>formulae.indexOf(e)===n),textarea.value=`${name} [${problem.join(", ")}]\nFound ${formulae.length} solutions in ${time} ms (Average of ${REPEAT} repeats).\n\n`+formulae.map(formula=>formula+" = "+eval(formula)).sort().join("\n")})}),input.dispatchEvent(new KeyboardEvent("keyup"))},function(e,n,r){"use strict";var t=r.w[e.i];e.exports=t,t.c()},,function(e,n,r){"use strict";r.d(n,"a",(function(){return a}));var t=r(5);function a(e,n,r,a){const u=function(e){const n=[];for(const r of e)for(const t of e)for(const a of e)n.push([r,t,a]);return n}([t.b.Add,t.b.Sub,t.b.SubInversed,t.b.Mul,t.b.Div,t.b.DivInversed]);return function e(n){if(n.length<=1)return[n];const r=[];for(let t=0;t<n.length;t++){const a=[...n],o=a.splice(t,1)[0],_=e(a);for(const e of _)r.push([o,...e])}return r}([e,n,r,a]).flatMap(([e,n,r,a])=>u.flatMap(([u,s,m])=>[t.a.A,t.a.B].flatMap(i=>function(e,n,r,a,u,s,m,i){const[c,d,E,f]=[e,n,r,a].map(e=>new _(e,1));if(i===t.a.A){const e=o(c,d,u),n=o(e,E,s);return o(n,f,m)}{const e=o(c,d,u),n=o(E,f,s);return o(e,n,m)}}(e,n,r,a,u,s,m,i).equals(10)?[[e,n,r,a,u,s,m,i]]:[])))}function o(e,n,r){switch(r){case t.b.Add:return e.denominator===n.denominator?new _(e.numerator+n.numerator,e.denominator):new _(e.numerator*n.denominator+n.numerator*e.denominator,e.denominator*n.denominator);case t.b.Sub:return e.denominator===n.denominator?new _(e.numerator-n.numerator,e.denominator):new _(e.numerator*n.denominator-n.numerator*e.denominator,e.denominator*n.denominator);case t.b.SubInversed:return e.denominator===n.denominator?new _(n.numerator-e.numerator,e.denominator):new _(n.numerator*e.denominator-e.numerator*n.denominator,e.denominator*n.denominator);case t.b.Mul:return new _(e.numerator*n.numerator,e.denominator*n.denominator);case t.b.Div:return new _(e.numerator*n.denominator,e.denominator*n.numerator);case t.b.DivInversed:return new _(n.numerator*e.denominator,n.denominator*e.numerator)}}class _{constructor(e,n){this.numerator=e,this.denominator=n}equals(e){return this.numerator/this.denominator===e}}},function(e,n,r){"use strict";r.d(n,"c",(function(){return a})),r.d(n,"b",(function(){return o})),r.d(n,"a",(function(){return _}));var t=r(2);function a(e,n,r,a){return t.a(e,n,r,a)}const o=Object.freeze({Add:0,0:"Add",Sub:1,1:"Sub",SubInversed:2,2:"SubInversed",Mul:3,3:"Mul",Div:4,4:"Div",DivInversed:5,5:"DivInversed"}),_=Object.freeze({A:0,0:"A",B:1,1:"B"})}]]);