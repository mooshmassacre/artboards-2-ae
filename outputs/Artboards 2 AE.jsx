#target photoshop
/* Artboards 2 AE — v1.0.1
   Copyright (c) 2026 @mooshmassacre. Direitos reservados conforme lei aplicavel.
   Licenca proprietaria restrita: consulte LICENSE.md antes de usar ou adaptar.
   Creditos obrigatorios: Artboards 2 AE — @mooshmassacre.
   Uso comercial: cadastro escrito e royalties de 10% do lucro por trabalho,
   conforme definicoes, deducoes e condicoes da licenca completa.
   Redistribuicao e sublicenciamento proibidos sem autorizacao escrita.
   ExtendScript / ScriptUI. Original document is never edited or saved.
   Native artboard dissolution + regrouping, with measured coordinate repair.
   No flatten(), merge(), rasterize(), resizeImage(), or color conversion.
   See LEIA-ME.md for limits and validation status.
*/
(function () {
    var TITLE = 'Artboards 2 AE';
    var S = stringIDToTypeID, C = charIDToTypeID;
    var copy = null, source = null, progress = null, stage = 'Inicialização';
    var oldUnits = app.preferences.rulerUnits, oldDialogs = app.displayDialogs;
    var records = [], boards = [], replacements = {}, markers = [], options;
    var TOL = 0.05;

    function fail(message) { throw new Error(message); }
    function near(a, b) { return Math.abs(a - b) <= TOL; }
    function desc(id) {
        var r = new ActionReference(); r.putIdentifier(S('layer'), id);
        return executeActionGet(r);
    }
    function num(d, key) {
        var k = S(key), t = d.getType(k);
        if (t === DescValueType.UNITDOUBLE) return d.getUnitDoubleValue(k);
        if (t === DescValueType.INTEGERTYPE) return d.getInteger(k);
        return d.getDouble(k);
    }
    function rect(d) { return [num(d, 'left'), num(d, 'top'), num(d, 'right'), num(d, 'bottom')]; }
    function bounds(id) {
        var d = desc(id), k = d.hasKey(S('boundsNoEffects')) ? S('boundsNoEffects') : S('bounds');
        return rect(d.getObjectValue(k));
    }
    function nonempty(b) { return b[2] > b[0] && b[3] > b[1]; }
    function isBoard(d) { return d.hasKey(S('artboardEnabled')) && d.getBoolean(S('artboardEnabled')); }
    function select(id, add) {
        var d = new ActionDescriptor(), r = new ActionReference();
        r.putIdentifier(S('layer'), id); d.putReference(S('null'), r);
        if (add) d.putEnumerated(S('selectionModifier'), S('selectionModifierType'), S('addToSelection'));
        d.putBoolean(S('makeVisible'), false); executeAction(S('select'), d, DialogModes.NO);
    }
    function find(container, id) {
        for (var i = 0; i < container.layers.length; i++) {
            var l = container.layers[i];
            if (l.id === id) return l;
            if (l.typename === 'LayerSet') { var result = find(l, id); if (result) return result; }
        }
        return null;
    }
    function resolved(id) { return replacements['i' + id] || id; }
    function ids(container) {
        var a = []; for (var i = 0; i < container.layers.length; i++) a.push(container.layers[i].id);
        return a;
    }
    function lockState(l) {
        var a = {}, keys = ['allLocked', 'pixelsLocked', 'positionLocked', 'transparentPixelsLocked'];
        for (var i = 0; i < keys.length; i++) { try { a[keys[i]] = l[keys[i]]; } catch (_) {} }
        return a;
    }
    function unlock(l) {
        l.allLocked = false;
        if (l.typename === 'ArtLayer') {
            try { l.pixelsLocked = false; } catch (_) {}
            try { l.positionLocked = false; } catch (_) {}
            try { l.transparentPixelsLocked = false; } catch (_) {}
        }
    }
    function restoreLocks(l, state) {
        var keys = ['pixelsLocked', 'positionLocked', 'transparentPixelsLocked', 'allLocked'];
        for (var i = 0; i < keys.length; i++) {
            if (typeof state[keys[i]] === 'boolean') l[keys[i]] = state[keys[i]];
        }
    }
    function scan(container, parent, depth) {
        for (var i = 0; i < container.layers.length; i++) {
            var l = container.layers[i], d = desc(l.id), ab = isBoard(d);
            var rec = {id:l.id, parent:parent, index:i, name:l.name, type:l.typename,
                visible:l.visible, opacity:l.opacity, blend:l.blendMode, locks:lockState(l), board:ab};
            if (l.typename === 'ArtLayer') { rec.kind = l.kind; rec.box = bounds(l.id); }
            if (l.typename === 'LayerSet') rec.children = ids(l);
            records.push(rec);
            if (ab) {
                // Photoshop artboards are top-level containers. Reject unusual structures explicitly.
                if (depth !== 0) fail('Artboard aninhada não suportada: ' + l.name);
                var ad = d.getObjectValue(S('artboard'));
                rec.rect = rect(ad.getObjectValue(S('artboardRect')));
                rec.bg = ad.getInteger(S('artboardBackgroundType'));
                rec.rgb = [255,255,255];
                if (rec.bg === 2) rec.rgb = [0,0,0];
                if (rec.bg === 4) {
                    var color = ad.getObjectValue(C('Clr '));
                    rec.rgb = [color.getDouble(C('Rd  ')), color.getDouble(C('Grn ')), color.getDouble(C('Bl  '))];
                }
                if (rec.bg < 1 || rec.bg > 4) fail('Tipo de fundo desconhecido em ' + l.name);
                // Never silently drop container masks, effects, or exceptional blending settings.
                var boolKeys = ['hasUserMask','hasVectorMask','hasFilterMask'];
                for (var j = 0; j < boolKeys.length; j++) {
                    if (d.hasKey(S(boolKeys[j])) && d.getBoolean(S(boolKeys[j])))
                        fail('A artboard "' + l.name + '" tem uma máscara própria. Mova essa máscara para um subgrupo antes de converter.');
                }
                if (d.hasKey(S('layerEffects')))
                    fail('A artboard "' + l.name + '" tem efeitos no contêiner. Mova-os para um subgrupo antes de converter.');
                if (d.hasKey(S('fillOpacity')) && d.getInteger(S('fillOpacity')) !== 255)
                    fail('A artboard "' + l.name + '" usa opacidade de preenchimento especial. Coloque esse tratamento em um subgrupo.');
                boards.push(rec);
            }
            if (l.typename === 'LayerSet') scan(l, l.id, depth + 1);
        }
    }
    function boxSelection(b) {
        copy.selection.select([[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]], SelectionType.REPLACE, 0, false);
    }
    function maskFromSelection() {
        var d = new ActionDescriptor(), r = new ActionReference();
        d.putClass(S('new'), S('channel'));
        r.putEnumerated(S('channel'), S('channel'), S('mask')); d.putReference(S('at'), r);
        d.putEnumerated(S('using'), S('userMaskEnabled'), S('revealSelection'));
        executeAction(S('make'), d, DialogModes.NO); copy.selection.deselect();
    }
    function solidBackground(group, b, rgb) {
        select(group.id); boxSelection(b);
        var d = new ActionDescriptor(), r = new ActionReference();
        var using = new ActionDescriptor(), fill = new ActionDescriptor(), color = new ActionDescriptor();
        r.putClass(S('contentLayer')); d.putReference(S('null'), r);
        color.putDouble(C('Rd  '), rgb[0]); color.putDouble(C('Grn '), rgb[1]); color.putDouble(C('Bl  '), rgb[2]);
        fill.putObject(S('color'), S('RGBColor'), color);
        using.putObject(S('type'), S('solidColorLayer'), fill);
        d.putObject(S('using'), S('contentLayer'), using);
        executeAction(S('make'), d, DialogModes.NO);
        var l = copy.activeLayer; l.name = '[AE] Fundo da artboard';
        l.move(group, ElementPlacement.PLACEATEND); copy.selection.deselect();
    }
    function makeMarker(board) {
        var group = find(copy, board.id), l = group.artLayers.add();
        l.name = '__AE_coordinate_marker__'; copy.activeLayer = l;
        copy.activeChannels = copy.componentChannels;
        var x = Math.ceil(board.rect[0]), y = Math.ceil(board.rect[1]);
        if (x + 1 > board.rect[2] || y + 1 > board.rect[3]) fail('Artboard pequena demais: ' + board.name);
        boxSelection([x,y,x+1,y+1]);
        var color = new SolidColor(); color.rgb.red = 255; color.rgb.green = 0; color.rgb.blue = 255;
        copy.selection.fill(color, ColorBlendMode.NORMAL, 100, false); copy.selection.deselect();
        var m = {id:l.id, box:bounds(l.id), board:board.id}; markers.push(m); board.marker = m;
    }
    function convert(board) {
        var old = find(copy, board.id);
        var children = ids(old);
        select(board.id);
        var d = new ActionDescriptor(), r = new ActionReference();
        r.putEnumerated(S('layer'), S('ordinal'), S('targetEnum')); d.putReference(S('null'), r);
        executeAction(S('ungroupLayersEvent'), d, DialogModes.NO);
        // Explicit IDs prevent accidental grouping of unrelated selected layers.
        for (var i = 0; i < children.length; i++) select(children[i], i > 0);
        d = new ActionDescriptor(); r = new ActionReference(); r.putClass(S('layerSection'));
        d.putReference(S('null'), r); r = new ActionReference();
        r.putEnumerated(S('layer'), S('ordinal'), S('targetEnum')); d.putReference(S('from'), r);
        var using = new ActionDescriptor(); using.putString(S('name'), board.name);
        d.putObject(S('using'), S('layerSection'), using);
        executeAction(S('make'), d, DialogModes.NO);
        var g = copy.activeLayer;
        if (g.typename !== 'LayerSet' || isBoard(desc(g.id))) fail('O Photoshop não criou um grupo normal.');
        replacements['i' + board.id] = g.id;
        g.name = board.name; g.opacity = board.opacity; g.blendMode = board.blend; g.visible = board.visible;
    }
    function descendant(id, root) {
        var l = find(copy, id);
        while (l && l.typename !== 'Document') { if (l.id === root) return true; l = l.parent; }
        return false;
    }
    function translateRoot(root, anchor) {
        var b = bounds(anchor.id), dx = anchor.box[0] - b[0], dy = anchor.box[1] - b[1];
        if (!near(b[2]-b[0], anchor.box[2]-anchor.box[0]) || !near(b[3]-b[1], anchor.box[3]-anchor.box[1]))
            fail('Os limites de uma layer mudaram; não é seguro compensar apenas a posição.');
        if (!near(dx,0) || !near(dy,0)) {
            // Fractional translations can resample bitmap content. Refuse rather than degrade it.
            if (!near(dx,Math.round(dx)) || !near(dy,Math.round(dy))) fail('Deslocamento fracionário inesperado; conversão interrompida.');
            root.translate(UnitValue(Math.round(dx),'px'), UnitValue(Math.round(dy),'px'));
        }
    }
    function repairCoordinates() {
        for (var i = 0; i < copy.layers.length; i++) {
            var root = copy.layers[i], anchor = null, j;
            for (j = 0; j < markers.length; j++) if (descendant(markers[j].id,root.id)) { anchor = markers[j]; break; }
            if (!anchor) {
                for (j = 0; j < records.length; j++) {
                    var rec = records[j];
                    if (rec.box && nonempty(rec.box) && descendant(rec.id,root.id)) { anchor = rec; break; }
                }
            }
            if (anchor) translateRoot(root,anchor);
        }
    }
    function checkPositions(dx, dy, baseline) {
        var geometry = baseline || records;
        for (var i = 0; i < geometry.length; i++) {
            var rec = geometry[i]; if (!rec.box || !nonempty(rec.box)) continue;
            var b = bounds(rec.id), expected = [rec.box[0]+dx,rec.box[1]+dy,rec.box[2]+dx,rec.box[3]+dy];
            for (var j = 0; j < 4; j++) if (!near(b[j],expected[j]))
                fail('Verificação de posição falhou em "' + rec.name + '" (ID ' + rec.id + '). Nenhum PSD foi salvo.');
        }
    }
    function cropWithoutDeleting(b) {
        copy.selection.deselect();
        var d = new ActionDescriptor(), r = new ActionDescriptor();
        r.putUnitDouble(C('Left'),C('#Pxl'),b[0]); r.putUnitDouble(C('Top '),C('#Pxl'),b[1]);
        r.putUnitDouble(C('Rght'),C('#Pxl'),b[2]); r.putUnitDouble(C('Btom'),C('#Pxl'),b[3]);
        d.putObject(C('T   '),C('Rctn'),r); d.putUnitDouble(C('Angl'),C('#Ang'),0);
        d.putBoolean(C('Dlt '),false); executeAction(C('Crop'),d,DialogModes.NO);
    }
    function checkTree(originalRoots) {
        var now = ids(copy), i, j;
        if (now.length !== originalRoots.length) fail('A quantidade de contêineres principais mudou.');
        for (i = 0; i < now.length; i++) if (now[i] !== resolved(originalRoots[i])) fail('A ordem principal mudou.');
        for (i = 0; i < records.length; i++) {
            var rec = records[i], l = find(copy,resolved(rec.id));
            if (!l || l.name !== rec.name || l.typename !== rec.type) fail('Falha de integridade: ' + rec.name);
            if (isBoard(desc(l.id))) fail('Ainda existe uma artboard: ' + rec.name);
            if (l.visible !== rec.visible) fail('Visibilidade alterada: ' + rec.name);
            if (!near(l.opacity,rec.opacity) || l.blendMode !== rec.blend) fail('Composição alterada: ' + rec.name);
            if (rec.kind !== undefined && l.kind !== rec.kind) fail('Tipo de layer alterado: ' + rec.name);
            var parent = l.parent.typename === 'Document' ? 0 : l.parent.id;
            if (parent !== resolved(rec.parent)) fail('Hierarquia alterada: ' + rec.name);
            if (rec.children) {
                var current = ids(l), known = [];
                for (j = 0; j < current.length; j++) {
                    for (var k = 0; k < rec.children.length; k++) if (current[j] === resolved(rec.children[k])) known.push(current[j]);
                }
                if (known.length !== rec.children.length) fail('Layers ausentes em ' + rec.name);
                for (j = 0; j < known.length; j++) if (known[j] !== resolved(rec.children[j])) fail('Ordem alterada em ' + rec.name);
            }
        }
    }
    function ui() {
        var w = new Window('dialog', TITLE); w.orientation = 'column'; w.alignChildren = 'fill';
        w.add('statictext',undefined,'O documento ativo será duplicado. O original permanece intacto.');
        var p = w.add('panel',undefined,'Opções'); p.orientation = 'column'; p.alignChildren = 'left';
        var clip = p.add('checkbox',undefined,'Preservar recorte das artboards com máscaras de grupo'); clip.value = true;
        var bg = p.add('checkbox',undefined,'Preservar fundos como layers de cor sólida editáveis'); bg.value = true;
        var unlockBox = p.add('checkbox',undefined,'Deixar as layers da cópia desbloqueadas para animação'); unlockBox.value = true;
        var save = p.add('checkbox',undefined,'Escolher onde salvar o PSD ao terminar'); save.value = true;
        var note = w.add('statictext',undefined,'O PSD terá o tamanho da primeira artboard no painel Layers (de cima para baixo).\nA verificação de hierarquia e coordenadas é obrigatória.',{multiline:true});
        note.preferredSize = [550,45];
        var buttons = w.add('group'); buttons.alignment = 'right';
        buttons.add('button',undefined,'Cancelar',{name:'cancel'}); buttons.add('button',undefined,'Converter cópia',{name:'ok'});
        if (w.show() !== 1) return null;
        return {clip:clip.value,bg:bg.value,unlock:unlockBox.value,save:save.value};
    }
    function update(message, value) {
        stage = message; if (progress) { progress.label.text = message; progress.bar.value = value; progress.update(); }
    }
    function savePSD() {
        app.displayDialogs = oldDialogs;
        var base = source.name.replace(/\.[^.]+$/,'') + '_AE.psd';
        var file = new File(Folder.myDocuments.fsName + '/' + base).saveDlg('Salvar a cópia para After Effects', 'Photoshop:*.psd');
        if (!file) return 'A cópia ficou aberta, ainda não salva.';
        if (!/\.psd$/i.test(file.name)) file = new File(file.fsName + '.psd');
        // Never overwrite any existing file, including the source or a previous export.
        if (file.exists) return 'Não foi salvo: o destino já existe. Use Salvar como e escolha um nome novo.';
        var settings = new PhotoshopSaveOptions(); settings.layers = true;
        settings.embedColorProfile = true; settings.alphaChannels = true;
        copy.saveAs(file,settings,false,Extension.LOWERCASE);
        return 'PSD salvo em:\n' + file.fsName;
    }
    try {
        if (!app.documents.length) { alert('Abra um PSD com artboards antes de executar.',TITLE); return; }
        source = app.activeDocument;
        options = ui(); if (!options) return;
        app.preferences.rulerUnits = Units.PIXELS; app.displayDialogs = DialogModes.NO;
        stage = 'Duplicação'; copy = source.duplicate(source.name.replace(/\.[^.]+$/,'') + '_AE',false);
        app.activeDocument = copy;
        if (copy.mode !== DocumentMode.RGB && copy.mode !== DocumentMode.GRAYSCALE)
            fail('Para importar layers no After Effects, use RGB ou tons de cinza. Prepare uma cópia nesse modo e execute novamente.');
        var roots = ids(copy); scan(copy,0,0);
        if (!boards.length) fail('Nenhuma artboard foi encontrada no documento.');
        // First means the topmost artboard in the Layers panel, including hidden boards.
        var canvas = boards[0].rect.slice(0);
        for (var edge = 0; edge < 4; edge++) {
            if (!near(canvas[edge],Math.round(canvas[edge])))
                fail('A primeira artboard tem limites fracionários. Ajuste-os para pixels inteiros antes de converter.');
            canvas[edge] = Math.round(canvas[edge]);
        }
        var i;
        if (canvas[2]-canvas[0] > 30000 || canvas[3]-canvas[1] > 30000)
            fail('O canvas resultante ultrapassa 30.000 px. Divida o documento em arquivos menores para PSD/After Effects.');
        progress = new Window('palette',TITLE); progress.orientation = 'column'; progress.alignChildren = 'fill';
        progress.label = progress.add('statictext',undefined,'Preparando cópia...'); progress.label.preferredSize.width = 500;
        progress.bar = progress.add('progressbar',undefined,0,100); progress.show();
        for (i = 0; i < records.length; i++) unlock(find(copy,records[i].id));
        copy.selection.deselect();
        // Add markers to ALL boards before any dissolution can change the document origin.
        for (i = 0; i < boards.length; i++) makeMarker(boards[i]);
        for (i = 0; i < boards.length; i++) { update('Convertendo ' + (i+1) + '/' + boards.length + ': ' + boards[i].name,10+50*i/boards.length); convert(boards[i]); }
        update('Conferindo offsets e coordenadas...',65);
        repairCoordinates(); checkPositions(0,0);
        update('Preservando recortes e fundos...',80);
        for (i = 0; i < boards.length; i++) {
            var board = boards[i], group = find(copy,resolved(board.id));
            var area = board.rect.slice(0);
            if (options.bg && board.bg !== 3) solidBackground(group,area,board.rgb);
            if (options.clip) { select(group.id); boxSelection(area); maskFromSelection(); }
        }
        for (i = 0; i < markers.length; i++) find(copy,markers[i].id).remove();
        update('Validando hierarquia e tipos de layers...',95); checkTree(roots);
        // Build masks before shrinking the canvas, so off-canvas artboards remain selectable.
        // Snapshot again because the new masks intentionally alter visible layer bounds.
        var cropGeometry = [];
        for (i = 0; i < records.length; i++) {
            if (records[i].box) cropGeometry.push({id:records[i].id,name:records[i].name,box:bounds(records[i].id)});
        }
        update('Ajustando o PSD à primeira artboard: ' + boards[0].name,98);
        cropWithoutDeleting(canvas); checkPositions(-canvas[0],-canvas[1],cropGeometry);
        if (!near(copy.width.as('px'),canvas[2]-canvas[0]) || !near(copy.height.as('px'),canvas[3]-canvas[1])) fail('Dimensões finais inesperadas.');
        checkTree(roots);
        if (!options.unlock) for (i = records.length-1; i >= 0; i--) restoreLocks(find(copy,resolved(records[i].id)),records[i].locks);
        copy.selection.deselect();
        progress.close(); progress = null;
        var result = 'A cópia ficou aberta, ainda não salva.';
        if (options.save) {
            stage = 'Salvamento';
            try { result = savePSD(); } catch (saveError) { result = 'Conversão concluída, mas o PSD não pôde ser salvo:\n' + saveError.message + '\nA cópia continua aberta para salvamento manual.'; }
        }
        alert(boards.length + ' artboard(s) convertida(s).\nHierarquia, tipos e coordenadas verificados.\n\n' + result +
            '\n\nNo After Effects:\nFile > Import > File > Composition - Retain Layer Sizes.\nRevise a aparência no Photoshop e no AE antes de animar.',TITLE);
    } catch (error) {
        if (progress) { try { progress.close(); } catch (_) {} progress = null; }
        var cleanup = '';
        if (copy) { try { copy.close(SaveOptions.DONOTSAVECHANGES); } catch (_) { cleanup = '\nA cópia incompleta permaneceu aberta; descarte-a sem salvar.'; } }
        if (source) { try { app.activeDocument = source; } catch (_) {} }
        alert('Conversão interrompida em: ' + stage + '\n\n' + error.message +
            (error.line ? '\nLinha: ' + error.line : '') + '\n\nO documento original não foi alterado.' + cleanup,TITLE);
    } finally {
        app.preferences.rulerUnits = oldUnits; app.displayDialogs = oldDialogs;
    }
}());
