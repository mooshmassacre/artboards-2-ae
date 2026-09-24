const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const file = process.argv[2] || 'outputs/Artboards 2 AE.jsx';
const source = fs.readFileSync(file,'utf8').replace(/^#target.*\n/,'');
new vm.Script(source, {filename:file});
const start = source.indexOf('\n    try {\n        if (!app.documents.length)');
assert(start > 0);
const code = source.slice(0,start) + `
    api = { translateRoot:translateRoot, checkPositions:checkPositions,
      disableArtboardAutomation:typeof disableArtboardAutomation==='function'?disableArtboardAutomation:null,
      checkParents:typeof checkParents==='function'?checkParents:null,
      alignBoards:alignBoards, setBoards:function(b){boards=b;},
      setBounds:function(f){bounds=f;}, setRecords:function(r){records=r;},
      crop:cropWithoutDeleting, setCopy:function(d){copy=d;hostDoc=d;app.activeDocument=d;}, checkTree:checkTree,
      setReplacements:function(r){replacements=r;} };
}());`;
const context = {app:{preferences:{rulerUnits:'px'},displayDialogs:'all'},
 stringIDToTypeID:x=>x,charIDToTypeID:x=>x,
 UnitValue:function(value,unit){return {value,unit};},DialogModes:{NO:0},
 ActionReference:function(){this.putEnumerated=(type,ordinal,value)=>{this.target={type,ordinal,value};};this.putIdentifier=(type,id)=>{this.id=id;};},
 ActionDescriptor:function(){this.data={};this.putReference=(k,r)=>this.data[k]=r;this.putUnitDouble=(k,u,v)=>this.data[k]={u,v};
 this.putObject=(k,t,v)=>this.data[k]={t,v};this.putBoolean=(k,v)=>this.data[k]=v;},
 executeAction:(event,d)=>{
  context.lastAction={event,data:d.data};
  if(context.actionTrace)context.actionTrace.push(context.lastAction);
  if(event==='move'){
   function findHost(c,id){for(const l of (c.layers||[])){if(l.id===id)return l;const r=findHost(l,id);if(r)return r;}}
   const layer=findHost(context.hostDoc,d.data.null.id);assert(layer,'Move must target an existing layer ID');
   const delta=d.data.to.v.data;
   layer.translate({value:delta.horizontal.v},{value:delta.vertical.v});
  }
 }};
vm.createContext(context);vm.runInContext(code,context);
const api=context.api;let tests=0;
function test(name,run){run();tests++;console.log('PASS '+name);}
const expected=[-200,-50,-100,50];
function translation(actual){let calls=[];let current=actual.slice();const root={id:90,name:'test',translate:(x,y)=>{calls.push([x.value,y.value]);current=current.map((v,i)=>v+(i%2?y.value:x.value));}};api.setCopy({layers:[root],componentChannels:['RGB'],selection:{deselect(){}}});api.setBounds(()=>current);api.translateRoot(root,{id:1,box:expected});return calls;}
test('No double subtraction when native coordinates already match',()=>assert.deepEqual(translation(expected),[]));
test('Restore negative coordinates after native origin shift',()=>assert.deepEqual(translation([0,0,100,100]),[[-200,-50]]));
test('Compensate positive and negative deltas together',()=>assert.deepEqual(translation([-300,20,-200,120]),[[100,-70]]));
test('Reject changed dimensions',()=>assert.throws(()=>translation([0,0,101,100]),/limites/));
test('Reject subpixel translation to avoid bitmap resampling',()=>assert.throws(()=>translation([-199.5,-50,-99.5,50]),/fracionário/));
test('Accept normalized coordinates for a negative canvas origin',()=>{api.setRecords([{id:1,name:'A',box:expected}]);api.setBounds(()=>[0,0,100,100]);api.checkPositions(200,50);});
test('Reject one displaced edge',()=>{api.setBounds(()=>[0,0,101,100]);assert.throws(()=>api.checkPositions(200,50),/posição/);});
test('Ignore empty geometry while checking populated layers',()=>{api.setRecords([{id:1,name:'Empty',box:[0,0,0,0]}]);api.setBounds(()=>{throw Error('Must not read empty geometry');});api.checkPositions(200,50);});
test('Crop explicitly preserves pixels and sets all four coordinates',()=>{api.setCopy({selection:{deselect(){}}});api.crop([-200,-50,1000,800]);assert.equal(context.lastAction.event,'Crop');assert.equal(context.lastAction.data['Dlt '],false);assert.equal(context.lastAction.data['T   '].v.data.Left.v,-200);assert.equal(context.lastAction.data['T   '].v.data['Btom'].v,800);});
test('No rasterization or flattening calls',()=>assert(!/\.(?:flatten|merge|rasterize|resizeImage)\s*\(/.test(source)));
test('Save path must not already exist',()=>assert(source.indexOf('if (file.exists)') < source.indexOf('copy.saveAs(')));
test('Align multiple boards before cropping: preserve local coordinates, negative origins and external layers',()=>{
 const doc={typename:'Document',layers:[],componentChannels:['RGB'],selection:{deselect(){}}};
 const boxes={1:[-190,-40,-150,0],2:[810,360,850,400],3:[-790,-340,-750,-300],4:[20,30,50,60],11:[-200,-50,-199,-49],12:[800,350,801,351],13:[-800,-350,-799,-349]};
 const boards=[{id:101,rect:[-200,-50,100,150],marker:{id:11,box:boxes[11].slice()}},{id:102,rect:[800,350,1100,550],marker:{id:12,box:boxes[12].slice()}},{id:103,rect:[-800,-350,-500,-150],marker:{id:13,box:boxes[13].slice()}}];
 function group(id,leaf,marker){
  const g={id,typename:'LayerSet',parent:doc,layers:[]};
  const nested={id:id+1000,typename:'LayerSet',parent:g,layers:[]};
  nested.layers.push({id:leaf,typename:'ArtLayer',parent:nested});
  g.layers=[nested,{id:marker,typename:'ArtLayer',parent:g}];
  g.translate=(x,y)=>{for(const key of [leaf,marker])boxes[key]=boxes[key].map((v,i)=>v+(i%2?y.value:x.value));};
  return g;
 }
 doc.layers=[group(101,1,11),group(102,2,12),group(103,3,13),{id:4,typename:'ArtLayer',parent:doc}];
 const records=[1,2,3,4].map(id=>({id,name:'same duplicate name',box:boxes[id].slice()}));
 api.setCopy(doc);api.setBoards(boards);api.setRecords(records);api.setReplacements({});api.setBounds(id=>boxes[id]);
 api.alignBoards(boards[0].rect);
 assert.deepEqual(boxes[1],[-190,-40,-150,0]);
 assert.deepEqual(boxes[2],boxes[1]);assert.deepEqual(boxes[3],boxes[1]);
 assert.deepEqual(boxes[4],[20,30,50,60]);
 // Final crop subtracts first board origin: every board's child ends up at (10,10).
 for(const id of [1,2,3])assert.deepEqual(boxes[id].map((v,i)=>v+(i%2?50:200)),[10,10,50,50]);
 // An unshifted second board is exactly the reported regression: reject it.
 boxes[2]=[810,360,850,400];
 assert.throws(()=>api.checkPositions(0,0,[{id:2,name:'second',box:[-190,-40,-150,0]}]),/posição/);
});
test('Alignment runs before backgrounds and final canvas crop',()=>{
 const main=source.slice(start);
 assert(main.indexOf('alignBoards(canvas)')<main.indexOf('solidBackground(group,area'));
 assert(main.indexOf('alignBoards(canvas)')<main.indexOf('cropWithoutDeleting(canvas)'));
 assert(main.includes('var offset = boardOffset(board,canvas)'));
});
for(const count of [11,12,20,37]) test(`Align ${count} shuffled boards with duplicate names and nested groups`,()=>{
 const doc={typename:'Document',layers:[],componentChannels:['RGB'],selection:{deselect(){}}}, boxes={}, records=[], boardList=[], replacements={};
 for(let n=0;n<count;n++){
  const x=(n%6)*800-2400, y=Math.floor(n/6)*700-1400;
  const oldID=10000+n, id=20000+n, leaf=30000+n, mark=40000+n;
  boxes[leaf]=[x+23,y+41,x+160,y+99];boxes[mark]=[x,y,x+1,y+1];
  const root={id,name:'duplicate',typename:'LayerSet',parent:doc,layers:[]};
  const nested={id:50000+n,typename:'LayerSet',parent:root,layers:[]};
  nested.layers.push({id:leaf,name:'Músicas',typename:'ArtLayer',parent:nested});
  root.layers=[nested,{id:mark,typename:'ArtLayer',parent:root}];
  root.translate=(dx,dy)=>{for(const key of [leaf,mark])boxes[key]=boxes[key].map((v,i)=>v+(i%2?dy.value:dx.value));};
  doc.layers.push(root);replacements['i'+oldID]=id;
  boardList.push({id:oldID,name:'Artboard '+(n+1),rect:[x,y,x+640,y+480],marker:{id:mark,box:boxes[mark].slice()}});
  records.push({id:leaf,name:'Músicas',box:boxes[leaf].slice()});
 }
 // Numeric name order, layer order and canvas placement intentionally disagree.
 const order=[...Array(count).keys()].sort((a,b)=>String(b+1).localeCompare(String(a+1)));
 doc.layers=order.map(i=>doc.layers[i]);const boards=order.map(i=>boardList[i]);
 api.setCopy(doc);api.setBoards(boards);api.setRecords(records);api.setReplacements(replacements);api.setBounds(id=>boxes[id]);
 const canvas=boards[0].rect;api.alignBoards(canvas);
 for(const rec of records)assert.deepEqual(boxes[rec.id],[canvas[0]+23,canvas[1]+41,canvas[0]+160,canvas[1]+99]);
 assert.deepEqual(doc.layers.map(l=>l.id),order.map(n=>20000+n));
});
if(source.includes('function positionFailure(')) test('Diagnostic includes measured bounds and rejects a linked-layer style unintended movement',()=>{
 // Reuse the last fixture and perturb one leaf as if another group dragged it.
 const rec={id:30000,name:'Músicas',box:[10,10,20,20]};
 api.setBounds(()=>[18,10,28,20]);
 assert.throws(()=>api.checkPositions(0,0,[rec]),e=>e.message.includes('Esperado: [10, 10, 20, 20]')&&e.message.includes('Obtido: [18, 10, 28, 20]')&&e.message.includes('Diferenças: [8, 0, 8, 0]'));
});
if(source.includes('function moveGroupByID(')) {
 test('Native Move targets a single ID with pixel units, not a DOM translate call',()=>{
  translation([0,0,100,100]);
  assert.equal(context.lastAction.event,'move');assert.equal(context.lastAction.data.null.id,90);
  assert.equal(context.lastAction.data.to.v.data.vertical.u,'pixelsUnit');
  assert(!/root\.translate\(/.test(source));
 });
 test('Stop on first extra 10944px text movement, before moving another group',()=>{
  const doc={typename:'Document',layers:[],componentChannels:['RGB'],selection:{deselect(){}}};
  const boxes={116:[3123,11637,3430,11671],11:[137,-1824,138,-1823],12:[137,9120,138,9121],13:[137,16416,138,16417]};
  let laterMoves=0;
  const root1={id:101,name:'First',typename:'LayerSet',parent:doc,layers:[]};
  const root2={id:102,name:'Grupo A',typename:'LayerSet',parent:doc,layers:[]};
  const root3={id:103,name:'Last',typename:'LayerSet',parent:doc,layers:[]};
  for(const [r,m] of [[root1,11],[root2,12],[root3,13]])r.layers.push({id:m,typename:'ArtLayer',parent:r});
  root2.layers.push({id:116,name:'Músicas',typename:'ArtLayer',kind:'TEXT',parent:root2});
  root2.translate=(dx,dy)=>{boxes[12]=boxes[12].map((v,i)=>v+(i%2?dy.value:dx.value));boxes[116]=boxes[116].map((v,i)=>v+(i%2?dy.value*2:dx.value));};
  root3.translate=()=>laterMoves++;
  doc.layers=[root1,root2,root3];
  const boards=[{id:101,name:'First',rect:[137,-1824,4000,3000],marker:{id:11,box:boxes[11].slice()}},{id:102,name:'Grupo A',rect:[137,9120,4000,14000],marker:{id:12,box:boxes[12].slice()}},{id:103,name:'Last',rect:[137,16416,4000,22000],marker:{id:13,box:boxes[13].slice()}}];
  api.setCopy(doc);api.setBoards(boards);api.setRecords([{id:116,name:'Músicas',box:boxes[116].slice()}]);api.setReplacements({});api.setBounds(id=>boxes[id]);
  assert.throws(()=>api.alignBoards(boards[0].rect),e=>e.message.includes('Diferenças: [0, -10944, 0, -10944]')&&e.message.includes('Grupo A (ID 102)'));
  assert.equal(laterMoves,0);
 });
}
if(api.disableArtboardAutomation){
 test('Disable Adobe artboard auto-nesting, repositioning and expansion on active copy',()=>{
  api.setCopy({id:902,layers:[]});api.setBoards([{id:555}]);context.actionTrace=[];
  api.disableArtboardAutomation();
  const actions=context.actionTrace.filter(x=>x.event==='editArtboardEvent');
  assert.equal(actions.length,3);
  for(const [i,key] of ['autoNestEnabled','autoPositionEnabled','autoExpandEnabled'].entries()){
   assert.equal(actions[i].data[key],false);
   assert.equal(actions[i].data.null.target.type,'layer');
  }
  assert.equal(context.actionTrace[0].event,'select');assert.equal(context.actionTrace[0].data.null.id,555);
  context.app.activeDocument={id:999};
  assert.throws(()=>api.disableArtboardAutomation(),/cópia ativa/);
  context.actionTrace=null;
 });
 test('Reject Grupo A nested in Grupo B before either can be aligned',()=>{
  const doc={id:902,typename:'Document',layers:[]};
  const tobias={id:228,name:'Grupo A',typename:'LayerSet',parent:doc,layers:[]};
  const monika={id:230,name:'Grupo B',typename:'LayerSet',parent:doc,layers:[]};
  const text={id:116,name:'Músicas',typename:'ArtLayer',parent:tobias};tobias.layers=[text];doc.layers=[tobias,monika];
  api.setCopy(doc);api.setRecords([{id:80,parent:0,name:'Grupo A'},{id:116,parent:80,name:'Músicas'},{id:90,parent:0,name:'Grupo B'}]);
  api.setReplacements({i80:228,i90:230});
  api.checkParents([80,90]);
  tobias.parent=monika;monika.layers=[tobias];doc.layers=[monika];
  assert.throws(()=>api.checkParents([80,90]),e=>e.message.includes('Hierarquia alterada')&&e.message.includes('Pai esperado (ID): 0')&&e.message.includes('Pai obtido (ID): 230'));
 });
 test('Check parent identities for 11 reordered sibling groups and reject changed root order',()=>{
  const doc={id:903,typename:'Document',layers:[]},records=[],roots=[],map={};
  for(const n of [7,1,10,3,8,0,6,2,9,4,5]){
   const group={id:100+n,typename:'LayerSet',name:'duplicate',parent:doc,layers:[]};
   const layer={id:200+n,typename:'ArtLayer',parent:group};group.layers=[layer];doc.layers.push(group);
   roots.push(300+n);map['i'+(300+n)]=100+n;
   records.push({id:300+n,parent:0,name:'duplicate'},{id:200+n,parent:300+n,name:'Músicas'});
  }
  api.setCopy(doc);api.setRecords(records);api.setReplacements(map);api.checkParents(roots);
  doc.layers.reverse();assert.throws(()=>api.checkParents(roots),/Ordem principal/);
 });
 test('Disable automation before mutation and validate parents after each conversion',()=>{
  const main=source.slice(start);
  assert(main.indexOf('disableArtboardAutomation()')<main.indexOf('makeMarker(boards[i])'));
  assert(main.indexOf('disableArtboardAutomation()')<main.indexOf('convert(boards[i])'));
  assert(main.includes('convert(boards[i]); checkParents(roots);'));
  assert(main.indexOf('checkParents(roots)')<main.indexOf('alignBoards(canvas)'));
  assert(source.includes('var children = board.children.slice(0)'));
 });
}
console.log(`Syntax parsed; ${tests} tests passed. Photoshop APIs are mocked, not host-tested.`);
