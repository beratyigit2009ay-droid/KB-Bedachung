/* =========================================================
   KB Bedachungen – Scroll-Intro (film.js)
   Ein Haus in 3D, dessen Dach beim Scrollen Schritt für Schritt
   entsteht. Kamera, Dachaufbau und Texte hängen direkt an der
   Scrollposition, rückwärts läuft alles natürlich zurück.
   three.js liegt lokal in assets/vendor (keine externen Server).
   ========================================================= */
const film=document.getElementById("film");
if(film)start();

async function start(){
  const canvas=document.getElementById("filmCanvas");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off=()=>film.classList.add("film-off");
  const glOk=(()=>{try{const c=document.createElement("canvas");return !!(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){return false}})();
  if(reduce||!glOk||!canvas){off();return}

  /* Überspringen: direkt zur Seite, ohne den Film im Schnelldurchlauf */
  const skip=document.getElementById("filmSkip");
  if(skip)skip.addEventListener("click",()=>scrollTo({top:film.offsetTop+film.offsetHeight,behavior:"instant"}));

  let THREE;
  let RoomEnvironment;
  try{THREE=await import("./assets/vendor/three.module.min.js");({RoomEnvironment}=await import("./assets/vendor/RoomEnvironment.js"))}catch(e){off();return}

  const mobile=matchMedia("(max-width: 860px)").matches;
  const BG=0xf7f4f0;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.5:2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(BG);
  const camera=new THREE.PerspectiveCamera(28,1,.5,400);
  /* Weiche Umgebungsreflexe für Glas und Metall */
  const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();

  /* ---------- Licht: weiches Tageslicht ---------- */
  scene.add(new THREE.HemisphereLight(0xffffff,0xe9e1d6,.45));
  const sun=new THREE.DirectionalLight(0xfff1df,1.9);
  sun.position.set(-16,26,18);sun.target.position.set(1,2,0);
  sun.castShadow=true;
  const sm=mobile?1024:2048;sun.shadow.mapSize.set(sm,sm);
  Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});
  sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;
  scene.add(sun,sun.target);

  /* ---------- Materialien ---------- */
  const M=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,envMapIntensity:.55});
  const mat={
    render:M(0xe9e5df,.92),plinth:M(0x6a6e73,.8),frame:M(0x3a3d41,.45,.3),glass:Object.assign(M(0xa9b8c4,.05,.55),{envMapIntensity:1.3}),
    sill:M(0xd9d4cc,.7),stone:M(0xe3dcd2,.95),door:M(0x4b4f54,.6,.1),
    wood:M(0xc99c66,.78),wood2:M(0xb98a55,.8),membrane:M(0xb9c1c7,.75),
    tile:M(0x50555b,.5,.1),ridge:M(0x484d53,.45,.1),trim:M(0x7a7f84,.35,.7),
    copper:Object.assign(M(0xc98552,.3,.9),{envMapIntensity:1}),flat:M(0xd3d6d8,.8),leaf:M(0xb4bea4,1),trunk:M(0x8d7d6d,.9)
  };
  const shadowed=o=>{o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true}});return o};
  function box(w,h,d,m,x=0,y=0,z=0){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);return shadowed(b)}

  /* ---------- Maße (Meter) ---------- */
  const W=11,D=8.5,H=5.9,OV=.6,GOV=.45,A=THREE.MathUtils.degToRad(38);
  const TAN=Math.tan(A),RISE=D/2*TAN,LS=(D/2+OV)/Math.cos(A),XL=W+2*GOV;

  /* Boden: nur Schatten auf dem hellen Grund, dazu eine Steinfläche ums Haus */
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.ShadowMaterial({opacity:.11}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const plate=box(24,.08,19,mat.stone,2,-.04,1.5);plate.castShadow=false;scene.add(plate);

  /* ---------- Rohbau ---------- */
  const house=new THREE.Group();scene.add(house);
  house.add(box(W,H,D,mat.render,0,H/2,0));
  house.add(box(W+.06,.45,D+.06,mat.plinth,0,.225,0));
  house.add(box(W+.04,.22,D+.04,mat.sill,0,H-.11,0));
  /* Giebelwände */
  const gs=new THREE.Shape();gs.moveTo(-D/2,0);gs.lineTo(D/2,0);gs.lineTo(0,RISE);gs.closePath();
  const gg=new THREE.ExtrudeGeometry(gs,{depth:.3,bevelEnabled:false});
  [-1,1].forEach(sx=>{const g=new THREE.Mesh(gg,mat.render);g.rotation.y=Math.PI/2;g.position.set(sx>0?W/2-.3:-W/2,H,0);house.add(shadowed(g))});
  /* Fenster */
  function win(x,y,w,h,face){
    const g=new THREE.Group(),zf=.04;
    g.add(box(w+.14,h+.14,.08,mat.frame,0,0,zf));
    g.add(box(w,h,.06,mat.glass,0,0,zf+.03));
    if(w>1.8)g.add(box(.06,h,.09,mat.frame,0,0,zf+.03));
    g.add(box(w+.3,.06,.22,mat.sill,0,-h/2-.1,.11));
    if(face==="front")g.position.set(x,y,D/2);
    if(face==="back"){g.position.set(x,y,-D/2);g.rotation.y=Math.PI}
    if(face==="right"){g.position.set(W/2,y,x);g.rotation.y=Math.PI/2}
    if(face==="left"){g.position.set(-W/2,y,x);g.rotation.y=-Math.PI/2}
    house.add(g);
  }
  win(-3.4,1.75,2.4,2.3,"front");win(3.2,1.75,2.4,2.3,"front");
  house.add(box(1.2,2.35,.1,mat.door,0,1.62,D/2+.04));
  house.add(box(1.9,.08,1.2,mat.frame,0,2.95,D/2+.6));
  win(-3.4,4.35,1.7,1.35,"front");win(0,4.35,1.2,1.35,"front");win(3.2,4.35,1.7,1.35,"front");
  win(-2.6,1.75,3.2,2.3,"back");win(2.8,1.75,1.6,2.3,"back");win(-2.6,4.35,1.7,1.35,"back");win(2.8,4.35,1.7,1.35,"back");
  win(-1.6,1.75,1.4,2.0,"left");win(1.8,4.35,1.4,1.35,"left");win(-1.6,4.35,1.4,1.35,"left");
  win(1.8,4.35,1.4,1.35,"right");win(-2,4.35,1.4,1.35,"right");
  /* Garage mit Flachdach */
  const GW=3.8,GD=6.6,GH=3.1,gx=W/2+GW/2,gz=D/2-GD/2;
  house.add(box(GW,GH,GD,mat.render,gx,GH/2,gz));
  house.add(box(GW+.04,.4,GD+.04,mat.plinth,gx,.2,gz));
  house.add(box(2.7,2.25,.08,mat.door,gx,1.17,D/2+.02));
  house.add(box(GW+.12,.12,GD+.12,mat.flat,gx,GH+.06,gz));
  house.add(box(GW+.16,.1,.08,mat.copper,gx,GH+.12,D/2+.08));
  /* Bäume */
  /* (keine Bäume: ruhiger, architektonischer Look) */
  function tree(x,z,s){const t=new THREE.Group();t.add(box(.22*s,2.4*s,.22*s,mat.trunk,0,1.2*s,0));const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7*s,3),mat.leaf);c.scale.set(1,1.25,1);c.position.y=3.4*s;t.add(shadowed(c));t.position.set(x,0,z);scene.add(t)}

  /* ---------- Dach-Koordinaten ---------- */
  const X=new THREE.Vector3(1,0,0);
  const frame=side=>{const n=new THREE.Vector3(0,Math.cos(A),side*Math.sin(A)),u=new THREE.Vector3(0,Math.sin(A),-side*Math.cos(A));
    const e=new THREE.Vector3(0,H-OV*TAN,side*(D/2+OV));
    const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,n,X.clone().cross(n)));
    return{n,u,e,q,side}};
  const F={"1":frame(1),"-1":frame(-1)};
  const at=(f,x,d,h)=>f.e.clone().addScaledVector(f.u,d).addScaledVector(f.n,h).setX(x);
  /* Längsrichtung der Box zeigt entlang der Dachneigung */

  const clamp=v=>v<0?0:v>1?1:v;
  const ease=t=>1-Math.pow(1-t,3);
  const steps=[];/* {start,dur,apply(e)} */
  function stage(obj,start,dur,apply){obj.visible=false;steps.push({obj,start,dur,apply});return obj}

  const roof=new THREE.Group();scene.add(roof);
  /* 1) Holzkonstruktion: Mauerlatten, Pfosten, Firstpfette */
  [-1,1].forEach((s,i)=>{const b=box(XL,.12,.16,mat.wood,0,H+.06,s*(D/2-.25));roof.add(b);const y0=b.position.y;
    stage(b,.125+i*.012,.04,e=>{b.position.y=y0+1.5*(1-e);b.scale.x=.4+.6*e})});
  [-W/2+.45,0,W/2-.45].forEach((x,i)=>{const p=box(.16,RISE-.2,.16,mat.wood,x,H+(RISE-.2)/2,0);roof.add(p);
    stage(p,.14+i*.01,.035,e=>{p.scale.y=Math.max(e,.001);p.position.y=H+(RISE-.2)*e/2})});
  {const r=box(XL,.24,.16,mat.wood,0,H+RISE-.08,0);roof.add(r);const y0=r.position.y;stage(r,.17,.04,e=>{r.position.y=y0+2*(1-e)})}

  /* 2) Sparren */
  const nR=Math.round((XL-.2)/.78)+1;
  for(let i=0;i<nR;i++)[-1,1].forEach(s=>{
    const f=F[s],x=-XL/2+.1+i*(XL-.2)/(nR-1),len=LS+.12;
    const m=box(.09,.2,len,mat.wood2);m.quaternion.copy(f.q);const p0=at(f,x,len/2-.06,.1);m.position.copy(p0);roof.add(m);
    stage(m,.19+i*.0075+(s>0?0:.004),.035,e=>{m.position.set(p0.x,p0.y+2.6*(1-e),p0.z)})});

  /* 3) Dachaufbau: Unterspannbahn */
  [-1,1].forEach((s,i)=>{const f=F[s];const m=box(XL,.012,LS,mat.membrane);m.quaternion.copy(f.q);m.castShadow=false;roof.add(m);
    stage(m,.31+i*.015,.07,e=>{const k=Math.max(e,.001);m.scale.z=k;m.position.copy(at(f,0,LS*k/2,.206))})});

  /* 4) Lattung */
  const rows=Math.floor((LS-.3)/.33)+1;
  for(let r=0;r<rows;r++)[-1,1].forEach(s=>{const f=F[s];const m=box(XL,.03,.05,mat.wood);m.quaternion.copy(f.q);const p0=at(f,0,.16+r*.33,.228);m.position.copy(p0);roof.add(m);
    stage(m,.38+r*.0045+(s>0?0:.002),.03,e=>{m.scale.x=Math.max(e,.001)})});

  /* 5) Dachziegel (Instanzen) */
  const cols=Math.round(XL/.3),TW=XL/cols;
  const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(TW-.012,.035,.4),mat.tile,cols*rows*2);
  tiles.castShadow=tiles.receiveShadow=true;tiles.frustumCulled=false;roof.add(tiles);
  const T=[],dummy=new THREE.Object3D(),col=new THREE.Color();
  let ti=0;
  [-1,1].forEach(s=>{const f=F[s];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x=-XL/2+TW/2+c*TW,p=at(f,x,.2+r*.33,.27);
    const k=(r+c/cols*1.6)/(rows+1.6);
    T.push({p,f,start:.455+k*.18,i:ti});
    col.set(0xffffff).multiplyScalar(.93+Math.random()*.14);tiles.setColorAt(ti,col);ti++}});
  tiles.instanceColor.needsUpdate=true;
  const zero=new THREE.Matrix4().makeScale(0,0,0),tilt=THREE.MathUtils.degToRad(4);
  function placeTiles(s){
    for(const t of T){const e=ease(clamp((s-t.start)/.022));
      if(e<=0){tiles.setMatrixAt(t.i,zero);continue}
      dummy.position.copy(t.p).addScaledVector(t.f.n,.35*(1-e));
      dummy.quaternion.copy(t.f.q);dummy.rotateX(-t.f.side*tilt);dummy.scale.setScalar(.6+.4*e);
      dummy.updateMatrix();tiles.setMatrixAt(t.i,dummy.matrix)}
    tiles.instanceMatrix.needsUpdate=true}

  /* 6) First */
  const ridgeY=H+RISE+.2;
  {const g=new THREE.CylinderGeometry(.24,.24,XL+.04,28,1,false,0,Math.PI);g.rotateZ(Math.PI/2);g.translate((XL+.04)/2,0,0);
   const m=new THREE.Mesh(g,mat.ridge);m.position.set(-(XL+.04)/2,ridgeY,0);roof.add(shadowed(m));
   stage(m,.645,.06,e=>{m.scale.x=Math.max(e,.001)})}

  /* 7) Anschlüsse: Ortgang-Bleche an den Giebeln */
  [-1,1].forEach(s=>[-1,1].forEach(sx=>{const f=F[s];const m=box(.04,.14,LS+.1,mat.trim);m.quaternion.copy(f.q);const p0=at(f,sx*(XL/2+.03),LS/2,.25);m.position.copy(p0);roof.add(m);
    stage(m,.69+(s>0?0:.012)+(sx>0?.006:0),.035,e=>{m.scale.z=Math.max(e,.001);m.position.copy(at(f,sx*(XL/2+.03),LS-(LS*e)/2,.25))})}));

  /* 8) Dachrinnen und Fallrohre aus Kupfer */
  [-1,1].forEach((s,i)=>{const f=F[s];
    const g=new THREE.CylinderGeometry(.1,.1,XL,20,1,true,0,Math.PI);g.rotateZ(Math.PI/2);g.rotateX(Math.PI);
    const gm=new THREE.MeshStandardMaterial({color:0xc98552,roughness:.3,metalness:.9,envMapIntensity:1,side:THREE.DoubleSide});
    const m=new THREE.Mesh(g,gm);const p=at(f,0,-.04,.06);p.y-=.04;p.z+=s*.06;m.position.copy(p);roof.add(shadowed(m));
    stage(m,.73+i*.012,.04,e=>{m.scale.x=Math.max(e,.001)});
    [-1,1].forEach((sx,j)=>{const x=sx*(W/2-.35),h=p.y,zw=s*(D/2+.08),L=Math.abs(p.z)-(D/2+.08),hv=h-.12;
      const v=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,hv,12),mat.copper));roof.add(v);
      const arm=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,L,12),mat.copper));arm.rotation.x=Math.PI/2;arm.position.set(x,h-.08,zw+s*L/2);roof.add(arm);
      stage(arm,.765+i*.01+j*.006,.02,e=>{});
      stage(v,.775+i*.01+j*.006,.035,e=>{v.scale.y=Math.max(e,.001);v.position.set(x,h-.12-hv*e/2,zw)})})});

  /* ---------- Kamerafahrt ---------- */
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const KEYS=[
    [0,  V(40,15,50),  V(1,4,0)],
    [.12,V(33,14,40),  V(1,4.6,0)],
    [.22,V(20,15,23),  V(0,6.6,0)],
    [.34,V(3,16.5,25), V(0,7,0)],
    [.46,V(-21,15,14), V(0,6.8,0)],
    [.58,V(-22,15.5,-14),V(0,6.6,0)],
    [.68,V(5,16,-25),  V(0,6.6,0)],
    [.78,V(26,12,-9),  V(1,5.6,0)],
    [.9, V(25,6,27.5), V(1.6,4.9,0)],
    [1,  V(27,6.4,29.5),V(1.6,4.9,0)]
  ];
  const cr=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;return p1.clone().multiplyScalar(2).add(p2.clone().sub(p0).multiplyScalar(t)).add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(t2)).add(p1.clone().multiplyScalar(3).sub(p0).sub(p2.clone().multiplyScalar(3)).add(p3).multiplyScalar(t3)).multiplyScalar(.5)};
  const smooth=t=>t*t*(3-2*t);
  function camAt(s,idx){let k=0;while(k<KEYS.length-2&&s>KEYS[k+1][0])k++;
    const a=KEYS[k][0],b=KEYS[k+1][0],u=smooth(clamp((s-a)/(b-a)));
    const g=i=>KEYS[Math.max(0,Math.min(KEYS.length-1,i))][idx];
    return cr(g(k-1),g(k),g(k+1),g(k+2),u)}
  let distScale=1,lookDrop=0;
  function resize(){const w=film.clientWidth,h=innerHeight;renderer.setSize(w,h,false);
    const asp=w/h,hf=THREE.MathUtils.degToRad(asp<1?30:46);
    let vf=2*Math.atan(Math.tan(hf/2)/asp);vf=Math.min(Math.max(vf,THREE.MathUtils.degToRad(30)),THREE.MathUtils.degToRad(64));
    camera.fov=THREE.MathUtils.radToDeg(vf);camera.aspect=asp;camera.updateProjectionMatrix();
    const realH=2*Math.atan(Math.tan(vf/2)*asp);distScale=Math.max(1,Math.tan(hf/2)/Math.tan(realH/2));
    lookDrop=asp<1?2.4:0;need=true}

  /* ---------- Texte und Überblendungen ---------- */
  const ui={logo:document.getElementById("intro"),hint:document.getElementById("filmHint"),fade:document.getElementById("filmFade"),end:document.getElementById("filmEnd"),skip:skip,
    lines:[...film.querySelectorAll(".film-lines p")].map(p=>({el:p,a:+p.dataset.a,b:+p.dataset.b}))};
  const win01=(s,a,b,f=.035)=>Math.min(clamp((s-a)/f),clamp((b-s)/f));
  function paint(s){
    for(const st of steps){const e=ease(clamp((s-st.start)/st.dur));st.obj.visible=e>0;if(e>0)st.apply(e)}
    placeTiles(s);
    const look=camAt(s,2),pos=camAt(s,1);
    camera.position.copy(look).addScaledVector(pos.sub(look),distScale);look.y-=lookDrop;camera.lookAt(look);
    renderer.render(scene,camera);
    const lo=clamp((s-.035)/.07);
    ui.logo.style.opacity=1-lo;ui.logo.style.transform=`translateY(${-40*lo}px) scale(${1-.05*lo})`;ui.logo.style.visibility=lo>=1?"hidden":"";
    if(ui.hint)ui.hint.style.opacity=1-clamp(s/.03);
    canvas.style.opacity=clamp((s-.02)/.09);
    for(const l of ui.lines){const o=win01(s,l.a,l.b);l.el.style.opacity=o;l.el.style.transform=`translateY(${(1-o)*(s<(l.a+l.b)/2?24:-24)}px)`}
    const eo=clamp((s-.84)/.04);ui.end.style.opacity=eo;ui.end.style.transform=`translateY(${(1-eo)*24}px)`;ui.end.style.pointerEvents=eo>.5?"auto":"none";
    ui.fade.style.opacity=clamp((s-.955)/.045);
    if(ui.skip)ui.skip.style.opacity=s>.9?0:1;
    document.body.classList.toggle("in-film",s<.985&&inView());
  }

  /* ---------- Scroll-Kopplung mit weichem Nachlauf ---------- */
  let target=0,cur=0,need=true,raf=0,last=performance.now();
  const progress=()=>{const r=film.getBoundingClientRect(),span=r.height-innerHeight;return span>0?clamp(-r.top/span):0};
  const inView=()=>{const r=film.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
  function tick(now){raf=0;const dt=Math.min(.1,(now-last)/1000);last=now;
    const d=target-cur;cur=Math.abs(d)<.0004?target:cur+d*(1-Math.exp(-dt*9));
    if(inView()&&(need||cur!==target||Math.abs(d)>0)){paint(cur);need=false}
    if(cur!==target)raf=requestAnimationFrame(tick)}
  const kick=()=>{target=progress();if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}};
  addEventListener("scroll",kick,{passive:true});
  addEventListener("resize",()=>{resize();kick()});
  resize();cur=target=progress();paint(cur);film.classList.add("film-ready");
}
