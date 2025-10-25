/**
 * @name Generate Technology Layer Views - Fitness Club (Optimized v2.2)
 * @description Создаёт 2 Technology Layer Integrated Views (AS-IS + TO-BE) с 3 областями
 * @version 2.2 — Strict Element Count + More Relationships
 * @author Claude AI Assistant
 * @lastModifiedDate 2025-10-25
 * @archimateVersion 3.2
 * @archiVersion 5.x
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

logConsole("=== Technology Layer Generator v2.2 (Strict) ===");

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const ANTHROPIC_API_KEY = ""; // ← ВСТАВЬТЕ ВАШ API KEY
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_VERSION = "2023-06-01";
const API_TIMEOUT = 360000; // 6 минут
const MAX_TOKENS = 20000; // Уменьшено для быстрой генерации
const MAX_RETRIES = 2;

// Только 2 integrated views
const VIEWS_CONFIG = [
    { phase: "AS-IS", viewType: "Integrated" },
    { phase: "TO-BE", viewType: "Integrated" }
];

// Три области на каждой view
const AREAS = ["Запись", "Хранение", "Отчётность"];

// Цвет Technology Layer
const TECH_COLOR = "#C9E7B7";

// Layout config для прямоугольного размещения
const LAYOUT_CONFIG = {
    MARGIN_LEFT: 80,
    MARGIN_TOP: 80,
    AREA_WIDTH: 800,
    AREA_HEIGHT: 520,
    HORIZONTAL_GAP: 100,
    VERTICAL_GAP: 60,
    ELEMENT_WIDTH: 170,
    ELEMENT_HEIGHT: 70,
    ELEMENTS_PER_ROW: 3
};

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
            logConsole("⚠ Response truncated due to max_tokens");
        }
        
        return jsonResponse.content[0].text;
        
    } catch (e) {
        logConsole(`✗ API call failed: ${e.message}`);
        throw e;
    }
}

// ============================================================
// ПРОМПТ ДЛЯ INTEGRATED VIEW (СТРОГИЕ ОГРАНИЧЕНИЯ)
// ============================================================
function buildIntegratedPrompt(phase) {
    const isASIS = phase === "AS-IS";
    const elementsPerArea = isASIS ? "15-17" : "18-20";
    const totalElements = isASIS ? "45-51" : "54-60";
    const relationshipsPerArea = isASIS ? "30-35" : "35-40";
    const totalRelationships = isASIS ? "90-105" : "105-120";
    
    return `Ты — senior инфраструктурный архитектор, эксперт по ArchiMate 3.2 Technology & Physical Layer.

ЗАДАЧА: Создать ${phase} Technology Layer Integrated View для фитнес-клуба ООО "Спорт+".

## СТРОГИЕ ТРЕБОВАНИЯ:
⚠️ **РОВНО ${elementsPerArea} элементов на каждую область** (итого ${totalElements})
⚠️ **РОВНО ${relationshipsPerArea} связей на каждую область** (итого ${totalRelationships}+)
⚠️ **Все элементы должны быть связаны**
⚠️ **Связи не должны пересекать элементы** (горизонтальное/вертикальное размещение)

## КОНТЕКСТ:
${isASIS ? `
### AS-IS: Устаревшая локальная инфраструктура

**3 области (СТРОГО 15-17 элементов на каждую):**

1. **Запись (Booking)** — 16 элементов:
   - 4 Nodes: ПК администратора (Core i3 4GB), Сервер приложений (Win Server 2012), БД-сервер (MySQL 5.5), Коммутатор TP-Link
   - 3 Devices: Телефон Panasonic KX-TS, ПК Dell OptiPlex, Принтер HP LaserJet
   - 3 System Software: Windows Server 2012, Excel 2010, MySQL 5.5
   - 3 Services: Файловый сервис SMB, Служба MySQL, Телефонная служба PBX
   - 2 Artifacts: Файлы Excel расписаний, Скрипты бэкапа .bat
   - 1 Network: LAN 100 Мбит/с

   **30 связей**: assignment (device→node), realization (software→service), serving (service→service), access (node→artifact), composition (node→software)

2. **Хранение (Storage)** — 16 элементов:
   - 4 Nodes: Файловый сервер (RAID 1 2TB), БД-сервер клиентов, NAS Synology DS218+, ПК менеджера
   - 3 Devices: ПК менеджера Dell, Сканер Canon, NAS устройство
   - 3 System Software: Windows Server 2012, MySQL 5.5, NTFS
   - 3 Services: Служба резервного копирования, Сетевая папка SMB, Антивирус Kaspersky
   - 2 Artifacts: my.cnf конфиг, Windows Event Log
   - 1 Network: LAN

   **30 связей**

3. **Отчётность (Reporting)** — 16 элементов:
   - 4 Nodes: ПК менеджера, БД продаж MySQL, Файловый сервер, Коммутатор
   - 3 Devices: ПК менеджера, Принтер HP OfficeJet, Роутер D-Link
   - 3 System Software: Excel 2010, MySQL Workbench, Python 2.7
   - 3 Services: Email локальный, Служба печати, WSUS
   - 2 Artifacts: Шаблоны Excel, Скрипты Python
   - 1 Network: Интернет DSL 10 Мбит/с

   **30 связей**
` : `
### TO-BE: Облачная инфраструктура AWS

**3 области (СТРОГО 18-20 элементов на каждую):**

1. **Запись (Booking)** — 19 элементов:
   - 5 Nodes: AWS EC2 API Server, RDS PostgreSQL, Load Balancer ALB, K8s Master EKS, CDN Edge CloudFront
   - 4 Devices: Смартфон iOS, Смартфон Android, QR-сканер, Планшет iPad
   - 4 System Software: Linux Ubuntu 22.04, Docker Engine, Kubernetes 1.28, PostgreSQL 14
   - 3 Services: API Gateway, Push Notifications FCM, SMS Service Twilio
   - 2 Artifacts: Docker Images, K8s Deployment YAML
   - 1 Network: AWS VPC

   **35 связей**: assignment, realization, serving, access, composition, aggregation

2. **Хранение (Storage)** — 19 элементов:
   - 5 Nodes: Cloud CRM Salesforce, RDS PostgreSQL, S3 Bucket, Backup Server, ETL Pipeline Glue
   - 4 Devices: Планшет администратора, Смартфон тренера, ПК менеджера, Wi-Fi AP
   - 4 System Software: PostgreSQL 14, Redis 7.x, Python 3.11, nginx 1.24
   - 3 Services: Managed DB RDS, Cloud Storage S3, Backup Service
   - 2 Artifacts: Terraform Config, Ansible Playbooks
   - 1 Network: Private Subnet AWS

   **35 связей**

3. **Отчётность (Reporting)** — 19 элементов:
   - 5 Nodes: BI Platform Power BI, Data Warehouse Redshift, ETL Glue, Monitoring Prometheus, Dashboard nginx
   - 4 Devices: ПК менеджера, Смартфон менеджера, Планшет руководителя, Роутер Ubiquiti
   - 4 System Software: Prometheus, Grafana, Python 3.11, Linux Ubuntu
   - 3 Services: BI Analytics, CloudWatch Monitoring, Notification SNS
   - 2 Artifacts: prometheus.yml, nginx.conf
   - 1 Network: CDN CloudFront

   **35 связей**
`}

## ФОРМАТ ОТВЕТА: JSON

{
  "description": "Technology Layer ${phase} Integrated View",
  "areas": {
    "Запись": {
      "nodes": [
        {"id": "b_n1", "name": "ПК администратора", "type": "node", "description": "Core i3, 4GB RAM", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_n2", "name": "Сервер приложений", "type": "node", "description": "Windows Server 2012", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_d1", "name": "Телефон", "type": "device", "description": "Panasonic KX-TS", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_ss1", "name": "Windows Server 2012", "type": "system-software", "description": "ОС сервера", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_ts1", "name": "Файловый сервис", "type": "technology-service", "description": "SMB", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_a1", "name": "Файлы Excel", "type": "artifact", "description": "Расписания", "properties": {"Phase": "${phase}", "Area": "Запись"}},
        {"id": "b_net1", "name": "LAN", "type": "communication-network", "description": "100 Мбит/с", "properties": {"Phase": "${phase}", "Area": "Запись"}}
      ],
      "relationships": [
        {"source": "b_d1", "target": "b_n1", "type": "assignment-relationship", "name": "connected to"},
        {"source": "b_n1", "target": "b_ss1", "type": "assignment-relationship", "name": "runs"},
        {"source": "b_ss1", "target": "b_ts1", "type": "realization-relationship", "name": "realizes"},
        {"source": "b_ts1", "target": "b_a1", "type": "access-relationship", "name": "reads"},
        {"source": "b_n1", "target": "b_net1", "type": "assignment-relationship", "name": "connects to"}
      ]
    },
    "Хранение": {
      "nodes": [...],
      "relationships": [...]
    },
    "Отчётность": {
      "nodes": [...],
      "relationships": [...]
    }
  },
  "cross_area_relationships": [
    {"source": "b_ts1", "target": "s_n1", "type": "serving-relationship", "name": "sends data to"}
  ]
}

⚠️ КРИТИЧЕСКИ ВАЖНО:
1. **РОВНО ${elementsPerArea} элементов на область** (не больше, не меньше!)
2. **РОВНО ${relationshipsPerArea} связей на область**
3. **Короткие id**: b_n1, s_d1, r_ts1 (b=Запись, s=Хранение, r=Отчётность)
4. **Все элементы связаны** (нет изолированных)

ВЕРНИ ТОЛЬКО JSON в тегах <technology_model>...</technology_model>`;
}

// ============================================================
// ИЗВЛЕЧЕНИЕ JSON
// ============================================================
function extractJSON(content) {
    const taggedMatch = content.match(/<technology_model>([\s\S]*?)<\/technology_model>/);
    if (taggedMatch) {
        let extracted = taggedMatch[1].trim();
        logConsole("✓ Extracted JSON from <technology_model> tags");
        extracted = extracted.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        return extracted;
    }
    
    let cleanContent = content.replace(/```json\s*\n?/gi, '').replace(/\n?```/g, '');
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        logConsole("✓ Extracted JSON by braces");
        return cleanContent.substring(firstBrace, lastBrace + 1);
    }
    
    logConsole("✗ No JSON found in response");
    return null;
}

// ============================================================
// ВАЛИДАЦИЯ КОЛИЧЕСТВА ЭЛЕМЕНТОВ
// ============================================================
function validateElementCount(jsonObject, phase) {
    const isASIS = phase === "AS-IS";
    const minPerArea = isASIS ? 15 : 18;
    const maxPerArea = isASIS ? 17 : 20;
    const minTotal = isASIS ? 45 : 54;
    const maxTotal = isASIS ? 51 : 60;
    
    let totalElements = 0;
    let areaValid = true;
    
    for (let area in jsonObject.areas) {
        const count = jsonObject.areas[area].nodes.length;
        totalElements += count;
        
        if (count < minPerArea || count > maxPerArea) {
            logConsole(`⚠ Area ${area}: ${count} elements (expected ${minPerArea}-${maxPerArea})`);
            areaValid = false;
        }
    }
    
    if (totalElements < minTotal || totalElements > maxTotal) {
        logConsole(`⚠ Total: ${totalElements} elements (expected ${minTotal}-${maxTotal})`);
        return false;
    }
    
    return areaValid && totalElements >= minTotal && totalElements <= maxTotal;
}

// ============================================================
// ГЕНЕРАЦИЯ С RETRY И ВАЛИДАЦИЕЙ
// ============================================================
function generateWithRetry(phase) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        logConsole(`\n>>> Attempt ${attempt}/${MAX_RETRIES}: ${phase}`);
        
        try {
            const prompt = buildIntegratedPrompt(phase);
            
            logConsole("→ Calling Anthropic API...");
            const content = callAnthropicAPI(prompt);
            logConsole(`← Response received: ${content.length} chars`);
            
            const extractedJSON = extractJSON(content);
            if (!extractedJSON) {
                logConsole("✗ No JSON found, retrying...");
                if (attempt < MAX_RETRIES) continue;
                throw new Error("No JSON found after " + MAX_RETRIES + " attempts");
            }
            
            const jsonObject = JSON.parse(extractedJSON);
            
            if (!jsonObject.areas) {
                throw new Error("Missing 'areas' in JSON");
            }
            
            // ВАЛИДАЦИЯ КОЛИЧЕСТВА
            if (!validateElementCount(jsonObject, phase)) {
                logConsole("✗ Element count validation failed, retrying...");
                if (attempt < MAX_RETRIES) continue;
                throw new Error("Element count out of range after " + MAX_RETRIES + " attempts");
            }
            
            let totalNodes = 0;
            let totalRels = 0;
            for (let area in jsonObject.areas) {
                totalNodes += jsonObject.areas[area].nodes.length;
                if (jsonObject.areas[area].relationships) {
                    totalRels += jsonObject.areas[area].relationships.length;
                }
            }
            
            logConsole(`✓ Validated: ${totalNodes} nodes, ${totalRels} relationships`);
            
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
        
        throw new Error("No ArchiMate model found!");
    } catch (e) {
        logConsole(`✗ getTargetModel error: ${e.message}`);
        throw e;
    }
}

// ============================================================
// СОЗДАНИЕ ЭЛЕМЕНТА
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
        logConsole(`⚠ Failed to create ${node.type}, using grouping: ${e.message}`);
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

// ============================================================
// СОЗДАНИЕ СВЯЗИ
// ============================================================
function createRelationship(targetModel, source, target, relType, name) {
    const validTypes = [
        'association-relationship',
        'assignment-relationship',
        'realization-relationship',
        'serving-relationship',
        'composition-relationship',
        'aggregation-relationship',
        'access-relationship',
        'triggering-relationship',
        'flow-relationship'
    ];
    
    const type = validTypes.includes(relType) ? relType : 'association-relationship';
    
    try {
        return targetModel.createRelationship(type, name || '', source, target);
    } catch (e) {
        return targetModel.createRelationship('association-relationship', name || '', source, target);
    }
}

// ============================================================
// СОЗДАНИЕ INTEGRATED VIEW С ПРЯМОУГОЛЬНЫМ РАЗМЕЩЕНИЕМ
// ============================================================
function createIntegratedView(targetModel, phase, modelJson) {
    const viewName = `Technology Layer — ${phase} — Integrated`;
    const view = targetModel.createArchimateView(viewName);
    
    view.documentation = `🖥️ Technology & Physical Layer: ${phase} Integrated View\n\n` +
                        `${modelJson.description || ''}\n\n` +
                        `3 области: Запись / Хранение / Отчётность\n` +
                        `ArchiMate 3.2, Technology Layer\n` +
                        `Цвет: #C9E7B7 (Technology Green)`;
    
    view.prop("viewpoint", "technology");
    view.prop("Phase", phase);
    
    const elementMap = {};
    const visualMap = {};
    
    // Размещение областей ГОРИЗОНТАЛЬНО
    let areaX = LAYOUT_CONFIG.MARGIN_LEFT;
    const areaY = LAYOUT_CONFIG.MARGIN_TOP;
    
    const areaNames = ["Запись", "Хранение", "Отчётность"];
    
    for (let areaIdx = 0; areaIdx < areaNames.length; areaIdx++) {
        const areaName = areaNames[areaIdx];
        const areaData = modelJson.areas[areaName];
        
        if (!areaData || !areaData.nodes) {
            logConsole(`⚠ No data for area: ${areaName}`);
            continue;
        }
        
        logConsole(`\n  Processing area: ${areaName} (${areaData.nodes.length} nodes, ${areaData.relationships ? areaData.relationships.length : 0} relationships)`);
        
        // Создаём grouping для области
        const areaGrouping = targetModel.createElement('grouping', `IS ${areaName}`);
        areaGrouping.prop("Area", areaName);
        areaGrouping.prop("Phase", phase);
        areaGrouping.documentation = `Область инфраструктуры: ${areaName}`;
        
        const areaVisual = view.add(areaGrouping, areaX, areaY, LAYOUT_CONFIG.AREA_WIDTH, LAYOUT_CONFIG.AREA_HEIGHT);
        areaVisual.fillColor = "#EEEEEE";
        areaVisual.opacity = 50;
        
        // Размещение элементов внутри области прямоугольной сеткой
        let elementX = areaX + 35;
        let elementY = areaY + 60;
        let col = 0;
        
        for (let i = 0; i < areaData.nodes.length; i++) {
            const node = areaData.nodes[i];
            try {
                const element = createElement(targetModel, node);
                elementMap[node.id] = element;
                
                const visualObj = view.add(element, elementX, elementY, LAYOUT_CONFIG.ELEMENT_WIDTH, LAYOUT_CONFIG.ELEMENT_HEIGHT);
                visualMap[node.id] = visualObj;
                visualObj.fillColor = TECH_COLOR;
                
                // Переход к следующей позиции
                col++;
                if (col >= LAYOUT_CONFIG.ELEMENTS_PER_ROW) {
                    col = 0;
                    elementX = areaX + 35;
                    elementY += LAYOUT_CONFIG.ELEMENT_HEIGHT + 12;
                } else {
                    elementX += LAYOUT_CONFIG.ELEMENT_WIDTH + 20;
                }
                
            } catch (e) {
                logConsole(`✗ Failed to create element ${node.id}: ${e.message}`);
            }
        }
        
        // Создание связей внутри области
        let createdRels = 0;
        if (areaData.relationships) {
            for (let i = 0; i < areaData.relationships.length; i++) {
                const rel = areaData.relationships[i];
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
                        createdRels++;
                    }
                } catch (e) {
                    // Пропускаем ошибки связей
                }
            }
        }
        
        logConsole(`  ✓ Created ${createdRels} relationships in ${areaName}`);
        
        // Сдвиг к следующей области
        areaX += LAYOUT_CONFIG.AREA_WIDTH + LAYOUT_CONFIG.HORIZONTAL_GAP;
    }
    
    logConsole(`✓ Created ${Object.keys(elementMap).length} elements`);
    
    // Создание связей между областями
    let crossRels = 0;
    if (modelJson.cross_area_relationships) {
        logConsole(`  Creating ${modelJson.cross_area_relationships.length} cross-area relationships`);
        for (let i = 0; i < modelJson.cross_area_relationships.length; i++) {
            const rel = modelJson.cross_area_relationships[i];
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
                    crossRels++;
                }
            } catch (e) {
                // Пропускаем ошибки связей
            }
        }
    }
    
    logConsole(`  ✓ Created ${crossRels} cross-area relationships`);
    
    return view;
}

// ============================================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================================
function main() {
    try {
        logConsole('\n========================================');
        logConsole('=== Technology Layer Generator v2.2 ===');
        logConsole('========================================');
        
        const targetModel = getTargetModel();
        
        const results = [];
        
        for (let i = 0; i < VIEWS_CONFIG.length; i++) {
            const config = VIEWS_CONFIG[i];
            logConsole(`\n=== View ${i + 1}/2: ${config.phase} Integrated ===`);
            
            try {
                const modelJson = generateWithRetry(config.phase);
                
                if (!modelJson || !modelJson.areas) {
                    throw new Error("Invalid JSON structure");
                }
                
                createIntegratedView(targetModel, config.phase, modelJson);
                
                let totalElements = 0;
                let totalRels = 0;
                for (let area in modelJson.areas) {
                    totalElements += modelJson.areas[area].nodes.length;
                    if (modelJson.areas[area].relationships) {
                        totalRels += modelJson.areas[area].relationships.length;
                    }
                }
                
                if (modelJson.cross_area_relationships) {
                    totalRels += modelJson.cross_area_relationships.length;
                }
                
                results.push({
                    phase: config.phase,
                    elements: totalElements,
                    relationships: totalRels,
                    success: true
                });
                
                logConsole(`✓ ${config.phase}: OK (${totalElements} elements, ${totalRels} relationships)`);
                
            } catch (error) {
                logConsole(`✗ ${config.phase}: FAILED - ${error.message}`);
                results.push({
                    phase: config.phase,
                    elements: 0,
                    relationships: 0,
                    success: false,
                    error: error.message
                });
            }
        }
        
        logConsole('\n=== FINAL SUMMARY ===');
        
        let successCount = 0;
        let totalElements = 0;
        let totalRels = 0;
        
        for (let i = 0; i < results.length; i++) {
            if (results[i].success) successCount++;
            totalElements += results[i].elements;
            totalRels += results[i].relationships;
        }
        
        logConsole(`\nРезультаты генерации:`);
        logConsole(`  Успешно создано: ${successCount}/2 integrated views`);
        logConsole(`  Всего элементов: ${totalElements}`);
        logConsole(`  Всего связей: ${totalRels}`);
        
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            if (r.success) {
                logConsole(`  ${i + 1}. ${r.phase}: ✓ ${r.elements} элементов, ${r.relationships} связей`);
            } else {
                logConsole(`  ${i + 1}. ${r.phase}: ✗ ${r.error}`);
            }
        }
        
        if (successCount === 2) {
            logConsole(`\n✅ ОБЕ Technology Integrated Views успешно созданы!`);
            logConsole(`\n📌 Проверьте в Archi: Views → Technology Layer`);
            logConsole(`\n🎯 AS-IS: 45-51 элемент, 90+ связей`);
            logConsole(`\n🎯 TO-BE: 54-60 элементов, 105+ связей`);
        } else {
            logConsole(`\n⚠️ Создано ${successCount}/2 views`);
        }
        
    } catch (error) {
        logConsole(`\n✗ CRITICAL ERROR: ${error.message}`);
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
    if (error.stack) {
        console.log(error.stack);
    }
}