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
console.log(`Syntax parsed; ${tests} tests passed. Photoshop APIs are mocked, not host-tested.`);
