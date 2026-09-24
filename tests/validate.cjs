const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const file = 'outputs/Artboards 2 AE.jsx';
const source = fs.readFileSync(file,'utf8').replace(/^#target.*\n/,'');
new vm.Script(source, {filename:file});
const start = source.indexOf('\n    try {\n        if (!app.documents.length)');
assert(start > 0);
const code = source.slice(0,start) + `
    api = { translateRoot:translateRoot, checkPositions:checkPositions,
      alignBoards:alignBoards, setBoards:function(b){boards=b;},
      setBounds:function(f){bounds=f;}, setRecords:function(r){records=r;},
      crop:cropWithoutDeleting, setCopy:function(d){copy=d;}, checkTree:checkTree,
      setReplacements:function(r){replacements=r;} };
}());`;
const context = {app:{preferences:{rulerUnits:'px'},displayDialogs:'all'},
 stringIDToTypeID:x=>x,charIDToTypeID:x=>x,
 UnitValue:function(value,unit){return {value,unit};},DialogModes:{NO:0},
 ActionDescriptor:function(){this.data={};this.putUnitDouble=(k,u,v)=>this.data[k]={u,v};
 this.putObject=(k,t,v)=>this.data[k]={t,v};this.putBoolean=(k,v)=>this.data[k]=v;},
 executeAction:(event,d)=>{context.lastAction={event,data:d.data};}};
vm.createContext(context);vm.runInContext(code,context);
const api=context.api;let tests=0;
function test(name,run){run();tests++;console.log('PASS '+name);}
const expected=[-200,-50,-100,50];
function translation(actual){let calls=[];api.setBounds(()=>actual);api.translateRoot({translate:(x,y)=>calls.push([x.value,y.value])},{id:1,box:expected});return calls;}
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
 const doc={typename:'Document',layers:[]};
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
console.log(`Syntax parsed; ${tests} tests passed. Photoshop APIs are mocked, not host-tested.`);
