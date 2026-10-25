/* Founder Reset unboxing: draws the four flaps of the isometric box at any opening angle
   and lifts the contents. One call per frame: ub.set(u) with u from 0 (closed) to 1 (fully out). */
function Unbox(svg){
 var cfg=svg.querySelector('.ub-cfg');if(!cfg)return null;
 var k=+cfg.dataset.k,b=cfg.dataset.box.split(',').map(Number),X=b[0],Y=b[1],Z=b[2],W=b[3],D=b[4],H=b[5],T=Z+H;
 var C=Math.cos(Math.PI/6),NS='http://www.w3.org/2000/svg';
 var fbo=svg.querySelector('.ub-fbo'),fbc=svg.querySelector('.ub-fbc'),ff=svg.querySelector('.ub-ff');
 var items=[].slice.call(svg.querySelectorAll('.ub-c')),pops=[].slice.call(svg.querySelectorAll('.ub-pop'));
 function P(p){return [(p[0]-p[1])*C*k,(p[0]+p[1])*.5*k-p[2]*k]}
 function add(a,b,s){return [a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s]}
 function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
 var Lv=[.3,.55,.78],ln=Math.hypot(Lv[0],Lv[1],Lv[2]);Lv=Lv.map(function(v){return v/ln});
 var V=[.577,.577,.577],e=.03;
 var flaps=[
  {back:1,A:[X+e,Y,T],B:[X+W-e,Y,T],I:[0,1,0],L:D*.5,o:1},
  {back:1,A:[X,Y+e,T],B:[X,Y+D-e,T],I:[1,0,0],L:W*.3,o:0},
  {back:0,A:[X+W,Y+e,T],B:[X+W,Y+D-e,T],I:[-1,0,0],L:W*.3,o:0},
  {back:0,A:[X+e,Y+D,T],B:[X+W-e,Y+D,T],I:[0,-1,0],L:D*.5,o:1}];
 flaps.forEach(function(f){f.el=document.createElementNS(NS,'polygon');f.ln=document.createElementNS(NS,'polyline');
  f.ln.setAttribute('fill','none');f.ln.setAttribute('stroke','#fff');f.ln.setAttribute('stroke-width','1.1');f.ln.setAttribute('stroke-opacity','.85')});
 function shade(base,l){return 'rgb('+base.map(function(c){return Math.round(Math.min(255,c*l))}).join(',')+')'}
 function draw(theta){
  var c=Math.cos(theta),s=Math.sin(theta);
  [fbo,fbc,ff].forEach(function(g){while(g.firstChild)g.removeChild(g.firstChild)});
  // long flaps lie on top of the short ones when closed
  flaps.slice().sort(function(a,b){return a.o-b.o}).forEach(function(f){
   var d=[f.I[0]*c,f.I[1]*c,s],n=[-f.I[0]*s,-f.I[1]*s,c],out=dot(n,V)>=0,vn=out?n:n.map(function(v){return -v});
   var l=.74+.27*Math.max(0,dot(vn,Lv)),q=[f.A,f.B,add(f.B,d,f.L),add(f.A,d,f.L)].map(P);
   f.el.setAttribute('points',q.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' '));
   f.el.setAttribute('fill',shade(out?[255,255,255]:[236,226,211],l));f.el.setAttribute('stroke','rgba(27,21,48,.1)');f.el.setAttribute('stroke-width','.8');f.el.setAttribute('stroke-linejoin','round');
   f.ln.setAttribute('points',[q[2],q[3]].map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' '));
   var slot=f.back?(theta>Math.PI*.53?fbo:fbc):ff;slot.appendChild(f.el);slot.appendChild(f.ln)})}
 function ease(x){x=Math.max(0,Math.min(1,x));return 1-Math.pow(1-x,3)}
 function io(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
 var last=-1;
 return{final:cfg.dataset.final==='1',set:function(u){if(Math.abs(u-last)<.0004)return;last=u;
  draw((4+121*ease(u/.42))*Math.PI/180);
  var r=io((u-.16)/.84);
  items.forEach(function(it){it.setAttribute('transform','translate('+(r*+it.dataset.dx).toFixed(1)+' '+(-r*+it.dataset.rise*k).toFixed(1)+')')});
  pops.forEach(function(p,i){var t=ease((u-.55-i*.06)/.3);p.style.opacity=t.toFixed(3);p.setAttribute('transform','translate(0 '+((1-t)*-26).toFixed(1)+')')});
  svg.parentNode.style.setProperty('--ur',r.toFixed(3))}};
}
