/* =========================================================
   KB Bedachungen – Scroll-Intro (film.js)
   Ein modernes Gebäude mit Flachdach, Garage und Dachterrasse in
   einer Wiesenlandschaft bei Sonnenuntergang. Beim Scrollen entstehen
   Schichtaufbau, Abdichtung und Details; Gras und Wolken bewegen sich. Kamera, Dachaufbau und Texte hängen direkt an der
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
  try{THREE=await import("./assets/vendor/three.module.min.js")}catch(e){off();return}

  const mobile=matchMedia("(max-width: 860px)").matches;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  let dpr=Math.min(devicePixelRatio||1,mobile?1.25:1.75);renderer.setPixelRatio(dpr);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(28,1,.5,700);
  const uTime={value:0};

  /* ---------- Himmel bei Sonnenuntergang ---------- */
  const sunDir=new THREE.Vector3(-.75,.29,.62).normalize();
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{sunDir:{value:sunDir}},
    vertexShader:"varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:`uniform vec3 sunDir;varying vec3 vDir;
      vec3 lin(vec3 c){return pow(c,vec3(2.2));}
      void main(){vec3 d=normalize(vDir);float h=d.y;
        vec3 c=mix(lin(vec3(1.,.8,.58)),lin(vec3(.98,.71,.66)),smoothstep(.0,.14,h));
        c=mix(c,lin(vec3(.62,.68,.84)),smoothstep(.12,.6,h));
        float sd=max(dot(d,sunDir),0.);
        c+=lin(vec3(1.,.64,.32))*pow(sd,5.)*.55*(1.-smoothstep(0.,.45,h));
        c+=vec3(1.,.8,.55)*pow(sd,900.)*6.;
        c=mix(c,lin(vec3(1.,.8,.58)),smoothstep(0.,-.1,h));
        gl_FragColor=vec4(c*1.3,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(520,48,24),skyMat);sky.renderOrder=-2;sky.frustumCulled=false;scene.add(sky);
  scene.fog=new THREE.Fog(new THREE.Color(0xffcc94).multiplyScalar(1.3),50,360);

  /* Wolken: weiche, prozedural erzeugte Schleier, die langsam ziehen */
  const clouds=new THREE.Group();clouds.renderOrder=-1;scene.add(clouds);
  {const cv=document.createElement("canvas");cv.width=512;cv.height=192;const cx=cv.getContext("2d");
   for(let i=0;i<70;i++){const x=40+Math.random()*432,y=70+Math.random()*60-Math.abs(x-256)*.12,r=18+Math.random()*46;
     const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(255,255,255,.22)");g.addColorStop(1,"rgba(255,255,255,0)");cx.fillStyle=g;cx.fillRect(0,0,512,192)}
   const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
   for(let i=0;i<14;i++){const az=i/14*Math.PI*2+Math.random()*.3,el=THREE.MathUtils.degToRad(5+Math.random()*16),R=430;
     const lowc=new THREE.Color(1.25,.86,.74),hic=new THREE.Color(1.2,1.08,1.05);
     const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,opacity:.55+Math.random()*.3,color:lowc.lerp(hic,el/.4)});
     const sp=new THREE.Sprite(m);sp.position.set(Math.cos(az)*Math.cos(el)*R,Math.sin(el)*R,Math.sin(az)*Math.cos(el)*R);
     const w=150+Math.random()*170;sp.scale.set(w,w*.32,1);clouds.add(sp)}}

  /* Umgebungsreflexe aus dem Abendhimmel (Glas, Metall) */
  {const env=new THREE.Scene();env.add(new THREE.Mesh(sky.geometry,skyMat));
   const gnd=new THREE.Mesh(new THREE.CircleGeometry(400,32),new THREE.MeshBasicMaterial({color:0x4d6330}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-2;env.add(gnd);
   const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.02,1,1200).texture;pm.dispose()}

  /* ---------- Licht: tief stehende Abendsonne ---------- */
  const hemi=new THREE.HemisphereLight(0xffe4cc,0x6b7a45,.62);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffc48a,2.7);
  sun.target.position.set(-1,2,0);sun.castShadow=true;
  const sm=mobile?1024:2048;sun.shadow.mapSize.set(sm,sm);
  Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:160});
  sun.shadow.bias=-.0004;sun.shadow.normalBias=.05;sun.shadow.radius=3;
  scene.add(sun,sun.target);
  const SUN_AZ=Math.atan2(.62,-.75),sunCol=new THREE.Color();
  function setSun(s){const el=THREE.MathUtils.degToRad(21-9*s),az=SUN_AZ+.1*s;
    sunDir.set(Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az));
    sun.position.copy(sunDir).multiplyScalar(70).add(sun.target.position);
    sun.color.copy(sunCol.setHSL(.085-.014*s,1,.78-.05*s));sun.intensity=2.8-.35*s}
  setSun(0);

  /* ---------- Materialien ---------- */
  const M=(c,r=.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,envMapIntensity:.3});
  const mat={
    render:M(0xebe7e1,.92),plinth:M(0x6a6e73,.8),frame:M(0x3a3d41,.45,.3),glass:Object.assign(M(0xa9b8c4,.05,.55),{envMapIntensity:1.3}),
    stone:M(0xd8d0c4,.95),door:M(0x55595e,.55,.2),concrete:M(0xb3b0aa,.95),
    vapour:M(0x3a3d40,.6),insul:M(0xe2d2a6,.8),membrane:M(0xd6d7d5,.62),seam:M(0xbfc6ca,.45),
    epdm:M(0xbcc2c6,.66),fleece:M(0xeeece8,1),coping:Object.assign(M(0x62666b,.4,.6),{envMapIntensity:.9}),
    alu:Object.assign(M(0xc7cacc,.3,.8),{envMapIntensity:1}),upstand:M(0xdfe2e3,.5),pipe:M(0x5c6166,.5,.3),
    deck:M(0xa47d56,.75),joist:M(0x4d5054,.7,.3),steel:Object.assign(M(0x9aa0a5,.3,.85),{envMapIntensity:1}),
    dome:Object.assign(M(0xe6eef2,.08,.1),{transparent:true,opacity:.62,envMapIntensity:1.4}),
    rail:Object.assign(M(0xd8e4ea,.05,.2),{transparent:true,opacity:.32,envMapIntensity:1.4})
  };
  const glow=new THREE.MeshBasicMaterial({color:0xffa04a});
  const shadowed=o=>{o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true}});return o};
  const root=new THREE.Group();scene.add(root);
  function box(w,h,d,m,x=0,y=0,z=0,parent=root){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);parent.add(shadowed(b));return b}

  const clamp=v=>v<0?0:v>1?1:v;
  const ease=t=>1-Math.pow(1-t,3);
  const steps=[];
  function stage(obj,start,dur,apply,hideAtEnd=false){obj.visible=false;steps.push({obj,start,dur,apply,hideAtEnd});return obj}
  /* Bauteil wächst entlang einer Achse von einer festen Kante aus (anchor -1 = min, +1 = max) */
  function grow(m,axis,anchor,start,dur){const c=m.position[axis],size=m.geometry.parameters[{x:"width",y:"height",z:"depth"}[axis]];
    return stage(m,start,dur,e=>{m.scale[axis]=Math.max(e,.001);m.position[axis]=c+anchor*size/2*(1-e)})}

  /* ---------- Maße (Meter) ---------- */
  const W=12,D=9,H=6.2,AT=.55,AW=.3,IX=W/2-AW,IZ=D/2-AW;   /* Hauptgebäude, Attika */
  const GW=4,GD=6.5,GH=3,GX=W/2+GW/2,GZ=D/2-GD/2;           /* Garage rechts */
  const TW=5,TD=9,TH=3.2,TX=-W/2-TW/2;                      /* Terrassenbau links */
  const YV=H+.003,YI=H+.006,ID=.24,YM=YI+ID;               /* Schichthöhen Hauptdach */

  /* ---------- Landschaft: Wiese, sanfte Hügel, Bäume in der Ferne ---------- */
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
  const hash=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
  const vnoise=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
    const a=hash(xi,zi),b=hash(xi+1,zi),c=hash(xi,zi+1),d=hash(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
  const fbm=(x,z)=>{let f=0,a=.5,k=1;for(let i=0;i<4;i++){f+=a*vnoise(x*k,z*k);k*=2.03;a*=.5}return f};
  const hill=(x,z)=>{const m=THREE.MathUtils.smoothstep(Math.hypot(x,z),55,190);return m*Math.max(0,fbm(x*.009+3,z*.009+7)*58-14)};
  {const g=new THREE.PlaneGeometry(1300,1300,180,180);g.rotateX(-Math.PI/2);
   const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,hill(x,z));
     const n=fbm(x*.05,z*.05);c.setHSL(.24-.03*n,.42+.12*n,.24+.08*n);c.toArray(col,i*3)}
   g.setAttribute("color",new THREE.BufferAttribute(col,3));g.computeVertexNormals();
   const t=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,envMapIntensity:.3}));t.receiveShadow=true;scene.add(t)}

  /* Wind: Halme und Baumkronen bewegen sich je nach Ort unterschiedlich, mit langsamen Böen */
  function windy(m,strength,isGrass){m.customProgramCacheKey=()=>"wind"+isGrass;m.onBeforeCompile=sh=>{sh.uniforms.uTime=uTime;
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nuniform float uTime;attribute float aH;varying float vH;")
      .replace("#include <begin_vertex>",`#include <begin_vertex>
        vec4 wp=instanceMatrix*vec4(0.,0.,0.,1.);
        float k=${isGrass?"aH*aH":"max(position.y,0.)"};
        float gust=.45+.55*(sin(uTime*.45+wp.x*.035+wp.z*.025)*.5+.5);
        float sw=(sin(uTime*1.6+wp.x*.31+wp.z*.19)*.65+sin(uTime*2.7+wp.x*.77-wp.z*.53)*.25+sin(uTime*4.3+wp.z*1.3)*.1)*gust;
        transformed.x+=sw*${strength}*k;transformed.z+=sw*${strength*.4}*k;transformed.y-=abs(sw)*${strength*.15}*k;
        vH=${isGrass?"aH":"1."};`);
    if(isGrass)sh.vertexShader=sh.vertexShader.replace("#include <beginnormal_vertex>","vec3 objectNormal=vec3(0.,1.,0.);");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying float vH;")
      .replace("#include <color_fragment>","#include <color_fragment>\n"+(isGrass?"diffuseColor.rgb*=mix(.66,1.12,vH);":""))}}
  function clump(n,spread){const pos=[],hh=[],idx=[];let base=0;
    for(let b=0;b<n;b++){const a=rnd()*Math.PI,ox=(rnd()-.5)*spread,oz=(rnd()-.5)*spread,h=.28+rnd()*.38,w=.026+rnd()*.018,lean=(rnd()-.5)*.3;
      const ca=Math.cos(a),sa=Math.sin(a);
      for(let k=0;k<=3;k++){const t=k/3,ww=w*(1-t*.9),lx=lean*t*t;
        pos.push(ox-ww*ca-lx*sa,h*t,oz-ww*sa+lx*ca,ox+ww*ca-lx*sa,h*t,oz+ww*sa+lx*ca);hh.push(t,t)}
      for(let k=0;k<3;k++){const i=base+k*2;idx.push(i,i+1,i+2,i+1,i+3,i+2)}base+=8}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));g.setAttribute("aH",new THREE.Float32BufferAttribute(hh,1));g.setIndex(idx);return g}
  /* Grundstück: Pflaster ums Haus und Zufahrt zur Garage */
  box(24,.06,13.6,mat.stone,-.75,.03,.5);box(4.6,.06,10.2,mat.stone,8,.03,12.3);
  const onPlot=(x,z)=>(x>-13.1&&x<11.6&&z>-6.6&&z<7.6)||(x>5.5&&x<10.5&&z>7&&z<17.4);
  {const gm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,side:THREE.DoubleSide,envMapIntensity:.25});windy(gm,.17,true);
   const N=mobile?12000:26000,geos=[clump(7,.45),clump(6,.4),clump(8,.5)],per=Math.ceil(N/3),c=new THREE.Color(),o=new THREE.Object3D();
   geos.forEach(g=>{const im=new THREE.InstancedMesh(g,gm,per);im.receiveShadow=true;im.frustumCulled=false;let n=0;
     while(n<per){const x=(rnd()-.5)*120-1,z=(rnd()-.5)*120+4,d=Math.hypot(x+1,z-1);
       if(onPlot(x,z)||rnd()>1.35-d/46)continue;
       const sc=(.75+rnd()*.45)*(d>28?1.15:1);o.position.set(x,0,z);o.scale.set(sc,sc*(.8+rnd()*.5),sc);o.updateMatrix();im.setMatrixAt(n,o.matrix);
       c.setHSL(.2+rnd()*.06,.42+rnd()*.14,.27+rnd()*.09);im.setColorAt(n,c);n++}
     scene.add(im)})}
  {const g=new THREE.SphereGeometry(1,14,10),p=g.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=.7+.6*vnoise(x*2.6+5,z*2.6+y*2.1);p.setXYZ(i,x*f,y*f,z*f)}
   g.computeVertexNormals();g.translate(0,.9,0);
   const tm=new THREE.MeshStandardMaterial({color:0x3f5428,roughness:1,envMapIntensity:.3});windy(tm,.03,false);
   const N=mobile?220:420,im=new THREE.InstancedMesh(g,tm,N),o=new THREE.Object3D(),c=new THREE.Color();let n=0;
   let cx=0,cz=0,left=0;
   while(n<N){if(!left){const a=rnd()*Math.PI*2,r=135+rnd()*170;cx=Math.cos(a)*r;cz=Math.sin(a)*r;left=4+Math.floor(rnd()*10)}
     left--;const x=cx+(rnd()-.5)*26,z=cz+(rnd()-.5)*26;
     const s=1.8+rnd()*2.2;o.position.set(x,hill(x,z)-.5,z);o.scale.set(s,s*(1.3+rnd()*.6),s);o.rotation.y=rnd()*6;o.updateMatrix();im.setMatrixAt(n,o.matrix);
     c.setHSL(.22+rnd()*.05,.35,.22+rnd()*.07);im.setColorAt(n,c);n++}
   scene.add(im)}

  /* ---------- Rohbau ---------- */
  box(W,H,D,mat.render,0,H/2,0);
  box(W+.06,.45,D+.06,mat.plinth,0,.225,0);
  box(2*IX,.02,2*IZ,mat.concrete,0,H+.001,0);                                  /* tragende Decke */
  [[0,IZ+AW/2,W,AW],[0,-IZ-AW/2,W,AW]].forEach(([x,z,w,d])=>box(w,AT,d,mat.render,x,H+AT/2,z));
  [[IX+AW/2],[-IX-AW/2]].forEach(([x])=>box(AW,AT,2*IZ,mat.render,x,H+AT/2,0));
  box(GW,GH,GD,mat.render,GX,GH/2,GZ);box(GW+.06,.4,GD+.06,mat.plinth,GX,.2,GZ);
  box(GW-.02,.02,GD-.02,mat.concrete,GX,GH+.001,GZ);
  box(TW,TH,TD,mat.render,TX,TH/2,0);box(TW+.06,.42,TD+.06,mat.plinth,TX,.21,0);
  box(TW-.02,.02,TD-.02,mat.concrete,TX,TH+.001,0);

  /* Fenster: Position der Mitte auf der Fassade, Drehung zeigt nach außen */
  function win(x,y,z,ry,w,h,step=1.6){
    const g=new THREE.Group();
    box(w+.14,h+.14,.08,mat.frame,0,0,.04,g);box(w,h,.06,mat.glass,0,0,.07,g);
    const n=Math.max(0,Math.round(w/step)-1);for(let i=1;i<=n;i++)box(.06,h,.09,mat.frame,-w/2+i*w/(n+1),0,.07,g);
    g.position.set(x,y,z);g.rotation.y=ry;root.add(g)}
  const F=0,B=Math.PI,R=Math.PI/2,L=-Math.PI/2;
  win(-2.8,1.65,D/2,F,5.4,2.5,1.8);box(1.2,2.4,.1,mat.door,2.4,1.65,D/2+.04);
  win(0,4.75,D/2,F,9.6,1.5,1.6);
  win(0,1.65,-D/2,B,7,2.5,1.8);win(0,4.75,-D/2,B,9.6,1.5,1.6);
  win(W/2,4.75,0,R,5,1.5,1.7);
  win(-W/2,4.83,-.6,L,4.4,2.1,1.1);win(-W/2,4.83,3,L,1.2,2.1);   /* Zugang zur Dachterrasse */
  win(TX,1.6,D/2,F,3.2,2.2,1.6);win(-W/2-TW,1.6,-1,L,3.6,2.2,1.8);
  box(2.6,2.25,.08,mat.door,GX,1.17,D/2+.02);
  for(let i=1;i<6;i++)box(2.6,.012,.1,mat.frame,GX,.05+i*.375,D/2+.06);

  /* ---------- Szene 2: Schichtaufbau Hauptdach ---------- */
  /* Dampfsperre, an der Attika hochgeführt */
  grow(box(2*IX,.006,2*IZ,mat.vapour,0,YV,0),"x",-1,.2,.04);
  [[0,IZ-.004,2*IX,.008],[0,-IZ+.004,2*IX,.008]].forEach(([x,z,w,d],i)=>grow(box(w,ID+.02,d,mat.vapour,x,H+(ID+.02)/2,z),"y",-1,.236+i*.004,.014));
  [IX-.004,-IX+.004].forEach((x,i)=>grow(box(.008,ID+.02,2*IZ,mat.vapour,x,H+(ID+.02)/2,0),"y",-1,.24+i*.004,.014));

  /* Wärmedämmung: Platten im Verband, Aussparung für die Lichtkuppel */
  const unit=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D(),zero=new THREE.Matrix4().makeScale(0,0,0);
  const sets=[];
  function boards(m,items){const im=new THREE.InstancedMesh(unit,m,items.length);im.castShadow=im.receiveShadow=true;im.frustumCulled=false;root.add(im);sets.push({im,items});return im}
  function paintSets(s){for(const {im,items} of sets){items.forEach((b,i)=>{const e=ease(clamp((s-b.t)/b.d));
      if(e<=0){im.setMatrixAt(i,zero);return}
      const a=b.axis||"y",an=b.anchor||-1;dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.dd);dummy.rotation.set(0,0,0);
      dummy.scale[a]*=e;dummy.position[a]+=an*b[{x:"w",y:"h",z:"dd"}[a]]/2*(1-e);
      if(a==="y"){dummy.scale.x*=.96+.04*e;dummy.scale.z*=.96+.04*e}
      dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix)});im.instanceMatrix.needsUpdate=true}}
  const SKY={x:2.28,z:-1.05,w:2.28,d:2.1};
  {const it=[],cw=2*IX/10,cd=2*IZ/8;
   for(let j=0;j<8;j++)for(let i=0;i<10;i++){if((i===6||i===7)&&(j===2||j===3))continue;
     const x=-IX+cw/2+i*cw,z=-IZ+cd/2+j*cd,k=(i+j*1.25)/(9+8.75);
     it.push({x,z,y:YI+ID/2,w:cw-.012,h:ID,dd:cd-.012,t:.255+k*.065,d:.014})}
   boards(mat.insul,it)}

  /* ---------- Szene 3: Abdichtungsbahnen, Nähte, Details ---------- */
  const rollGeo=new THREE.CylinderGeometry(1,1,1,28);rollGeo.rotateZ(Math.PI/2);
  /* Bahn wird von einer Rolle entlang z ausgerollt (dir +1: von hinten nach vorne) */
  function sheet(m,x,w,y,z0,z1,start,dur,th=.012){
    const len=Math.abs(z1-z0),dir=Math.sign(z1-z0),zc=(z0+z1)/2;
    const s=box(w,th,len,m,x,y,zc);s.castShadow=false;
    const r=new THREE.Mesh(rollGeo,m);r.castShadow=true;root.add(r);
    stage(s,start,dur,e=>{s.scale.z=Math.max(e,.001);s.position.z=z0+dir*len*e/2});
    steps.push({obj:r,start,dur,hideAtEnd:true,apply:e=>{const rad=.11-.05*e;r.scale.set(w*.98,rad,rad);r.position.set(x,y+th/2+rad,z0+dir*(len*e+rad*.4))}});
    r.visible=false;return s}
  /* Schweißnaht mit Heißluftgerät */
  function seam(x,y,z0,z1,start,dur){
    const len=Math.abs(z1-z0),dir=Math.sign(z1-z0);
    const s=box(.05,.003,len,mat.seam,x,y,(z0+z1)/2);s.castShadow=false;
    stage(s,start,dur,e=>{s.scale.z=Math.max(e,.001);s.position.z=z0+dir*len*e/2});
    const g=new THREE.Group();box(.2,.13,.34,mat.coping,0,.12,dir*.22,g);box(.04,.04,.18,mat.steel,0,.05,dir*.06,g);
    const n=new THREE.Mesh(new THREE.SphereGeometry(.045,14,10),glow);n.position.set(0,.02,0);g.add(n);root.add(g);
    g.visible=false;steps.push({obj:g,start,dur,hideAtEnd:true,apply:e=>g.position.set(x,y,z0+dir*len*e)});
    return s}
  const SW=2.0,SP=2*IX/6;
  for(let i=0;i<6;i++)sheet(mat.membrane,-IX+SP*(i+.5),SW,YM+.008+(i%2)*.004,-IZ,IZ,.345+i*.016,.045);
  for(let k=1;k<6;k++)seam(-IX+k*SP+.03,YM+.02,IZ,-IZ,.43+(k-1)*.014,.024);

  /* Attika: Bahn innen hoch und über die Krone, dann Abdeckung aus Metall */
  const UP=AT-ID+.02,YU=YM+UP/2-.01;
  [[0,IZ-.006,2*IX,.012,"x"],[0,-IZ+.006,2*IX,.012,"x"],[IX-.006,0,.012,2*IZ,"z"],[-IX+.006,0,.012,2*IZ,"z"]].forEach(([x,z,w,d],i)=>
    grow(box(w,UP,d,mat.membrane,x,YU,z),"y",-1,.475+i*.005,.016));
  const YC=H+AT;
  [[0,IZ+AW/2,W,AW+.02,"x"],[0,-IZ-AW/2,W,AW+.02,"x"],[IX+AW/2,0,AW+.02,D,"z"],[-IX-AW/2,0,AW+.02,D,"z"]].forEach(([x,z,w,d,a],i)=>
    grow(box(w,.012,d,mat.membrane,x,YC+.006,z),a,-1,.49+i*.004,.016));
  [[0,IZ+AW/2,W+.14,AW+.14,"x"],[0,-IZ-AW/2,W+.14,AW+.14,"x"],[IX+AW/2,0,AW+.14,D+.14,"z"],[-IX-AW/2,0,AW+.14,D+.14,"z"]].forEach(([x,z,w,d,a],i)=>{
    grow(box(w,.04,d,mat.coping,x,YC+.034,z),a,-1,.505+i*.007,.022);
    const o=a==="x"?[x,z+Math.sign(z)*(d/2-.01)]:[x+Math.sign(x)*(w/2-.01),z];
    grow(box(a==="x"?w:.02,.12,a==="x"?.02:d,mat.coping,o[0],YC-.02,o[1]),a,-1,.507+i*.007,.022)});

  /* Durchdringungen: Lichtkuppel-Aufsetzkranz und Lüftungsrohr mit Manschetten */
  box(SKY.w,AT+.08,SKY.d,mat.upstand,SKY.x,H+(AT+.08)/2,SKY.z);
  {const c=box(SKY.w+.03,AT+.06-ID,SKY.d+.03,mat.membrane,SKY.x,YM+(AT+.06-ID)/2,SKY.z);grow(c,"y",-1,.515,.016);
   grow(box(SKY.w+.07,.05,SKY.d+.07,mat.frame,SKY.x,H+AT+.105,SKY.z),"x",-1,.528,.012);
   const dm=new THREE.Mesh(new THREE.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2),mat.dome);dm.position.set(SKY.x,H+AT+.13,SKY.z);root.add(dm);
   stage(dm,.535,.016,e=>dm.scale.set(SKY.w/2-.02,.42*Math.max(e,.001),SKY.d/2-.02))}
  const PIPE={x:-3.1,z:1.4};
  {const p=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.1,18),mat.pipe));p.position.set(PIPE.x,H+.55,PIPE.z);root.add(p);
   const cap=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.05,18),mat.pipe));cap.position.set(PIPE.x,H+1.12,PIPE.z);root.add(cap);
   const fl=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.34,.36,.012,28),mat.membrane));fl.position.set(PIPE.x,YM+.02,PIPE.z);root.add(fl);
   stage(fl,.525,.012,e=>fl.scale.set(Math.max(e,.001),1,Math.max(e,.001)));
   const sl=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.085,.1,.22,18),mat.membrane));sl.position.set(PIPE.x,YM+.13,PIPE.z);root.add(sl);
   const sy=sl.position.y;stage(sl,.532,.012,e=>{sl.scale.y=Math.max(e,.001);sl.position.y=sy-.11*(1-e)})}
  /* Entwässerung: Gullys und Notüberlauf durch die Attika */
  [[-4.6,-3.2],[4.4,3.1]].forEach(([x,z],i)=>{
    const f=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.01,28),mat.seam));f.position.set(x,YM+.02,z);root.add(f);
    const gr=shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.08,20),mat.joist));gr.position.set(x,YM+.06,z);root.add(gr);
    stage(f,.545+i*.006,.012,e=>f.scale.set(Math.max(e,.001),1,Math.max(e,.001)));stage(gr,.55+i*.006,.01,e=>gr.scale.set(1,Math.max(e,.001),1))});
  grow(box(.32,.14,AW+.3,mat.alu,-4.6,YM+.11,IZ+AW/2+.08),"z",-1,.553,.012);

  /* ---------- Szene 4: Garagen-Foliendach ---------- */
  const GZ0=D/2,GZ1=D/2-GD;
  grow(box(GW-.04,.004,GD-.04,mat.fleece,GX,GH+.004,GZ),"z",1,.575,.02);
  sheet(mat.epdm,GX-GW/4-.03,GW/2+.08,GH+.012,GZ0,GZ1,.592,.036,.01);
  sheet(mat.epdm,GX+GW/4+.03,GW/2+.08,GH+.016,GZ0,GZ1,.61,.036,.01);
  seam(GX+.04,GH+.023,GZ0,GZ1,.643,.016);
  grow(box(.012,.27,GD,mat.epdm,W/2+.006,GH+.14,GZ),"y",-1,.652,.012);
  grow(box(.04,.05,GD,mat.alu,W/2+.02,GH+.29,GZ),"z",1,.657,.014);
  grow(box(GW+.1,.14,.05,mat.alu,GX,GH+.02,GZ0+.025),"x",-1,.66,.014);
  grow(box(.05,.14,GD+.1,mat.alu,W/2+GW+.025,GH+.02,GZ),"z",1,.666,.014);
  grow(box(GW+.1,.14,.05,mat.alu,GX,GH+.02,GZ1-.025),"x",1,.672,.014);

  /* ---------- Szene 5: Dachterrasse ---------- */
  const TX0=-W/2-TW,TX1=-W/2,TYV=TH+.003,TYI=TH+.006,TID=.2,TYM=TYI+TID;
  grow(box(TW,.006,TD,mat.vapour,TX,TYV,0),"x",1,.686,.012);
  {const it=[],cw=TW/4,cd=TD/8;for(let j=0;j<8;j++)for(let i=0;i<4;i++){const k=(3-i+j*1.2)/(3+8.4);
     it.push({x:TX0+cw/2+i*cw,z:-TD/2+cd/2+j*cd,y:TYI+TID/2,w:cw-.012,h:TID,dd:cd-.012,t:.694+k*.024,d:.01})}
   boards(mat.insul,it)}
  for(let i=0;i<3;i++)sheet(mat.membrane,TX1-(i+.5)*TW/3,TW/3+.08,TYM+.008+(i%2)*.004,-TD/2,TD/2,.72+i*.008,.018);
  for(let k=1;k<3;k++)seam(TX1-k*TW/3-.02,TYM+.02,TD/2,-TD/2,.742+(k-1)*.005,.008);
  /* Wandanschluss: Bahn an der Fassade hochgeführt, oben Klemmprofil */
  const WU=.36;
  grow(box(.012,WU,TD,mat.membrane,TX1-.006,TYM+WU/2,0),"y",-1,.748,.008);
  grow(box(.05,.05,TD,mat.alu,TX1-.025,TYM+WU+.02,0),"z",-1,.752,.008);
  /* Randabschluss: Blende über den Schichtaufbau an den freien Kanten */
  const BH=.44,BY=TH+BH/2-.12;
  grow(box(TW+.06,BH,.03,mat.alu,TX,BY,TD/2+.015),"x",1,.754,.008);
  grow(box(.03,BH,TD+.06,mat.alu,TX0-.015,BY,0),"z",1,.756,.008);
  grow(box(TW+.06,BH,.03,mat.alu,TX,BY,-TD/2-.015),"x",-1,.758,.008);
  /* Stelzlager, Unterkonstruktion und Dielen */
  const PH=.1,YP=TYM+.014,JH=.045,YJ=YP+PH,DH=.026,YD=YJ+JH;
  {const it=[];const xs=[],zs=[];for(let i=0;i<7;i++)xs.push(TX0+.35+i*(TW-.7)/6);for(let j=0;j<10;j++)zs.push(-TD/2+.35+j*(TD-.7)/9);
   xs.forEach((x,i)=>zs.forEach((z,j)=>it.push({x,z,y:YP+PH/2,w:.14,h:PH,dd:.14,t:.762+(i*10+j)/70*.009,d:.004})));
   const im=boards(mat.joist,it);im.geometry=new THREE.CylinderGeometry(.5,.5,1,12);
   const jt=xs.map((x,i)=>({x,z:0,y:YJ+JH/2,w:.06,h:JH,dd:TD-.5,axis:"z",anchor:-1,t:.772+i*.0015,d:.006}));boards(mat.joist,jt)}
  {const it=[],n=58,bw=(TD-.24)/n;for(let k=0;k<n;k++){const z=-TD/2+.12+bw/2+k*bw;
     it.push({x:(TX0+.05+TX1-.08)/2,z,y:YD+DH/2,w:TW-.13,h:DH,dd:bw-.012,axis:"x",anchor:1,t:.781+k/n*.019,d:.005})}
   const im=boards(mat.deck,it);
   const col=new THREE.Color();it.forEach((_,i)=>{col.set(0xffffff).multiplyScalar(.9+((i*7919)%13)/13*.18);im.setColorAt(i,col)});im.instanceColor.needsUpdate=true}
  /* Glasgeländer seitlich an der Blende montiert, Handlauf aus Edelstahl */
  const RY0=TH+.02,RH=YD+DH+1.02-RY0,RTOP=RY0+RH;
  [[TX,TD/2+.06,TW+.1,.02,"x",1],[TX0-.06,0,.02,TD+.12,"z",1],[TX,-TD/2-.06,TW+.1,.02,"x",-1]].forEach(([x,z,w,d,a,an],i)=>{
    grow(box(w,RH,d,mat.rail,x,RY0+RH/2,z),"y",-1,.8+i*.004,.01);
    grow(box(a==="x"?w:.05,.05,a==="x"?.05:d,mat.steel,x,RTOP+.025,z),a,an,.806+i*.004,.01)});

  /* ---------- Kamerafahrt ---------- */
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const KEYS=[
    [0,   V(40,6.5,52),   V(-.5,5.2,0)],
    [.1,  V(32,9.5,41),   V(-.5,4.8,0)],
    [.2,  V(17,20,21),    V(0,5.8,0)],
    [.28, V(8.5,20,16),   V(0,6.2,-.2)],
    [.36, V(-7,17.5,15.5),V(0,6.3,-.4)],
    [.44, V(2.5,12.5,16.5),V(0,6.4,-1.2)],
    [.51, V(-12,13.5,11.5),V(-.5,6.6,0)],
    [.555,V(10.5,13.5,12),V(2,6.6,-1)],
    [.6,  V(10,6.6,12.5), V(8,3.1,-.3)],
    [.645,V(10.5,6,8.5),  V(8,3.05,-1.8)],
    [.685,V(17.5,7,11.5), V(8,3,.8)],
    [.725,V(-1,10.5,17),  V(-8.5,3.4,-.2)],
    [.775,V(-12,10,14),   V(-8.4,3.5,-.4)],
    [.825,V(-19,8,12),    V(-8.2,3.8,0)],
    [.9,  V(19,9.5,26),  V(-.8,3.6,0)],
    [.95, V(23,4.6,30.5), V(-.6,4.3,0)],
    [1,   V(24.5,4.4,32.5),V(-.6,4.4,0)]
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
    camera.fov=THREE.MathUtils.radToDeg(vf);camera.aspect=asp;camera.setViewOffset(w,h,0,h*(asp<1?.1:.07),w,h);camera.updateProjectionMatrix();
    const realH=2*Math.atan(Math.tan(vf/2)*asp);distScale=Math.max(1,Math.tan(hf/2)/Math.tan(realH/2))*(asp<1?1.12:1);
    lookDrop=0;need=true}

  /* ---------- Texte und Überblendungen ---------- */
  const ui={logo:document.getElementById("intro"),veil:document.getElementById("filmVeil"),hint:document.getElementById("filmHint"),fade:document.getElementById("filmFade"),end:document.getElementById("filmEnd"),skip:skip,
    lines:[...film.querySelectorAll(".film-lines p")].map(p=>({el:p,a:+p.dataset.a,b:+p.dataset.b})),
    steps:[...film.querySelectorAll(".film-steps")].map(o=>({el:o,a:+o.dataset.a,b:+o.dataset.b,li:[...o.children].map(l=>({el:l,t:+l.dataset.t}))}))};
  const win01=(s,a,b,f=.035)=>Math.min(clamp((s-a)/f),clamp((b-s)/f));
  let lastS=-1;
  function paint(s,t){
    uTime.value=t;clouds.rotation.y=t*.004;
    if(s!==lastS){
      for(const st of steps){const e=ease(clamp((s-st.start)/st.dur));st.obj.visible=e>0&&!(st.hideAtEnd&&e>=1);if(st.obj.visible)st.apply(e)}
      paintSets(s);setSun(s);
      const look=camAt(s,2),pos=camAt(s,1);
      camera.position.copy(look).addScaledVector(pos.sub(look),distScale);look.y-=lookDrop;camera.lookAt(look);
      sky.position.copy(camera.position);clouds.position.copy(camera.position);
      paintUI(s);lastS=s}
    renderer.render(scene,camera);
  }
  function paintUI(s){
    const lo=clamp((s-.035)/.07);
    ui.logo.style.opacity=1-lo;ui.logo.style.transform=`translateY(${-40*lo}px) scale(${1-.05*lo})`;ui.logo.style.visibility=lo>=1?"hidden":"";
    if(ui.hint)ui.hint.style.opacity=1-clamp(s/.03);
    canvas.style.opacity=clamp((s-.02)/.09);if(ui.veil)ui.veil.style.opacity=canvas.style.opacity;
    for(const l of ui.lines){const o=win01(s,l.a,l.b);l.el.style.opacity=o;l.el.style.transform=`translateY(${(1-o)*(s<(l.a+l.b)/2?24:-24)}px)`}
    for(const g of ui.steps){g.el.style.opacity=win01(s,g.a,g.b,.02);for(const l of g.li)l.el.classList.toggle("on",s>=l.t)}
    const eo=clamp((s-.875)/.035);ui.end.style.opacity=eo;ui.end.style.transform=`translateY(${(1-eo)*24}px)`;ui.end.style.pointerEvents=eo>.5?"auto":"none";
    ui.fade.style.opacity=clamp((s-.955)/.045);
    if(ui.skip)ui.skip.style.opacity=s>.9?0:1;
    document.body.classList.toggle("in-film",s<.985&&inView());
  }

  /* ---------- Scroll-Kopplung mit weichem Nachlauf, Wind läuft weiter ---------- */
  const still=/filmshot/.test(location.search);/* nur für Testbilder */
  let target=0,cur=0,need=true,raf=0,last=performance.now(),time=0,frames=0,slow=0;
  const progress=()=>{const r=film.getBoundingClientRect(),span=r.height-innerHeight;return span>0?clamp(-r.top/span):0};
  const inView=()=>{const r=film.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
  function tick(now){raf=0;const raw=(now-last)/1000,dt=Math.min(.1,raw);last=now;
    const d=target-cur;cur=Math.abs(d)<.0004||still?target:cur+d*(1-Math.exp(-dt*9));
    if(!inView()||document.hidden){document.body.classList.remove("in-film");return}
    time+=dt;if(need){lastS=-1;need=false}paint(cur,time);
    /* Wird es auf schwachen Geräten zäh, rechnet der Film mit geringerer Auflösung */
    frames++;slow+=raw;if(frames===45){if(slow/45>.034&&dpr>1){dpr=Math.max(1,dpr-.25);renderer.setPixelRatio(dpr);resize()}frames=0;slow=0}
    if(!still)raf=requestAnimationFrame(tick)}
  const kick=()=>{target=progress();if(!raf&&inView()&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick)}};
  addEventListener("scroll",kick,{passive:true});
  addEventListener("resize",()=>{resize();kick()});
  document.addEventListener("visibilitychange",kick);
  resize();cur=target=progress();paint(cur,0);film.classList.add("film-ready");kick();
}
