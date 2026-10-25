(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var root=document.documentElement;
var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

/* order dialog: opens from the pressed button, returns to it */
var d=document.getElementById('order');
$('[data-order]').forEach(function(b){b.addEventListener('click',function(){
 var r=b.getBoundingClientRect();d.showModal();var q=d.getBoundingClientRect();
 d.style.transformOrigin=(r.left+r.width/2-q.left)+'px '+(r.top+r.height/2-q.top)+'px'})});
function closeD(){if(!d.open)return;d.classList.add('out');setTimeout(function(){d.classList.remove('out');d.close()},210)}
d.querySelector('form').addEventListener('submit',function(e){e.preventDefault();closeD()});
d.addEventListener('click',function(e){var r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeD()});

/* quiet reveals + counters */
var rv=$('[data-r]');
rv.forEach(function(e,i){var sib=Array.prototype.filter.call(e.parentNode.children,function(c){return c.hasAttribute('data-r')});e.style.setProperty('--rd',Math.min(sib.indexOf(e),4)*.08+'s')});
function count(el){if(el.dataset.done)return;el.dataset.done=1;var to=+el.dataset.count,t0=performance.now(),dur=1700;
 if(reduce){el.textContent=to.toLocaleString('en-US');return}
 (function f(t){var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e).toLocaleString('en-US');if(p<1)requestAnimationFrame(f)})(t0)}
if(!('IntersectionObserver' in window)){rv.forEach(function(e){e.classList.add('in')});$('[data-count]').forEach(count)}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);$('[data-count]',x.target).forEach(count)}})},{threshold:.12,rootMargin:'0px 0px -5% 0px'});
 rv.forEach(function(e){io.observe(e)})}

/* layer depth for the illustration scenes */
$('.lyr').forEach(function(l){l.style.setProperty('--dp',l.getAttribute('data-depth'))});

/* scroll: progress line, header, parallax, scroll-linked story */
var bar=document.querySelector('.progress'),hdr=document.querySelector('header.top'),
    story=document.querySelector('.story'),legend=$('.legend span'),
    px=$('[data-speed]'),sy=$('[data-sy]'),ticking=false;
function measure(){px.forEach(function(e){e.style.setProperty('--py','0px');var r=e.getBoundingClientRect();e._c=r.top+scrollY+r.height/2});frame()}
function ss(x){x=clamp(x,0,1);return x*x*(3-2*x)}
function frame(){ticking=false;var y=scrollY,vh=innerHeight,max=root.scrollHeight-vh;
 if(bar)bar.style.transform='scaleX('+(max>0?y/max:0)+')';
 if(hdr)hdr.classList.toggle('scrolled',y>10);
 if(story){var r=story.getBoundingClientRect(),pin=story.firstElementChild.offsetHeight,
   p=clamp((60-r.top)/Math.max(1,r.height-pin-60),0,1),t=ss((p-.34)/.3);
  story.style.setProperty('--p',p.toFixed(4));story.style.setProperty('--t',t.toFixed(4));
  if(legend.length){legend[0].classList.toggle('on',t<.5);legend[1].classList.toggle('on',t>=.5)}}
 if(reduce)return;
 px.forEach(function(e){var c=e._c;if(c<y-vh||c>y+2*vh)return;e.style.setProperty('--py',((y+vh/2-c)*parseFloat(e.dataset.speed)).toFixed(1)+'px')});
 sy.forEach(function(e){var r=e.getBoundingClientRect();e.style.setProperty('--sy',clamp(((r.top+r.height/2)-vh/2)/(vh*.75),-1.2,1.2).toFixed(3))})}
addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(frame)}},{passive:true});
addEventListener('resize',measure);addEventListener('load',measure);measure();
if(reduce)return;

/* pointer depth: one smoothed spring drives every scene's layers */
function Spring(apply,k,c){var x=0,y=0,vx=0,vy=0,tx=0,ty=0,raf=0,last=0;
 function step(t){var dt=Math.min((t-last)/1000,.032);last=t;
  vx+=((tx-x)*k-vx*c)*dt;vy+=((ty-y)*k-vy*c)*dt;x+=vx*dt;y+=vy*dt;apply(x,y);
  raf=(Math.abs(vx)+Math.abs(vy)+Math.abs(tx-x)+Math.abs(ty-y)>.0008)?requestAnimationFrame(step):0}
 return{to:function(a,b){tx=a;ty=b;if(!raf){last=performance.now();raf=requestAnimationFrame(step)}}}}
if(matchMedia('(hover:hover)').matches){
 var sp=Spring(function(a,b){root.style.setProperty('--mx',a.toFixed(4));root.style.setProperty('--my',b.toFixed(4))},60,13);
 addEventListener('pointermove',function(e){sp.to(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1)},{passive:true});
}
})();
