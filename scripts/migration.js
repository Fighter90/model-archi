/**
 * @name Generate Migration Views - Fitness Club (Optimized)
 * @description Создаёт 3 Migration Views с 45 элементами каждая (оптимизировано)
 * @version 4.4
 * @author Claude AI Assistant
 * @lastModifiedDate 2025-10-25
 */

console.clear();
console.show();

function logConsole(message, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

logConsole("=== Migration Views Generator v4.4 (Optimized) ===");

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const ANTHROPIC_API_KEY = "";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_VERSION = "2023-06-01";
const API_TIMEOUT = 180000;
const MAX_TOKENS = 24000; // ✅ Оптимизировано
const MAX_RETRIES = 3;
const AREAS = ['Запись', 'Хранение', 'Отчётность'];

// ============================================================
// ЦВЕТОВАЯ КОДИРОВКА ПО СЛОЯМ ARCHIMATE
// ============================================================
const LAYER_COLORS = {
    // Business Layer
    "business-actor": "#FFFFB3",
    "business-role": "#FFFFB3",
    "business-collaboration": "#FFFFB3",
    "business-interface": "#FFFFB3",
    "business-process": "#FFFFB3",
    "business-function": "#FFFFB3",
    "business-interaction": "#FFFFB3",
    "business-event": "#FFFFB3",
    "business-service": "#FFFFB3",
    "business-object": "#FFFFB3",
    "contract": "#FFFFB3",
    "representation": "#FFFFB3",
    "product": "#FFFFB3",
    
    // Application Layer
    "application-component": "#C0FFFF",
    "application-collaboration": "#C0FFFF",
    "application-interface": "#C0FFFF",
    "application-function": "#C0FFFF",
    "application-interaction": "#C0FFFF",
    "application-process": "#C0FFFF",
    "application-event": "#C0FFFF",
    "application-service": "#C0FFFF",
    "data-object": "#C0FFFF",
    
    // Technology Layer
    "node": "#D6EEC3",
    "device": "#D6EEC3",
    "system-software": "#D6EEC3",
    "technology-collaboration": "#D6EEC3",
    "technology-interface": "#D6EEC3",
    "path": "#D6EEC3",
    "communication-network": "#D6EEC3",
    "technology-function": "#D6EEC3",
    "technology-process": "#D6EEC3",
    "technology-interaction": "#D6EEC3",
    "technology-event": "#D6EEC3",
    "technology-service": "#D6EEC3",
    "artifact": "#D6EEC3",
    
    // Implementation & Migration
    "work-package": "#FFE4B5",
    "deliverable": "#E0FFE0",
    "implementation-event": "#FFE0F0",
    "plateau": "#F0F0F0",
    "gap": "#FFD0D0",
    
    // Motivation
    "stakeholder": "#FFF8DC",
    "driver": "#FFF8DC",
    "assessment": "#FFF8DC",
    "goal": "#FFF8DC",
    "outcome": "#FFF8DC",
    "principle": "#FFF8DC",
    "requirement": "#FFF8DC",
    "constraint": "#FFF8DC",
    "meaning": "#FFF8DC",
    "value": "#FFF8DC",
    
    // По умолчанию
    "grouping": "#F5F5F5",
    "location": "#F5F5F5"
};

// ============================================================
// ПОЛУЧЕНИЕ МОДЕЛИ
// ============================================================
function getTargetModel() {
    try {
        if (typeof model !== 'undefined' && model) {
            logConsole(`✓ Found model: ${model.name}`);
            return model;
        }
        
        const models = $("archimate-model");
        if (models && models.size() > 0) {
            const foundModel = models.first();
            logConsole(`✓ Found model via $(): ${foundModel.name}`);
            return foundModel;
        }
        
        throw new Error("No ArchiMate model found! Please open a model in Archi.");
        
    } catch (e) {
        logConsole(`✗ getTargetModel error: ${e.message}`);
        throw e;
    }
}

// ============================================================
// HTTP CLIENT
// ============================================================
function callAnthropicAPI(prompt) {
    try {
        const HttpClient = Java.type("java.net.http.HttpClient");
        const HttpRequest = Java.type("java.net.http.HttpRequest");
        const HttpResponse = Java.type("java.net.http.HttpResponse");
        const URI = Java.type("java.net.URI");
        const Duration = Java.type("java.time.Duration");
        
        const requestBody = JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: MAX_TOKENS,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }]
        });
        
        const request = HttpRequest.newBuilder()
            .uri(URI.create(ANTHROPIC_BASE_URL + "/v1/messages"))
            .header("Content-Type", "application/json")
            .header("x-api-key", ANTHROPIC_API_KEY)
            .header("anthropic-version", ANTHROPIC_API_VERSION)
            .timeout(Duration.ofMillis(API_TIMEOUT))
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();
        
        const client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(API_TIMEOUT))
            .build();
        
        const response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() !== 200) {
            throw new Error(`API returned ${response.statusCode()}: ${response.body()}`);
        }
        
        const jsonResponse = JSON.parse(response.body());
        
        if (jsonResponse.stop_reason === "max_tokens") {
            logConsole("⚠ Response was truncated due to max_tokens limit");
        }
        
        return jsonResponse.content[0].text;
        
    } catch (e) {
        logConsole(`✗ API call failed: ${e.message}`);
        throw e;
    }
}

// ============================================================
// ОПТИМИЗИРОВАННЫЙ ПРОМПТ v4.4 (45 элементов вместо 70)
// ============================================================
const MIGRATION_PROMPT_V4 = `Ты — senior архитектор, эксперт по ArchiMate 3.2.

ЗАДАЧА: Создать компактную модель миграции (Implementation & Migration View) для {{AREA}}.

КОНТЕКСТ:
- Фитнес-клуб, цифровая трансформация, 12 мес, 5 млн руб
- AS-IS: телефоны, бумага, Excel
- TO-BE: онлайн-запись, CRM, BI-дашборды

ТРЕБОВАНИЯ:
✅ РОВНО 45 элементов (не больше!)
✅ 80-100 связей (компактно)
✅ ВСЕ слои: Business, Application, Technology, Migration

СОСТАВ (СТРОГО):

1️⃣ BUSINESS (15 элементов):
   • Actors (3): Клиент, Администратор, Менеджер
   • Roles (3): Front Desk, Оператор CRM, Аналитик
   • Processes (6): Запись AS-IS, Запись TO-BE, Проверка слотов, Учёт посещений, Формирование отчёта, Оплата
   • Objects (3): Расписание, Карточка клиента, Отчёт

2️⃣ APPLICATION (10 элементов):
   • Components (5): Excel (AS-IS), Mobile App (TO-BE), Cloud CRM (TO-BE), BI Analytics (TO-BE), Payment Gateway (TO-BE)
   • Services (3): Booking API, Client API, Analytics API
   • Functions (2): Check Slot, Generate Report

3️⃣ TECHNOLOGY (8 элементов):
   • Nodes (4): Admin PC (AS-IS), App Server (AS-IS), AWS Cloud (TO-BE), Azure VM (TO-BE)
   • Devices (2): Phone (AS-IS), Smartphone (TO-BE)
   • Services (2): Hosting, Database

4️⃣ MIGRATION (12 элементов):
   • Plateaus (3): AS-IS, Transition, TO-BE
   • Work Packages (5): WP1 Анализ, WP2 Мобильное приложение, WP3 Cloud CRM, WP4 BI-дашборды, WP5 Миграция данных
   • Deliverables (2): Приложение, CRM-система
   • Gaps (2): Технологический разрыв, Функциональный разрыв

ФОРМАТ ОТВЕТА: JSON в тегах <migration_model>...</migration_model>

ПРИМЕР JSON (КОМПАКТНЫЙ):

{
  "description": "Миграция {{AREA}}: AS-IS → TO-BE",
  "nodes": [
    {"id": "p1", "type": "plateau", "name": "AS-IS ({{AREA}})", "description": "Текущее", "properties": {"Phase": "AS-IS"}},
    {"id": "a1", "type": "business-actor", "name": "Клиент", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "a2", "type": "business-actor", "name": "Администратор", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "a3", "type": "business-actor", "name": "Менеджер", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "r1", "type": "business-role", "name": "Front Desk", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "r2", "type": "business-role", "name": "Оператор CRM", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "r3", "type": "business-role", "name": "Аналитик", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "pr1", "type": "business-process", "name": "Запись клиента (AS-IS)", "description": "Ручная", "properties": {"Phase": "AS-IS"}},
    {"id": "pr2", "type": "business-process", "name": "Онлайн-запись (TO-BE)", "description": "Автоматическая", "properties": {"Phase": "TO-BE"}},
    {"id": "pr3", "type": "business-process", "name": "Проверка слотов", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "pr4", "type": "business-process", "name": "Учёт посещений", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "pr5", "type": "business-process", "name": "Формирование отчёта", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "pr6", "type": "business-process", "name": "Оплата услуг", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "o1", "type": "business-object", "name": "Расписание", "description": "Бумажное", "properties": {"Phase": "AS-IS"}},
    {"id": "o2", "type": "business-object", "name": "Карточка клиента", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "o3", "type": "business-object", "name": "Отчёт", "description": "Excel", "properties": {"Phase": "AS-IS"}},
    {"id": "app1", "type": "application-component", "name": "Excel (AS-IS)", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "app2", "type": "application-component", "name": "Mobile App (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "app3", "type": "application-component", "name": "Cloud CRM (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "app4", "type": "application-component", "name": "BI Analytics (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "app5", "type": "application-component", "name": "Payment Gateway (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "svc1", "type": "application-service", "name": "Booking API", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "svc2", "type": "application-service", "name": "Client API", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "svc3", "type": "application-service", "name": "Analytics API", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "fn1", "type": "application-function", "name": "Check Slot", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "fn2", "type": "application-function", "name": "Generate Report", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "n1", "type": "node", "name": "Admin PC (AS-IS)", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "n2", "type": "node", "name": "App Server (AS-IS)", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "n3", "type": "node", "name": "AWS Cloud (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "n4", "type": "node", "name": "Azure VM (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "d1", "type": "device", "name": "Phone (AS-IS)", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "d2", "type": "device", "name": "Smartphone (TO-BE)", "description": "", "properties": {"Phase": "TO-BE"}},
    {"id": "ts1", "type": "technology-service", "name": "Hosting", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "ts2", "type": "technology-service", "name": "Database", "description": "", "properties": {"Phase": "AS-IS"}},
    {"id": "p2", "type": "plateau", "name": "Transition ({{AREA}})", "description": "Переход", "properties": {"Phase": "Transition"}},
    {"id": "wp1", "type": "work-package", "name": "WP1: Анализ", "description": "1 мес", "properties": {"Phase": "Проект", "Duration": "1", "Budget": "300k"}},
    {"id": "wp2", "type": "work-package", "name": "WP2: Мобильное приложение", "description": "3 мес", "properties": {"Phase": "Проект", "Duration": "3", "Budget": "1.5M"}},
    {"id": "wp3", "type": "work-package", "name": "WP3: Cloud CRM", "description": "2 мес", "properties": {"Phase": "Проект", "Duration": "2", "Budget": "800k"}},
    {"id": "wp4", "type": "work-package", "name": "WP4: BI-дашборды", "description": "2 мес", "properties": {"Phase": "Проект", "Duration": "2", "Budget": "700k"}},
    {"id": "wp5", "type": "work-package", "name": "WP5: Миграция данных", "description": "2 мес", "properties": {"Phase": "Проект", "Duration": "2", "Budget": "400k"}},
    {"id": "dl1", "type": "deliverable", "name": "Мобильное приложение", "description": "", "properties": {"Phase": "Проект"}},
    {"id": "dl2", "type": "deliverable", "name": "CRM-система", "description": "", "properties": {"Phase": "Проект"}},
    {"id": "g1", "type": "gap", "name": "Технологический разрыв", "description": "Бумага → Цифра", "properties": {"Phase": "Проект"}},
    {"id": "g2", "type": "gap", "name": "Функциональный разрыв", "description": "Ручное → Автоматизация", "properties": {"Phase": "Проект"}},
    {"id": "p3", "type": "plateau", "name": "TO-BE ({{AREA}})", "description": "Целевое", "properties": {"Phase": "TO-BE"}}
  ],
  "relationships": [
    {"source": "wp1", "target": "wp2", "type": "association-relationship", "name": "Предшествует"},
    {"source": "wp2", "target": "dl1", "type": "association-relationship", "name": "Создаёт"},
    {"source": "wp3", "target": "dl2", "type": "association-relationship", "name": "Создаёт"},
    {"source": "p1", "target": "g1", "type": "association-relationship", "name": "Имеет разрыв"},
    {"source": "g1", "target": "p3", "type": "association-relationship", "name": "Преодолевается"},
    {"source": "r1", "target": "pr1", "type": "association-relationship", "name": "Выполняет"},
    {"source": "pr1", "target": "o1", "type": "association-relationship", "name": "Использует"},
    {"source": "app1", "target": "pr1", "type": "association-relationship", "name": "Поддерживает"},
    {"source": "n1", "target": "app1", "type": "association-relationship", "name": "Размещает"},
    {"source": "d1", "target": "r1", "type": "association-relationship", "name": "Используется"}
  ]
}

⚠️ ВАЖНО:
1. РОВНО 45 элементов (15 Business + 10 Application + 8 Technology + 12 Migration)
2. 80-100 связей (все через association-relationship)
3. Короткие descriptions (2-5 слов)
4. Компактные id (p1, a1, r1, pr1)
5. Для каждого элемента property "Phase"

ВЕРНИ ТОЛЬКО JSON в тегах <migration_model>...</migration_model>`;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function countByType(nodes) {
    const counts = {};
    for (let i = 0; i < nodes.length; i++) {
        const type = nodes[i].type;
        counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
}

function extractJSON(content) {
    const taggedMatch = content.match(/<migration_model>([\s\S]*?)<\/migration_model>/);
    if (taggedMatch) {
        let extracted = taggedMatch[1].trim();
        logConsole("✓ Extracted JSON from <migration_model> tags");
        extracted = extracted.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        return extracted;
    }
    
    let cleanContent = content.replace(/```json\s*\n?/gi, '').replace(/\n?```/g, '');
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        logConsole("✓ Extracted JSON by braces");
        const extracted = cleanContent.substring(firstBrace, lastBrace + 1);
        
        // Попытка восстановить обрезанный JSON
        if (!extracted.endsWith('}')) {
            logConsole("⚠ JSON seems truncated, attempting to fix...");
            let fixed = extracted;
            const openBraces = (fixed.match(/{/g) || []).length;
            const closeBraces = (fixed.match(/}/g) || []).length;
            const openBrackets = (fixed.match(/\[/g) || []).length;
            const closeBrackets = (fixed.match(/\]/g) || []).length;
            
            for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                fixed += ']';
            }
            for (let i = 0; i < (openBraces - closeBraces); i++) {
                fixed += '}';
            }
            
            return fixed;
        }
        
        return extracted;
    }
    
    logConsole("✗ No JSON found");
    return null;
}

// ============================================================
// ГЕНЕРАЦИЯ С RETRY
// ============================================================
function generateWithRetry(area) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        logConsole(`\n>>> Attempt ${attempt}/${MAX_RETRIES}: ${area}`);
        
        try {
            const prompt = MIGRATION_PROMPT_V4.replace(/{{AREA}}/g, area);
            
            logConsole("→ Calling API...");
            const content = callAnthropicAPI(prompt);
            logConsole(`← Response: ${content.length} chars`);
            
            const extractedJSON = extractJSON(content);
            if (!extractedJSON) {
                logConsole("✗ No JSON, retrying...");
                if (attempt < MAX_RETRIES) continue;
                throw new Error("No JSON found after " + MAX_RETRIES + " attempts");
            }
            
            const jsonObject = JSON.parse(extractedJSON);
            
            if (!jsonObject.nodes || !jsonObject.relationships) {
                throw new Error("Missing nodes or relationships");
            }
            
            const typeCounts = countByType(jsonObject.nodes);
            const totalNodes = jsonObject.nodes.length;
            
            logConsole(`✓ Parsed: ${totalNodes} nodes, ${jsonObject.relationships.length} rels`);
            logConsole(`  Types: ${JSON.stringify(typeCounts)}`);
            
            if (totalNodes < 40 || totalNodes > 50) {
                logConsole(`⚠ Expected 45±5 nodes, got ${totalNodes}, retrying...`);
                if (attempt < MAX_RETRIES) continue;
            }
            
            return jsonObject;
            
        } catch (error) {
            logConsole(`✗ Attempt ${attempt} failed: ${error.message}`);
            if (attempt >= MAX_RETRIES) {
                throw error;
            }
        }
    }
}

// ============================================================
// СОЗДАНИЕ ЭЛЕМЕНТОВ И СВЯЗЕЙ
// ============================================================
function createElement(targetModel, node) {
    try {
        const element = targetModel.createElement(node.type, node.name);
        
        if (node.description) {
            element.documentation = node.description;
        }
        
        if (node.properties) {
            for (let key in node.properties) {
                element.prop(key, String(node.properties[key]));
            }
        }
        
        return element;
    } catch (e) {
        logConsole(`⚠ Failed ${node.type}, using grouping: ${e.message}`);
        const element = targetModel.createElement('grouping', node.name);
        if (node.description) element.documentation = node.description;
        if (node.properties) {
            for (let key in node.properties) {
                element.prop(key, String(node.properties[key]));
            }
        }
        return element;
    }
}

function createRelationship(targetModel, source, target, relType, name) {
    try {
        return targetModel.createRelationship(relType, name || '', source, target);
    } catch (e) {
        return targetModel.createRelationship('association-relationship', name || '', source, target);
    }
}

// ============================================================
// СОЗДАНИЕ VIEW
// ============================================================
function createMigrationView(targetModel, area, modelJson) {
    const viewName = `Implementation & Migration — ${area}`;
    const view = targetModel.createArchimateView(viewName);
    
    const typeCounts = countByType(modelJson.nodes);
    
    view.documentation = `🔄 Модель миграции: ${area}\n\n` +
                        `${modelJson.description || ''}\n\n` +
                        `Элементов: ${modelJson.nodes.length}, Связей: ${modelJson.relationships.length}\n\n` +
                        `Статистика:\n${JSON.stringify(typeCounts, null, 2)}\n\n` +
                        `Цветовая кодировка:\n` +
                        `- Business: #FFFFB3, Application: #C0FFFF, Technology: #D6EEC3`;
    
    view.prop("viewpoint", "implementation_migration");
    view.prop("Area", area);
    
    const elementMap = {};
    const visualMap = {};
    
    const phaseX = {
        "AS-IS": 50,
        "Проект": 550,
        "Transition": 1050,
        "TO-BE": 1550
    };
    
    const phaseCounters = {};
    
    for (let i = 0; i < modelJson.nodes.length; i++) {
        const node = modelJson.nodes[i];
        try {
            const element = createElement(targetModel, node);
            elementMap[node.id] = element;
            
            const phase = (node.properties && node.properties.Phase) || "Проект";
            const baseX = phaseX[phase] || 550;
            
            if (!phaseCounters[phase]) phaseCounters[phase] = 0;
            phaseCounters[phase]++;
            
            const x = baseX + (phaseCounters[phase] % 3) * 160;
            const y = 50 + Math.floor(phaseCounters[phase] / 3) * 90;
            
            const visualObj = view.add(element, x, y, 150, 70);
            visualMap[node.id] = visualObj;
            
            const elementType = node.type;
            if (LAYER_COLORS[elementType]) {
                visualObj.fillColor = LAYER_COLORS[elementType];
            }
            
        } catch (e) {
            logConsole(`✗ Element ${i + 1} failed: ${e.message}`);
        }
    }
    
    logConsole(`✓ Created ${Object.keys(elementMap).length}/${modelJson.nodes.length} elements`);
    
    let relCreated = 0;
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
            }
        } catch (e) {
            logConsole(`✗ Rel ${i + 1} failed: ${e.message}`);
        }
    }
    
    logConsole(`✓ Created ${relCreated}/${modelJson.relationships.length} relationships`);
    return view;
}

// ============================================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================================
function main() {
    try {
        logConsole('\n========================================');
        logConsole('=== Migration Views Generator v4.4 ===');
        logConsole('========================================');
        
        const targetModel = getTargetModel();
        
        const results = [];
        
        for (let i = 0; i < AREAS.length; i++) {
            const area = AREAS[i];
            logConsole(`\n=== Area ${i + 1}/${AREAS.length}: ${area} ===`);
            
            try {
                const modelJson = generateWithRetry(area);
                
                if (!modelJson || !modelJson.nodes || !modelJson.relationships) {
                    throw new Error("Invalid JSON structure");
                }
                
                createMigrationView(targetModel, area, modelJson);
                
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
        
        logConsole('\n=== SUMMARY ===');
        
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
            logConsole(`\n📌 Проверьте: Views → Implementation & Migration`);
        } else {
            logConsole(`\n⚠ Создано ${successCount}/${results.length} views`);
        }
        
    } catch (error) {
        logConsole(`\n✗ CRITICAL: ${error.message}`);
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
    logConsole(`\n✗✗✗ FATAL ✗✗✗`);
    logConsole(`${error.message}`);
    if (error.stack) {
        console.log(error.stack);
    }
}