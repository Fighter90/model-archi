/**
 * @name Auto Layout Optimizer - Rectangular Grid
 * @description Строго прямоугольное размещение элементов с минимизацией пересечений
 * @version 1.5 — Rectangular Grid Layout
 * @author Claude AI Assistant
 * @lastModifiedDate 2025-10-25
 * @archimateVersion 3.2
 * @archiVersion 5.x
 */

console.clear();
console.show();

function logConsole(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

logConsole("=== Auto Layout Optimizer v1.5 (Rectangular Grid) ===");

// ============================================================
// КОНФИГУРАЦИЯ (СТРОГО ПРЯМОУГОЛЬНАЯ СЕТКА)
// ============================================================
const LAYOUT_CONFIG = {
    // Отступы от краёв canvas
    MARGIN_TOP: 150,
    MARGIN_LEFT: 150,
    MARGIN_RIGHT: 150,
    MARGIN_BOTTOM: 150,
    
    // Размеры элементов
    DEFAULT_WIDTH: 200,
    DEFAULT_HEIGHT: 80,
    
    // Отступы между элементами (МАКСИМАЛЬНЫЕ)
    HORIZONTAL_SPACING: 350,
    VERTICAL_SPACING: 200,
    
    // Количество колонок в сетке
    COLUMNS_PER_LAYER: 3,
    
    // Отступ между слоями (по уровням иерархии)
    LAYER_SPACING: 250,
    
    // Режим размещения: 'hierarchical' или 'simple-grid'
    LAYOUT_MODE: 'hierarchical' // Измените на 'simple-grid' для плоской сетки
};

// ============================================================
// ПОЛУЧЕНИЕ ТЕКУЩЕЙ VIEW
// ============================================================
function getCurrentView() {
    try {
        if (typeof view !== 'undefined' && view) {
            logConsole(`✓ Current view: ${view.name}`);
            return view;
        }
        
        const workbench = Java.type("org.eclipse.ui.PlatformUI").getWorkbench();
        const activeWindow = workbench.getActiveWorkbenchWindow();
        
        if (activeWindow) {
            const activePage = activeWindow.getActivePage();
            if (activePage) {
                const activeEditor = activePage.getActiveEditor();
                
                if (activeEditor && activeEditor.getClass().getName().indexOf("DiagramEditor") !== -1) {
                    const diagramModel = activeEditor.getAdapter(Java.type("com.archimatetool.model.IDiagramModel"));
                    if (diagramModel) {
                        logConsole(`✓ Active view: ${diagramModel.getName()}`);
                        return diagramModel;
                    }
                }
            }
        }
        
        if (typeof model !== 'undefined' && model) {
            const views = $(model).find("view");
            if (views.size() > 0) {
                const firstView = views.first();
                logConsole(`⚠ No active view, using first available: ${firstView.name}`);
                return firstView;
            }
        }
        
        throw new Error("No view found! Open a view and run this script.");
        
    } catch (e) {
        logConsole(`✗ getCurrentView error: ${e.message}`);
        throw e;
    }
}

// ============================================================
// АНАЛИЗ СТРУКТУРЫ ДИАГРАММЫ
// ============================================================
function analyzeViewStructure(currentView) {
    const nodes = [];
    const relationships = [];
    const nodeMap = new Map();
    
    $(currentView).children().each(function(child) {
        try {
            if (!child.concept || !child.concept.type) return;
            if (!child.bounds) return;
            
            const nodeData = {
                visual: child,
                concept: child.concept,
                id: child.concept.id,
                name: child.concept.name || "Unnamed",
                type: child.concept.type,
                x: child.bounds.x || 0,
                y: child.bounds.y || 0,
                width: child.bounds.width || LAYOUT_CONFIG.DEFAULT_WIDTH,
                height: child.bounds.height || LAYOUT_CONFIG.DEFAULT_HEIGHT,
                incomingRels: [],
                outgoingRels: [],
                layer: 0
            };
            
            nodes.push(nodeData);
            nodeMap.set(nodeData.id, nodeData);
            
        } catch (e) {
            logConsole(`  ✗ Error processing child: ${e.message}`);
        }
    });
    
    $(currentView).find("relationship").each(function(rel) {
        try {
            if (!rel.source || !rel.target) return;
            
            const sourceId = rel.source.concept ? rel.source.concept.id : rel.source.id;
            const targetId = rel.target.concept ? rel.target.concept.id : rel.target.id;
            
            if (!sourceId || !targetId) return;
            
            const relData = {
                visual: rel,
                concept: rel.concept,
                sourceId: sourceId,
                targetId: targetId,
                type: rel.concept ? rel.concept.type : 'unknown'
            };
            
            relationships.push(relData);
            
            const sourceNode = nodeMap.get(sourceId);
            const targetNode = nodeMap.get(targetId);
            
            if (sourceNode) sourceNode.outgoingRels.push(relData);
            if (targetNode) targetNode.incomingRels.push(relData);
            
        } catch (e) {
            logConsole(`  ✗ Error processing relationship: ${e.message}`);
        }
    });
    
    logConsole(`  Analyzed: ${nodes.length} nodes, ${relationships.length} relationships`);
    
    return { nodes, relationships, nodeMap };
}

// ============================================================
// ВЫЧИСЛЕНИЕ УРОВНЕЙ (ДЛЯ ИЕРАРХИЧЕСКОГО РЕЖИМА)
// ============================================================
function calculateLayers(nodes, nodeMap) {
    const layers = [];
    const visited = new Set();
    const processing = new Set();
    
    function visit(node, currentLayer) {
        if (visited.has(node.id)) return;
        if (processing.has(node.id)) return;
        
        processing.add(node.id);
        
        for (let i = 0; i < node.outgoingRels.length; i++) {
            const rel = node.outgoingRels[i];
            const targetNode = nodeMap.get(rel.targetId);
            if (targetNode && !visited.has(targetNode.id)) {
                visit(targetNode, currentLayer + 1);
            }
        }
        
        node.layer = currentLayer;
        visited.add(node.id);
        processing.delete(node.id);
        
        if (!layers[currentLayer]) layers[currentLayer] = [];
        layers[currentLayer].push(node);
    }
    
    const roots = nodes.filter(function(n) { return n.incomingRels.length === 0; });
    
    if (roots.length === 0) {
        logConsole("  No roots found, using all nodes");
        for (let i = 0; i < nodes.length; i++) {
            if (!visited.has(nodes[i].id)) {
                visit(nodes[i], 0);
            }
        }
    } else {
        for (let i = 0; i < roots.length; i++) {
            visit(roots[i], 0);
        }
        
        for (let i = 0; i < nodes.length; i++) {
            if (!visited.has(nodes[i].id)) {
                visit(nodes[i], 0);
            }
        }
    }
    
    logConsole(`  Calculated ${layers.length} layers`);
    for (let i = 0; i < layers.length; i++) {
        if (layers[i]) {
            logConsole(`    Layer ${i}: ${layers[i].length} nodes`);
        }
    }
    
    return layers;
}

// ============================================================
// СТРОГО ПРЯМОУГОЛЬНОЕ РАЗМЕЩЕНИЕ ПО СЛОЯМ
// ============================================================
function layoutHierarchicalRectangular(layers) {
    logConsole("  Using hierarchical rectangular grid layout");
    
    const positions = [];
    let currentY = LAYOUT_CONFIG.MARGIN_TOP;
    
    for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
        const layer = layers[layerIdx];
        if (!layer || layer.length === 0) continue;
        
        // Сортируем по количеству связей (больше связей = ближе к центру)
        layer.sort(function(a, b) {
            const aTotal = a.incomingRels.length + a.outgoingRels.length;
            const bTotal = b.incomingRels.length + b.outgoingRels.length;
            return bTotal - aTotal;
        });
        
        const columns = LAYOUT_CONFIG.COLUMNS_PER_LAYER;
        const rows = Math.ceil(layer.length / columns);
        
        for (let i = 0; i < layer.length; i++) {
            const node = layer[i];
            
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            // СТРОГО прямоугольная сетка — никаких смещений
            const x = LAYOUT_CONFIG.MARGIN_LEFT + col * LAYOUT_CONFIG.HORIZONTAL_SPACING;
            const y = currentY + row * LAYOUT_CONFIG.VERTICAL_SPACING;
            
            positions.push({
                node: node,
                x: x,
                y: y,
                width: node.width,
                height: node.height,
                layer: layerIdx,
                column: col,
                row: row
            });
        }
        
        // Переход к следующему слою
        currentY += rows * LAYOUT_CONFIG.VERTICAL_SPACING + LAYOUT_CONFIG.LAYER_SPACING;
    }
    
    logConsole(`  Created ${positions.length} positions in ${layers.length} layers`);
    return positions;
}

// ============================================================
// ПРОСТАЯ ПРЯМОУГОЛЬНАЯ СЕТКА (БЕЗ ИЕРАРХИИ)
// ============================================================
function layoutSimpleRectangularGrid(nodes) {
    logConsole("  Using simple rectangular grid layout");
    
    const positions = [];
    const columns = LAYOUT_CONFIG.COLUMNS_PER_LAYER;
    
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        const col = i % columns;
        const row = Math.floor(i / columns);
        
        // СТРОГО прямоугольная сетка
        const x = LAYOUT_CONFIG.MARGIN_LEFT + col * LAYOUT_CONFIG.HORIZONTAL_SPACING;
        const y = LAYOUT_CONFIG.MARGIN_TOP + row * LAYOUT_CONFIG.VERTICAL_SPACING;
        
        positions.push({
            node: node,
            x: x,
            y: y,
            width: node.width,
            height: node.height,
            layer: row,
            column: col,
            row: row
        });
    }
    
    logConsole(`  Created ${positions.length} positions in grid`);
    return positions;
}

// ============================================================
// ПРИМЕНЕНИЕ РАЗМЕЩЕНИЯ (БЕЗ FORCE-DIRECTED)
// ============================================================
function applyLayout(positions) {
    logConsole("  Applying rectangular layout...");
    
    let moved = 0;
    
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        try {
            pos.node.visual.bounds = {
                x: Math.round(pos.x),
                y: Math.round(pos.y),
                width: Math.round(pos.width),
                height: Math.round(pos.height)
            };
            moved++;
        } catch (e) {
            logConsole(`  ⚠ Failed to move "${pos.node.name}": ${e.message}`);
        }
    }
    
    logConsole(`✓ Successfully moved ${moved}/${positions.length} elements`);
}

// ============================================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================================
function main() {
    try {
        logConsole('\n========================================');
        logConsole('=== Auto Layout Optimizer v1.5 ===');
        logConsole('========================================\n');
        
        const currentView = getCurrentView();
        
        logConsole(`Processing view: "${currentView.name}"`);
        
        const result = analyzeViewStructure(currentView);
        const nodes = result.nodes;
        const relationships = result.relationships;
        const nodeMap = result.nodeMap;
        
        if (nodes.length === 0) {
            logConsole("✗ No valid elements found!");
            return;
        }
        
        let positions;
        
        if (LAYOUT_CONFIG.LAYOUT_MODE === 'hierarchical' && relationships.length > 0) {
            logConsole("Mode: Hierarchical rectangular grid");
            const layers = calculateLayers(nodes, nodeMap);
            positions = layoutHierarchicalRectangular(layers);
        } else {
            logConsole("Mode: Simple rectangular grid");
            positions = layoutSimpleRectangularGrid(nodes);
        }
        
        applyLayout(positions);
        
        logConsole('\n========================================');
        logConsole('✅ Rectangular layout complete!');
        logConsole('========================================');
        logConsole(`  Elements repositioned: ${positions.length}`);
        logConsole(`  Relationships preserved: ${relationships.length}`);
        logConsole('\n📐 Layout parameters:');
        logConsole(`   Columns per layer: ${LAYOUT_CONFIG.COLUMNS_PER_LAYER}`);
        logConsole(`   Horizontal spacing: ${LAYOUT_CONFIG.HORIZONTAL_SPACING}px`);
        logConsole(`   Vertical spacing: ${LAYOUT_CONFIG.VERTICAL_SPACING}px`);
        logConsole(`   Layer spacing: ${LAYOUT_CONFIG.LAYER_SPACING}px`);
        logConsole('\n💡 Tips:');
        logConsole('   1. To adjust spacing, modify HORIZONTAL_SPACING/VERTICAL_SPACING');
        logConsole('   2. To change columns, modify COLUMNS_PER_LAYER');
        logConsole('   3. To use flat grid, set LAYOUT_MODE = "simple-grid"');
        logConsole('   4. Save model (Ctrl+S / Cmd+S)');
        
    } catch (error) {
        logConsole(`\n✗ ERROR: ${error.message}`);
        if (error.stack) {
            console.log(error.stack);
        }
        throw error;
    }
}

// ============================================================
// ЗАПУСК
// ============================================================
try {
    main();
} catch (error) {
    logConsole(`\n✗✗✗ FATAL ERROR ✗✗✗`);
    logConsole(`${error.message}`);
}