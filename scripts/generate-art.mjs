import {mkdir, writeFile, stat} from 'node:fs/promises';
import path from 'node:path';

// Original, analytic (2,3) torus knot. No imported imagery, fonts or dependencies.
const out = path.resolve(import.meta.dirname, '../public/sites/moaon');
const TAU = Math.PI * 2;
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/Math.hypot(...a));
const clamp=x=>Math.max(0,Math.min(1,x));
const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
function rotate(p){
  let [x,y,z]=p;
  const ax=.46,ay=-.24,az=-.29;
  [y,z]=[y*Math.cos(ax)-z*Math.sin(ax),y*Math.sin(ax)+z*Math.cos(ax)];
  [x,z]=[x*Math.cos(ay)+z*Math.sin(ay),-x*Math.sin(ay)+z*Math.cos(ay)];
  return [x*Math.cos(az)-y*Math.sin(az),x*Math.sin(az)+y*Math.cos(az),z];
}
function curve(t){const a=1.56+.67*Math.cos(3*t);return [a*Math.cos(2*t),a*Math.sin(2*t),.77*Math.sin(3*t)];}
function frame(t){
  const h=.0001,p=curve(t),a=curve(t-h),b=curve(t+h);
  const tangent=unit(sub(b,a));
  const acceleration=mul(add(sub(b,mul(p,2)),a),1/(h*h));
  const normal=unit(sub(acceleration,mul(tangent,dot(acceleration,tangent))));
  return {p,n:normal,b:unit(cross(tangent,normal))};
}
function surface(t,u){
  const f=frame(t);
  // Softly modulated, slightly oval section gives the knot a forged, sculptural character.
  const radius=.302+.018*Math.sin(3*t+.45);
  return rotate(add(f.p,add(mul(f.n,Math.cos(u)*radius),mul(f.b,Math.sin(u)*radius*.90))));
}
function project(p){const k=8.7/(8.7-p[2]);return [360+p[0]*108*k,330-p[1]*108*k];}
const lights=[
 {d:unit([-.55,.88,1.35]),color:[.78,.88,1],strength:1.16,broad:.30},
 {d:unit([1.1,.35,.72]),color:[.03,.88,1],strength:.82,broad:.22},
 {d:unit([-.75,-.55,.25]),color:[.27,.13,1],strength:.66,broad:.20},
 {d:unit([.2,-.95,1.2]),color:[.05,.28,1],strength:.28,broad:.12}
];
function shade(p,n){
 const v=unit(sub([0,0,8.7],p));
 const base=mix([.009,.022,.115],[.018,.070,.22],.5+.5*Math.sin(p[0]*1.2+p[1]*.5));
 // Soft geometric ambient occlusion from distant sections of the same knot.
 let occlusion=0;
 for (const o of occluders) {
   const delta=sub(o,p), d=Math.hypot(...delta);
   if (d>.34 && d<.87) occlusion=Math.max(occlusion,clamp(dot(n,mul(delta,1/d)))*(.87-d)/.53);
 }
 const ao=1-.56*occlusion;
 let c=mul(base,(.25+.13*clamp(n[1]+.4))*ao);
 for(const l of lights){
   const diffuse=Math.max(0,dot(n,l.d));
   const half=unit(add(v,l.d));
   const nh=Math.max(0,dot(n,half));
   const spec=(Math.pow(nh,88)*l.strength*1.20 + Math.pow(nh,15)*l.broad)*ao;
   c=c.map((q,i)=>q+base[i]*diffuse*l.strength*.44*ao+l.color[i]*spec);
 }
 const fresnel=Math.pow(1-Math.max(0,dot(n,v)),3.3);
 const rim=mix([.11,.14,.73],[.025,.73,.95],clamp(.5+p[0]*.3));
 c=c.map((q,i)=>q+rim[i]*fresnel*.26);
 // Filmic shoulder, then linear-to-sRGB. White highlights retain a cool silver tone.
 c=c.map(q=>Math.pow(clamp(q/(1+q*.40)),1/2.2));
 return '#'+c.map(q=>Math.round(q*255).toString(16).padStart(2,'0')).join('');
}
const occluders=Array.from({length:240},(_,i)=>rotate(curve(i/240*TAU)));
const N=640,M=96,verts=[];
for(let i=0;i<N;i++){verts[i]=[];for(let j=0;j<M;j++)verts[i][j]=surface(i/N*TAU,j/M*TAU);}
const faces=[];
for(let i=0;i<N;i++)for(let j=0;j<M;j++){
 const p=[verts[i][j],verts[(i+1)%N][j],verts[(i+1)%N][(j+1)%M],verts[i][(j+1)%M]];
 const center=mul(p.reduce((a,b)=>add(a,b),[0,0,0]),.25);
 let normal=unit(cross(sub(p[1],p[0]),sub(p[3],p[0])));
 // Surface parameterization points inward; reverse for exterior normal.
 normal=mul(normal,-1);
 if(dot(normal,sub([0,0,8.7],center))<=0)continue;
 const q=p.map(project);
 const d='M'+q.map(v=>v.map(x=>x.toFixed(2)).join(',')).join('L')+'Z';
 faces.push({z:center[2],d,color:shade(center,normal)});
}
faces.sort((a,b)=>a.z-b.z);
const paths=faces.map(f=>`<path d="${f.d}" fill="${f.color}" stroke="${f.color}"/>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 680" fill="none"><title>Moaon interwoven intelligence sculpture</title><desc>Original metallic blue, indigo and cyan (2,3) torus knot, mathematically generated as a depth-sorted, lit quad mesh. Transparent background.</desc><defs><filter id="aura" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="4.2" result="blur"/><feFlood flood-color="#3979ff" flood-opacity=".18"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#aura)" stroke-width=".43" stroke-linejoin="round">${paths}</g></svg>`;
// Three interlocked diamonds form an abstract M. All geometry is original.
const favicon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><title>Moaon mark</title><defs><linearGradient id="ice" x1="13" y1="8" x2="49" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#a5f9ff"/><stop offset=".48" stop-color="#36d9f2"/><stop offset="1" stop-color="#4872ff"/></linearGradient></defs><g stroke="url(#ice)" stroke-width="4.2" stroke-linejoin="round"><path d="M18 13 31 32 18 51 5 32Z"/><path d="M32 6 45 25 32 44 19 25Z"/><path d="M46 13 59 32 46 51 33 32Z"/></g><path d="m19 25 13 19 13-19" stroke="#abfaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
await mkdir(out,{recursive:true});
await writeFile(path.join(out,'hero-sculpture.svg'),svg,'utf8');
await writeFile(path.join(out,'favicon.svg'),favicon,'utf8');
for (const file of ['hero-sculpture.svg','favicon.svg']) console.log(file,(await stat(path.join(out,file))).size,'bytes');
console.log('mesh',N,'longitudinal ×',M,'radial =',N*M,'quads;',faces.length,'front-facing depth-sorted quads');
