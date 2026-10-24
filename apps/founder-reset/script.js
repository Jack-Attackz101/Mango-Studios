(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* dialog */
var d=document.getElementById('order');
$('[data-order]').forEach(function(b){b.addEventListener('click',function(){d.showModal()})});

/* headline word-by-word */
var h1=document.querySelector('.hero h1');
if(h1){var words=h1.textContent.trim().split(/\s+/);h1.setAttribute('aria-label',words.join(' '));
 h1.innerHTML=words.map(function(w,i){return '<span class="w" aria-hidden="true" style="animation-delay:'+(0.1+i*0.08)+'s">'+w+'</span>'}).join(' ')}

/* reveal on scroll */
var sel='.eyebrow,h2.display,.lede,.card,.step,.kit,.billing,.stat,.ing,.science article,details,.two>div,.familiar li,.price,.note,.fda,.final .btn,.plus,.chips li';
var els=$(sel).filter(function(e){return !e.closest('.hero .wrap>div:first-child')||e.matches('.price')});
els.forEach(function(e){
 e.classList.add('rv');
 var sibs=Array.prototype.filter.call(e.parentNode.children,function(c){return c.matches(sel)});
 e.style.transitionDelay=(Math.min(sibs.indexOf(e),6)*0.09)+'s';
});
if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')})}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);
  var c=x.target.matches('[data-count]')?[x.target]:$('[data-count]',x.target);c.forEach(count)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
 els.forEach(function(e){io.observe(e)})}

/* count-up */
function count(el){if(el.dataset.done)return;el.dataset.done=1;var to=+el.dataset.count,t0=performance.now(),dur=1600;
 if(reduce){el.textContent=to.toLocaleString('en-US');return}
 (function f(t){var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e).toLocaleString('en-US');if(p<1)requestAnimationFrame(f)})(t0)}

/* scroll: progress, header, parallax */
var bar=document.querySelector('.progress'),hdr=document.querySelector('header.top'),px=$('[data-speed]'),ticking=false;
function measure(){px.forEach(function(e){e.style.setProperty('--py','0px');var r=e.getBoundingClientRect();e._top=r.top+scrollY;e._h=r.height});update()}
function update(){ticking=false;var y=scrollY,vh=innerHeight,max=document.documentElement.scrollHeight-vh;
 if(bar)bar.style.transform='scaleX('+(max>0?y/max:0)+')';
 if(hdr)hdr.classList.toggle('scrolled',y>10);
 if(reduce)return;
 px.forEach(function(e){var c=e._top+e._h/2;if(c<y-vh||c>y+2*vh)return;e.style.setProperty('--py',((y+vh/2-c)*parseFloat(e.dataset.speed)).toFixed(1)+'px')})}
addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
addEventListener('resize',measure);addEventListener('load',measure);measure();

/* pointer tilt */
if(!reduce&&matchMedia('(hover:hover)').matches){
 $('.card,.step,.kit,.stat').forEach(function(c){
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();
   c.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*10).toFixed(2)+'deg');
   c.style.setProperty('--rx',((.5-(e.clientY-r.top)/r.height)*10).toFixed(2)+'deg')});
  c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})});
 var sc=document.getElementById('scene'),rig=sc&&sc.querySelector('.rig');
 if(sc)sc.addEventListener('pointermove',function(e){var r=sc.getBoundingClientRect();
  rig.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*28).toFixed(1)+'deg');
  rig.style.setProperty('--rx',((.5-(e.clientY-r.top)/r.height)*18).toFixed(1)+'deg')});
 if(sc)sc.addEventListener('pointerleave',function(){rig.style.setProperty('--rx','0deg');rig.style.setProperty('--ry','0deg')});
}
})();
