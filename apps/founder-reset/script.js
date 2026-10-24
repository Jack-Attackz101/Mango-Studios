(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* spring: velocity-aware, retargets from its live value so it can be interrupted */
function Spring(apply,k,c){var x=0,y=0,vx=0,vy=0,tx=0,ty=0,raf=0,last=0;k=k||170;c=c||26;
 function step(t){var dt=Math.min((t-last)/1000,.032);last=t;
  vx+=((tx-x)*k-vx*c)*dt;vy+=((ty-y)*k-vy*c)*dt;x+=vx*dt;y+=vy*dt;apply(x,y);
  raf=(Math.abs(vx)+Math.abs(vy)+Math.abs(tx-x)+Math.abs(ty-y)>.02)?requestAnimationFrame(step):0}
 function go(){if(!raf){last=performance.now();raf=requestAnimationFrame(step)}}
 return{to:function(a,b){tx=a;ty=b;go()},
  set:function(a,b){x=a;y=b;vx=vy=0;tx=a;ty=b;apply(x,y)},
  release:function(a,b,va,vb){tx=a;ty=b;vx=va;vy=vb;go()},
  get:function(){return[x,y]}}}
function rubber(o,lim){var s=o<0?-1:1;o=Math.abs(o);return s*(o*lim*.55)/(lim+.55*o)}

/* order dialog grows from the button that opened it and returns to it */
var d=document.getElementById('order');
$('[data-order]').forEach(function(b){b.addEventListener('click',function(){
 var r=b.getBoundingClientRect();d.showModal();var q=d.getBoundingClientRect();
 d.style.transformOrigin=(r.left+r.width/2-q.left)+'px '+(r.top+r.height/2-q.top)+'px'})});
function closeD(){if(!d.open)return;d.classList.add('out');setTimeout(function(){d.classList.remove('out');d.close()},210)}
d.querySelector('form').addEventListener('submit',function(e){e.preventDefault();closeD()});
d.addEventListener('click',function(e){var r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeD()});

/* headline: the one orchestrated entrance */
var h1=document.querySelector('.hero h1');
if(h1){var words=h1.textContent.trim().split(/\s+/);h1.setAttribute('aria-label',words.join(' '));
 h1.innerHTML=words.map(function(w,i){return '<span class="w" aria-hidden="true" style="animation-delay:'+(0.1+i*0.08)+'s">'+w+'</span>'}).join(' ')}

/* reveal only the content blocks, not every label */
var sel='.card,.step,.kit,.stat,.billing,.familiar li,.ing,.science article,details,.plus';
var els=$(sel);
els.forEach(function(e){e.classList.add('rv');
 var sibs=Array.prototype.filter.call(e.parentNode.children,function(c){return c.matches(sel)});
 e.style.transitionDelay=(Math.min(sibs.indexOf(e),5)*0.08)+'s'});
function show(e){e.classList.add('in');setTimeout(function(){e.style.transitionDelay='0s';e.classList.add('settled')},1100)}
if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in','settled')});$('[data-count]').forEach(count)}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target);
  $('[data-count]',x.target).forEach(count)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
 els.forEach(function(e){io.observe(e)})}

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

if(reduce)return;

/* card tilt on springs */
if(matchMedia('(hover:hover)').matches){
 $('.card,.step,.kit,.stat').forEach(function(c){
  var s=Spring(function(a,b){c.style.setProperty('--rx',a.toFixed(2)+'deg');c.style.setProperty('--ry',b.toFixed(2)+'deg')},220,28);
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();
   s.to((.5-(e.clientY-r.top)/r.height)*9,((e.clientX-r.left)/r.width-.5)*9)});
  c.addEventListener('pointerleave',function(){s.to(0,0)})})}

/* hero: hover tilts, drag spins 1:1 with rubber-band, release carries velocity */
var sc=document.getElementById('scene'),rig=sc&&sc.querySelector('.rig');
if(sc){
 var rs=Spring(function(a,b){rig.style.setProperty('--rx',a.toFixed(2)+'deg');rig.style.setProperty('--ry',b.toFixed(2)+'deg')},150,22);
 var drag=null,hist=[];
 sc.addEventListener('pointermove',function(e){
  if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   rs.set(rubber(drag.rx-dy*.25,60),rubber(drag.ry+dx*.4,70));
   hist.push([e.clientX,e.clientY,performance.now()]);if(hist.length>5)hist.shift();return}
  if(e.pointerType==='mouse'){var r=sc.getBoundingClientRect();
   rs.to((.5-(e.clientY-r.top)/r.height)*16,((e.clientX-r.left)/r.width-.5)*26)}});
 sc.addEventListener('pointerdown',function(e){if(e.target.closest('a,button'))return;
  sc.setPointerCapture(e.pointerId);var cur=rs.get();drag={x:e.clientX,y:e.clientY,rx:cur[0],ry:cur[1]};hist=[];sc.classList.add('drag')});
 function end(){if(!drag)return;var v=[0,0];
  if(hist.length>1){var a=hist[0],b=hist[hist.length-1],dt=(b[2]-a[2])/1000||1;v=[(b[0]-a[0])/dt*.4,(b[1]-a[1])/dt*-.25]}
  var cur=rs.get();drag=null;sc.classList.remove('drag');
  rs.release(0,0,v[1]*.9,v[0]*.9)}
 sc.addEventListener('pointerup',end);sc.addEventListener('pointercancel',end);
 sc.addEventListener('pointerleave',function(e){if(!drag)rs.to(0,0)});
}
})();
