/**
 * @name Generate Migration Views - Fitness Club
 * @description Создаёт 3 Migration Views для областей: Запись, Хранение, Отчётность (ArchiMate 3.2 compatible)
 * @version 3.9
 * @author Claude AI Assistant
 * @lastModifiedDate 2025-10-24
 */

console.clear();
console.show();

function logConsole(message, data) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

logConsole("=== Migration Views Generator v3.9 ===");

// Configuration
const ANTHROPIC_API_KEY = "";
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_VERSION = "2023-06-01";
const API_TIMEOUT = 120000;
const MAX_TOKENS = 16384;
const MAX_RETRIES = 3;

logConsole("Configuration", {
    model: ANTHROPIC_MODEL,
    timeout: API_TIMEOUT,
    maxTokens: MAX_TOKENS
});

const apiClient = require("./lib/apiClient");
const anthropicApi = apiClient.create({
    baseURL: ANTHROPIC_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_API_VERSION,
    },
    debug: true,
    timeout: API_TIMEOUT
});

function getTargetModel() {
    try {
        const models = $("archimate-model");
        if (models && models.length > 0) {
            return models.first();
        }
    } catch (e) {
        logConsole(`⚠ Error getting model via $(): ${e.message}`);
    }
    
    try {
        if (typeof model !== 'undefined' && model) {
            return model;
        }
    } catch (e) {
        logConsole(`⚠ Error getting model via global: ${e.message}`);
    }
    
    throw new Error("No ArchiMate model found!");
}

function getOrCreateFolder(folderName) {
    try {
        let viewsFolder = $("folder").filter(f => f.name === "Views").first();
        
        if (!viewsFolder) {
            logConsole("⚠ Views folder not found, will create views in root");
            return null;
        }
        
        const existingFolder = $(viewsFolder).find("folder").filter(f => f.name === folderName).first();
        
        if (existingFolder) {
            logConsole(`✓ Found existing folder: ${folderName}`);
            return existingFolder;
        }
        
        logConsole(`→ Creating folder: ${folderName} in Views`);
        const newFolder = viewsFolder.createFolder(folderName);
        logConsole(`✓ Created folder: ${folderName}`);
        return newFolder;
        
    } catch (e) {
        logConsole(`⚠ Error managing folder ${folderName}: ${e.message}`);
        try {
            return $("folder").filter(f => f.name === "Views").first();
        } catch (e2) {
            logConsole(`✗ Cannot access Views folder: ${e2.message}`);
            return null;
        }
    }
}

// MIGRATION PROMPT v3.9 (упрощённый для быстрой генерации)
const MIGRATION_PROMPT = `Ты — архитектор предприятия, эксперт по ArchiMate 3.2.

Создай Migration View для фитнес-клуба, область: {{AREA}}

КОНТЕКСТ:
AS-IS (текущее):
- Запись: телефон, бумажное расписание, двойное бронирование
- Хранение: бумажные карточки, ручной поиск
- Отчётность: Excel вручную

TO-BE (целевое):
- Запись: онлайн 24/7, автопроверка, SMS
- Хранение: CRM, QR-коды, облако
- Отчётность: BI дашборды, аналитика

ИСПОЛЬЗУЙ Implementation & Migration элементы:
- work-package (WP1-WP5)
- deliverable (результаты работ)
- plateau (AS-IS, Transition, TO-BE)
- gap (разрывы)
- implementation-event (события проекта)

СТРУКТУРА:
1. AS-IS Plateau
2. Event: Начало проекта
3. WP1: Анализ → Deliverable: Требования
4. WP2: Разработка → Deliverable: Система
5. Event: Завершение разработки
6. WP3: Обучение → Deliverable: Персонал
7. Transition Plateau + 2 Gap
8. WP4: Миграция → Deliverable: Данные
9. Event: Go-Live
10. TO-BE Plateau
11. WP5: Архивация → Deliverable: Архив
12. Event: Закрытие

СВЯЗИ (русские подписи):
- triggering-relationship: "Запускает", "Инициирует"
- flow-relationship: "Создаёт", "Производит"
- realization-relationship: "Реализует"
- association-relationship: "Связан с"

МИНИМУМ:
- 5 work-package
- 4 deliverable
- 3 plateau
- 2 gap
- 4 implementation-event
Итого ≥18 элементов, ≥20 связей

Верни ТОЛЬКО JSON (БЕЗ markdown):
{
  "description": "краткое описание",
  "nodes": [{"id":"x","type":"plateau","name":"AS-IS","description":"текст","properties":{"Area":"{{AREA}}","Phase":"AS-IS"}}],
  "relationships": [{"source":"id1","target":"id2","type":"triggering-relationship","name":"Запускает"}]
}

В тегах <migration_model>JSON</migration_model>`;

const CONTINUATION_PROMPT = `Продолжи JSON для "{{AREA}}":

{{PARTIAL_JSON}}

Закрой все [] {}. Добавь недостающие элементы до минимума.
В тегах <continuation>JSON</continuation>`;

function tryFixIncompleteJSON(jsonString) {
    logConsole("→ Fixing incomplete JSON...");
    
    const openBraces = (jsonString.match(/{/g) || []).length;
    const closeBraces = (jsonString.match(/}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    let fixed = jsonString.trim();
    if (fixed.endsWith(',')) fixed = fixed.slice(0, -1);
    
    for (let i = 0; i < (openBrackets - closeBrackets); i++) fixed += '\n]';
    for (let i = 0; i < (openBraces - closeBraces); i++) fixed += '\n}';
    
    logConsole(`  Fixed brackets: ${openBrackets - closeBrackets}, braces: ${openBraces - closeBraces}`);
    
    return fixed;
}

function extractJSON(content) {
    const taggedMatch = content.match(/<migration_model>([\s\S]*?)<\/migration_model>/);
    if (taggedMatch) {
        let extracted = taggedMatch[1].trim();
        logConsole("✓ Extracted JSON from <migration_model> tags");
        extracted = extracted.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        return extracted;
    }
    
    const contMatch = content.match(/<continuation>([\s\S]*?)<\/continuation>/);
    if (contMatch) {
        let extracted = contMatch[1].trim();
        logConsole("✓ Extracted JSON from <continuation> tags");
        extracted = extracted.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        return extracted;
    }
    
    let cleanContent = content.replace(/```json\s*\n?/gi, '').replace(/\n?```/g, '');
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        logConsole("✓ Extracted JSON by braces");
        return cleanContent.substring(firstBrace, lastBrace + 1);
    }
    
    logConsole("✗ No JSON found");
    return null;
}

async function generateWithRetry(area) {
    let attempt = 0;
    let partialJSON = null;
    let jsonObject = null;
    
    while (attempt < MAX_RETRIES && !jsonObject) {
        attempt++;
        logConsole(`\n>>> Attempt ${attempt}/${MAX_RETRIES}: ${area}`);
        
        try {
            const areaId = area.toLowerCase().replace(/ё/g, 'е');
            const prompt = attempt === 1 
                ? MIGRATION_PROMPT.replace(/{{AREA}}/g, area).replace(/{{AREA_ID}}/g, areaId)
                : CONTINUATION_PROMPT
                    .replace(/{{AREA}}/g, area)
                    .replace(/{{PARTIAL_JSON}}/g, partialJSON || "{}");
            
            const requestBody = {
                model: ANTHROPIC_MODEL,
                max_tokens: MAX_TOKENS,
                temperature: 0.3,
                messages: [{ role: "user", content: prompt }]
            };

            logConsole("→ Calling API...");
            
            const response = await Promise.race([
                anthropicApi.post("/v1/messages", requestBody),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("API timeout")), API_TIMEOUT)
                )
            ]);
            
            const content = response.data.content[0].text;
            logConsole(`← Response: ${content.length} chars`);
            
            const extractedJSON = extractJSON(content);
            if (!extractedJSON) {
                logConsole("✗ No JSON");
                continue;
            }
            
            try {
                jsonObject = JSON.parse(extractedJSON);
                
                // Проверка структуры
                if (!jsonObject.nodes || !jsonObject.relationships) {
                    throw new Error("Missing nodes or relationships");
                }
                
                // Подсчёт Migration элементов (БЕЗ filter)
                const migrationTypes = ['work-package', 'deliverable', 'plateau', 'gap', 'implementation-event'];
                let migrationCount = 0;
                for (let i = 0; i < jsonObject.nodes.length; i++) {
                    const nodeType = jsonObject.nodes[i].type;
                    for (let j = 0; j < migrationTypes.length; j++) {
                        if (nodeType === migrationTypes[j]) {
                            migrationCount++;
                            break;
                        }
                    }
                }
                
                logConsole(`✓ Parsed: ${jsonObject.nodes.length} nodes (${migrationCount} migration), ${jsonObject.relationships.length} rels`);
                
                if (migrationCount < 15 && attempt < MAX_RETRIES) {
                    logConsole(`⚠ Insufficient (${migrationCount}/15), retry`);
                    partialJSON = extractedJSON;
                    jsonObject = null;
                    continue;
                }
                
                break;
                
            } catch (parseError) {
                logConsole(`⚠ Parse error: ${parseError.message}`);
                
                const fixedJSON = tryFixIncompleteJSON(extractedJSON);
                try {
                    jsonObject = JSON.parse(fixedJSON);
                    logConsole(`✓ Fixed: ${jsonObject.nodes.length} nodes`);
                    break;
                } catch (fixError) {
                    logConsole(`✗ Fix failed: ${fixError.message}`);
                    if (attempt < MAX_RETRIES) {
                        partialJSON = extractedJSON;
                    } else {
                        throw new Error("Max retries, JSON invalid");
                    }
                }
            }
            
        } catch (error) {
            logConsole(`✗ Failed: ${error.message}`);
            if (attempt >= MAX_RETRIES) {
                throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
        }
    }
    
    return jsonObject;
}

function createElement(targetModel, node) {
    try {
        const element = targetModel.createElement(node.type, node.name);
        
        if (node.description) {
            element.documentation = node.description;
        }
        
        if (node.properties) {
            for (let key in node.properties) {
                element.prop(key, node.properties[key]);
            }
        }
        
        return element;
    } catch (e) {
        logConsole(`⚠ Failed to create ${node.type}: ${e.message}, using grouping`);
        const element = targetModel.createElement('grouping', node.name);
        if (node.description) element.documentation = node.description;
        if (node.properties) {
            for (let key in node.properties) {
                element.prop(key, node.properties[key]);
            }
        }
        return element;
    }
}

function createRelationship(targetModel, source, target, relType, name) {
    try {
        return targetModel.createRelationship(relType, name || '', source, target);
    } catch (e) {
        logConsole(`⚠ Failed ${relType}: ${e.message}, using association`);
        return targetModel.createRelationship('association-relationship', name || '', source, target);
    }
}

function createMigrationView(targetModel, area, modelJson, migrationFolder) {
    logConsole(`\n>>> Creating view: Migration — ${area}`);
    
    const viewName = `Migration — ${area}`;
    const view = targetModel.createArchimateView(viewName);
    
    // Статистика (БЕЗ forEach)
    const typeCounts = {};
    for (let i = 0; i < modelJson.nodes.length; i++) {
        const nodeType = modelJson.nodes[i].type;
        typeCounts[nodeType] = (typeCounts[nodeType] || 0) + 1;
    }
    
    view.documentation = `🔄 Процесс миграции: ${area}\n\n` +
                        `${modelJson.description || ''}\n\n` +
                        `Элементов: ${modelJson.nodes.length}, Связей: ${modelJson.relationships.length}\n\n` +
                        `Статистика:\n` +
                        `- work-package: ${typeCounts['work-package'] || 0}\n` +
                        `- deliverable: ${typeCounts['deliverable'] || 0}\n` +
                        `- plateau: ${typeCounts['plateau'] || 0}\n` +
                        `- gap: ${typeCounts['gap'] || 0}\n` +
                        `- implementation-event: ${typeCounts['implementation-event'] || 0}\n\n` +
                        `Тип: Implementation & Migration View (ArchiMate 3.2)`;
    
    view.prop("viewpoint", "implementation_migration");
    
    const elementMap = {};
    const visualMap = {};
    
    logConsole(`→ Creating ${modelJson.nodes.length} elements...`);
    
    const phaseX = {
        "AS-IS": 50,
        "Проект": 450,
        "Transition": 900,
        "TO-BE": 1350
    };
    
    const phaseCounters = {};
    let successCount = 0;
    
    for (let i = 0; i < modelJson.nodes.length; i++) {
        const node = modelJson.nodes[i];
        try {
            const element = createElement(targetModel, node);
            elementMap[node.id] = element;
            successCount++;
            
            const phase = (node.properties && node.properties.Phase) || "Проект";
            const baseX = phaseX[phase] || 450;
            
            if (!phaseCounters[phase]) phaseCounters[phase] = 0;
            phaseCounters[phase]++;
            
            const x = baseX + (phaseCounters[phase] % 3) * 180;
            const y = 50 + Math.floor(phaseCounters[phase] / 3) * 100;
            
            const visualObj = view.add(element, x, y, 170, 75);
            visualMap[node.id] = visualObj;
            
            // Розовый для Migration
            const migrationTypes = ['work-package', 'deliverable', 'plateau', 'gap', 'implementation-event'];
            let isMigration = false;
            for (let j = 0; j < migrationTypes.length; j++) {
                if (node.type === migrationTypes[j]) {
                    isMigration = true;
                    break;
                }
            }
            
            if (isMigration) {
                visualObj.fillColor = "#FFE0F0";
            } else {
                const phaseColors = {
                    "AS-IS": "#FFE5E5",
                    "Проект": "#FFF4E5",
                    "Transition": "#E5F0FF",
                    "TO-BE": "#E5F5E5"
                };
                if (phaseColors[phase]) {
                    visualObj.fillColor = phaseColors[phase];
                }
            }
            
        } catch (e) {
            logConsole(`✗ Element ${i + 1} failed: ${e.message}`);
        }
    }
    
    logConsole(`✓ Created ${successCount}/${modelJson.nodes.length} elements`);
    logConsole(`  Statistics: ${JSON.stringify(typeCounts)}`);
    
    logConsole(`→ Creating ${modelJson.relationships.length} relationships...`);
    
    let relCreated = 0;
    let relWithLabel = 0;
    
    for (let i = 0; i < modelJson.relationships.length; i++) {
        const rel = modelJson.relationships[i];
        try {
            const sourceElement = elementMap[rel.source];
            const targetElement = elementMap[rel.target];
            const sourceVisual = visualMap[rel.source];
            const targetVisual = visualMap[rel.target];
            
            if (sourceElement && targetElement && sourceVisual && targetVisual) {
                const relationship = createRelationship(
                    targetModel, 
                    sourceElement, 
                    targetElement, 
                    rel.type, 
                    rel.name || ''
                );
                
                view.add(relationship, sourceVisual, targetVisual);
                relCreated++;
                
                if (rel.name && rel.name.trim()) {
                    relWithLabel++;
                }
            } else {
                if (!sourceElement) logConsole(`⚠ Rel ${i + 1}: source not found (${rel.source})`);
                if (!targetElement) logConsole(`⚠ Rel ${i + 1}: target not found (${rel.target})`);
            }
        } catch (e) {
            logConsole(`✗ Rel ${i + 1} failed: ${e.message}`);
        }
    }
    
    logConsole(`✓ Created ${relCreated}/${modelJson.relationships.length} rels (${relWithLabel} labeled)`);
    return view;
}

async function main() {
    try {
        logConsole('\n========================================');
        logConsole('=== Migration Views Generator v3.9 ===');
        logConsole('========================================');
        
        const targetModel = getTargetModel();
        logConsole(`✓ Model: ${targetModel.name}`);
        
        logConsole('\n→ Finding Migration Layer folder...');
        const migrationFolder = getOrCreateFolder("Migration Layer");
        
        if (migrationFolder) {
            logConsole(`✓ Folder: ${migrationFolder.name}`);
        } else {
            logConsole(`⚠ No folder`);
        }
        
        const areas = ['Запись', 'Хранение', 'Отчётность'];
        const results = [];
        
        for (let i = 0; i < areas.length; i++) {
            const area = areas[i];
            logConsole(`\n========================================`);
            logConsole(`=== Area ${i + 1}/3: ${area} ===`);
            logConsole(`========================================`);
            
            try {
                const modelJson = await generateWithRetry(area);
                
                if (!modelJson || !modelJson.nodes || !modelJson.relationships) {
                    throw new Error("Invalid JSON structure");
                }
                
                const view = createMigrationView(targetModel, area, modelJson, migrationFolder);
                
                results.push({
                    area: area,
                    elements: modelJson.nodes.length,
                    relationships: modelJson.relationships.length,
                    success: true
                });
                
                logConsole(`✓ ${area}: OK`);
                
            } catch (error) {
                logConsole(`✗ ${area}: FAILED - ${error.message}`);
                results.push({
                    area: area,
                    elements: 0,
                    relationships: 0,
                    success: false,
                    error: error.message
                });
            }
        }
        
        logConsole('\n========================================');
        logConsole('=== SUMMARY ===');
        logConsole('========================================');
        
        let successCount = 0;
        let totalElements = 0;
        let totalRels = 0;
        
        for (let i = 0; i < results.length; i++) {
            if (results[i].success) successCount++;
            totalElements += results[i].elements;
            totalRels += results[i].relationships;
        }
        
        logConsole(`\nРезультаты:`);
        logConsole(`  Успешно: ${successCount}/${results.length} views`);
        logConsole(`  Элементов: ${totalElements}`);
        logConsole(`  Связей: ${totalRels}`);
        logConsole(`\nДетали:`);
        
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            if (r.success) {
                logConsole(`  ${i + 1}. ${r.area}: ✓ ${r.elements} элементов, ${r.relationships} связей`);
            } else {
                logConsole(`  ${i + 1}. ${r.area}: ✗ ${r.error}`);
            }
        }
        
        if (successCount === results.length) {
            logConsole(`\n✓ Все Migration Views созданы!`);
            logConsole(`\n📌 Проверьте в Archi:`);
            logConsole(`   Views → Migration Layer → 3 диаграммы`);
        } else {
            logConsole(`\n⚠ Создано ${successCount}/${results.length} views`);
        }
        
    } catch (error) {
        logConsole(`\n✗ CRITICAL: ${error.message}`);
        if (error.stack) {
            logConsole(`Stack: ${error.stack}`);
        }
        throw error;
    }
}

// Запуск
main().catch(error => {
    logConsole(`\n✗✗✗ FATAL ✗✗✗`);
    logConsole(`${error.message}`);
    if (error.stack) {
        logConsole(`${error.stack}`);
    }
    console.log("\n!!! Script failed !!!");
});