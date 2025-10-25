/**
 * @name Generate Migration Integrated View - Fitness Club v8.0
 * @description ОДНА Integrated View с 4 слоями (Business/Application/Technology/Migration)
 * @version 8.0 — Migration Layer внизу, все элементы связаны
 * @author Claude AI Assistant
 * @lastModifiedDate 2025-10-26
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

logConsole("=== Migration Integrated View Generator v8.0 ===");

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const ANTHROPIC_API_KEY = ""; // ← ВСТАВЬТЕ API KEY
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_VERSION = "2023-06-01";
const API_TIMEOUT = 360000;
const MAX_TOKENS = 24000;
const MAX_RETRIES = 2;

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
    
    // Implementation & Migration (4-й слой внизу)
    "work-package": "#FFE4B5",
    "deliverable": "#E0FFE0",
    "implementation-event": "#FFE0F0",
    "plateau": "#F0F0F0",
    "gap": "#FFD0D0",
    
    // По умолчанию
    "grouping": "#F5F5F5",
    "location": "#F5F5F5"
};

// Layout config для 4 слоёв
const LAYOUT_CONFIG = {
    MARGIN_LEFT: 50,
    MARGIN_TOP: 50,
    AREA_WIDTH: 800,
    AREA_GAP: 100,
    LAYER_HEIGHT: 180,      // Высота слоя (уменьшена для 4 слоёв)
    LAYER_GAP: 30,
    ELEMENT_WIDTH: 160,
    ELEMENT_HEIGHT: 60,
    ELEMENTS_PER_ROW: 4
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
        
        throw new Error("No ArchiMate model found!");
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
        return jsonResponse.content[0].text;
        
    } catch (e) {
        logConsole(`✗ API call failed: ${e.message}`);
        throw e;
    }
}

// ============================================================
// ПРОМПТ ДЛЯ 4-СЛОЙНОЙ VIEW (~50 ЭЛЕМЕНТОВ)
// ============================================================
const MIGRATION_INTEGRATED_PROMPT = `Ты — senior архитектор, эксперт по ArchiMate 3.2 Implementation & Migration Layer.

ЗАДАЧА: Создать ОДНУ компактную Integrated Migration View для фитнес-клуба с 3 доменами: Запись, Хранение, Отчётность.

## КОНТЕКСТ:
- Цифровая трансформация: 12 месяцев, бюджет 5 млн руб
- AS-IS: телефоны, бумажные журналы, Excel
- TO-BE: онлайн-запись, облачная CRM, BI-аналитика

## ТРЕБОВАНИЯ:
✅ **~50 элементов ИТОГО** (компактно)
✅ **70-100 связей** (все элементы связаны)
✅ **4 слоя**: Business → Application → Technology → **Migration**
✅ **3 домена**: Запись, Хранение, Отчётность (горизонтально)

## СТРУКТУРА ПО ДОМЕНАМ (КОМПАКТНО — по 4 элемента на слой):

### 📌 ДОМЕН 1: ЗАПИСЬ (Booking)

**Business Layer (4 элемента):**
- Actor (1): Клиент
- Process (2): Запись клиента (AS-IS), Онлайн-запись (TO-BE)
- Object (1): Расписание

**Application Layer (4 элемента):**
- Component (2): Excel (AS-IS), Mobile App (TO-BE)
- Service (1): Booking API (TO-BE)
- Function (1): Check Availability

**Technology Layer (4 элемента):**
- Node (2): Admin PC (AS-IS), AWS EC2 (TO-BE)
- Device (1): Смартфон (TO-BE)
- Service (1): Cloud Hosting (TO-BE)

**Migration Layer (4 элемента):**
- Plateau (2): AS-IS Plateau (Запись), TO-BE Plateau (Запись)
- Work Package (1): WP1: Мобильное приложение (3 мес, 1.5M)
- Gap (1): Технологический разрыв (бумага → мобильное)

---

### 📌 ДОМЕН 2: ХРАНЕНИЕ (Storage)

**Business Layer (4 элемента):**
- Actor (1): Администратор БД
- Process (2): Хранение в шкафу (AS-IS), Хранение в облаке (TO-BE)
- Object (1): База клиентов

**Application Layer (4 элемента):**
- Component (2): Access DB (AS-IS), PostgreSQL (TO-BE)
- Service (1): Data API (TO-BE)
- Function (1): CRUD Operations

**Technology Layer (4 элемента):**
- Node (2): Локальный сервер (AS-IS), AWS RDS (TO-BE)
- Device (1): Планшет (TO-BE)
- Service (1): AWS S3 Backup (TO-BE)

**Migration Layer (4 элемента):**
- Plateau (2): AS-IS Plateau (Хранение), TO-BE Plateau (Хранение)
- Work Package (1): WP2: Cloud CRM (2 мес, 800k)
- Deliverable (1): CRM-система

---

### 📌 ДОМЕН 3: ОТЧЁТНОСТЬ (Reporting)

**Business Layer (4 элемента):**
- Actor (1): Директор
- Process (2): Формирование отчёта (AS-IS), Автоотчёты (TO-BE)
- Object (1): Excel-отчёт

**Application Layer (4 элемента):**
- Component (2): Excel Pivot (AS-IS), Power BI (TO-BE)
- Service (1): Analytics API (TO-BE)
- Function (1): Generate Dashboard

**Technology Layer (4 элемента):**
- Node (2): ПК бухгалтера (AS-IS), Azure VM (TO-BE)
- Device (1): 4K-монитор (TO-BE)
- Service (1): Azure Cloud (TO-BE)

**Migration Layer (4 элемента):**
- Plateau (2): AS-IS Plateau (Отчётность), TO-BE Plateau (Отчётность)
- Work Package (1): WP3: BI-дашборды (2 мес, 700k)
- Gap (1): Функциональный разрыв (ручные отчёты → BI)

---

## СВЯЗИ (ВСЕ ЭЛЕМЕНТЫ СВЯЗАНЫ):

### Вертикальные связи (между слоями в одном домене):
1. **Business → Application**: Process → Component (serving-relationship)
2. **Application → Technology**: Component → Node (assignment-relationship)
3. **Technology → Migration**: Node → Work Package (association-relationship "реализуется")
4. **Migration → Migration**: Plateau AS-IS → Gap → Work Package → Plateau TO-BE (flow-relationship)

### Горизонтальные связи (между доменами):
1. Запись.Object → Хранение.Component (flow-relationship "передаёт данные")
2. Хранение.Component → Отчётность.Component (flow-relationship "источник для отчётов")
3. Запись.Work Package → Хранение.Work Package (triggering-relationship "предшествует")
4. Хранение.Work Package → Отчётность.Work Package (triggering-relationship "предшествует")

---

## ФОРМАТ ОТВЕТА: JSON

{
  "description": "Implementation & Migration Integrated View: Fitness Club (4 слоя)",
  "areas": {
    "Запись": {
      "business": {
        "nodes": [
          {"id": "z_b_a1", "name": "Клиент", "type": "business-actor", "description": "", "properties": {"Area": "Запись", "Domain": "Business"}},
          {"id": "z_b_p1", "name": "Запись клиента (AS-IS)", "type": "business-process", "description": "Ручная", "properties": {"Area": "Запись", "Domain": "Business", "Phase": "AS-IS"}},
          {"id": "z_b_p2", "name": "Онлайн-запись (TO-BE)", "type": "business-process", "description": "Автоматическая", "properties": {"Area": "Запись", "Domain": "Business", "Phase": "TO-BE"}},
          {"id": "z_b_o1", "name": "Расписание", "type": "business-object", "description": "", "properties": {"Area": "Запись", "Domain": "Business"}}
        ],
        "relationships": [
          {"source": "z_b_a1", "target": "z_b_p1", "type": "assignment-relationship", "name": "выполняет"}
        ]
      },
      "application": {
        "nodes": [
          {"id": "z_a_c1", "name": "Excel (AS-IS)", "type": "application-component", "description": "", "properties": {"Area": "Запись", "Domain": "Application", "Phase": "AS-IS"}},
          {"id": "z_a_c2", "name": "Mobile App (TO-BE)", "type": "application-component", "description": "", "properties": {"Area": "Запись", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "z_a_s1", "name": "Booking API", "type": "application-service", "description": "", "properties": {"Area": "Запись", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "z_a_f1", "name": "Check Availability", "type": "application-function", "description": "", "properties": {"Area": "Запись", "Domain": "Application", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "z_a_c1", "target": "z_b_p1", "type": "serving-relationship", "name": "поддерживает"},
          {"source": "z_a_c2", "target": "z_b_p2", "type": "serving-relationship", "name": "поддерживает"}
        ]
      },
      "technology": {
        "nodes": [
          {"id": "z_t_n1", "name": "Admin PC (AS-IS)", "type": "node", "description": "", "properties": {"Area": "Запись", "Domain": "Technology", "Phase": "AS-IS"}},
          {"id": "z_t_n2", "name": "AWS EC2 (TO-BE)", "type": "node", "description": "", "properties": {"Area": "Запись", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "z_t_d1", "name": "Смартфон (TO-BE)", "type": "device", "description": "", "properties": {"Area": "Запись", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "z_t_s1", "name": "Cloud Hosting", "type": "technology-service", "description": "", "properties": {"Area": "Запись", "Domain": "Technology", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "z_t_n1", "target": "z_a_c1", "type": "assignment-relationship", "name": "размещает"},
          {"source": "z_t_n2", "target": "z_a_c2", "type": "assignment-relationship", "name": "размещает"}
        ]
      },
      "migration": {
        "nodes": [
          {"id": "z_m_p1", "name": "AS-IS Plateau (Запись)", "type": "plateau", "description": "Текущее состояние", "properties": {"Area": "Запись", "Domain": "Migration", "Phase": "AS-IS"}},
          {"id": "z_m_p2", "name": "TO-BE Plateau (Запись)", "type": "plateau", "description": "Целевое состояние", "properties": {"Area": "Запись", "Domain": "Migration", "Phase": "TO-BE"}},
          {"id": "z_m_wp1", "name": "WP1: Мобильное приложение", "type": "work-package", "description": "3 мес, 1.5M", "properties": {"Area": "Запись", "Domain": "Migration", "Duration": "3", "Budget": "1500000"}},
          {"id": "z_m_g1", "name": "Технологический разрыв", "type": "gap", "description": "Бумага → мобильное", "properties": {"Area": "Запись", "Domain": "Migration"}}
        ],
        "relationships": [
          {"source": "z_m_p1", "target": "z_m_g1", "type": "association-relationship", "name": "имеет разрыв"},
          {"source": "z_m_g1", "target": "z_m_wp1", "type": "association-relationship", "name": "преодолевается через"},
          {"source": "z_m_wp1", "target": "z_m_p2", "type": "realization-relationship", "name": "реализует"},
          {"source": "z_t_n2", "target": "z_m_wp1", "type": "association-relationship", "name": "реализуется в"}
        ]
      }
    },
    "Хранение": {
      "business": {
        "nodes": [
          {"id": "h_b_a1", "name": "Администратор БД", "type": "business-actor", "description": "", "properties": {"Area": "Хранение", "Domain": "Business"}},
          {"id": "h_b_p1", "name": "Хранение в шкафу (AS-IS)", "type": "business-process", "description": "Бумага", "properties": {"Area": "Хранение", "Domain": "Business", "Phase": "AS-IS"}},
          {"id": "h_b_p2", "name": "Хранение в облаке (TO-BE)", "type": "business-process", "description": "Cloud", "properties": {"Area": "Хранение", "Domain": "Business", "Phase": "TO-BE"}},
          {"id": "h_b_o1", "name": "База клиентов", "type": "business-object", "description": "", "properties": {"Area": "Хранение", "Domain": "Business"}}
        ],
        "relationships": [
          {"source": "h_b_a1", "target": "h_b_p1", "type": "assignment-relationship", "name": "выполняет"}
        ]
      },
      "application": {
        "nodes": [
          {"id": "h_a_c1", "name": "Access DB (AS-IS)", "type": "application-component", "description": "", "properties": {"Area": "Хранение", "Domain": "Application", "Phase": "AS-IS"}},
          {"id": "h_a_c2", "name": "PostgreSQL (TO-BE)", "type": "application-component", "description": "", "properties": {"Area": "Хранение", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "h_a_s1", "name": "Data API", "type": "application-service", "description": "", "properties": {"Area": "Хранение", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "h_a_f1", "name": "CRUD Operations", "type": "application-function", "description": "", "properties": {"Area": "Хранение", "Domain": "Application", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "h_a_c1", "target": "h_b_p1", "type": "serving-relationship", "name": "поддерживает"},
          {"source": "h_a_c2", "target": "h_b_p2", "type": "serving-relationship", "name": "поддерживает"}
        ]
      },
      "technology": {
        "nodes": [
          {"id": "h_t_n1", "name": "Локальный сервер (AS-IS)", "type": "node", "description": "", "properties": {"Area": "Хранение", "Domain": "Technology", "Phase": "AS-IS"}},
          {"id": "h_t_n2", "name": "AWS RDS (TO-BE)", "type": "node", "description": "", "properties": {"Area": "Хранение", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "h_t_d1", "name": "Планшет (TO-BE)", "type": "device", "description": "", "properties": {"Area": "Хранение", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "h_t_s1", "name": "AWS S3 Backup", "type": "technology-service", "description": "", "properties": {"Area": "Хранение", "Domain": "Technology", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "h_t_n1", "target": "h_a_c1", "type": "assignment-relationship", "name": "размещает"},
          {"source": "h_t_n2", "target": "h_a_c2", "type": "assignment-relationship", "name": "размещает"}
        ]
      },
      "migration": {
        "nodes": [
          {"id": "h_m_p1", "name": "AS-IS Plateau (Хранение)", "type": "plateau", "description": "Текущее состояние", "properties": {"Area": "Хранение", "Domain": "Migration", "Phase": "AS-IS"}},
          {"id": "h_m_p2", "name": "TO-BE Plateau (Хранение)", "type": "plateau", "description": "Целевое состояние", "properties": {"Area": "Хранение", "Domain": "Migration", "Phase": "TO-BE"}},
          {"id": "h_m_wp1", "name": "WP2: Cloud CRM", "type": "work-package", "description": "2 мес, 800k", "properties": {"Area": "Хранение", "Domain": "Migration", "Duration": "2", "Budget": "800000"}},
          {"id": "h_m_dl1", "name": "CRM-система", "type": "deliverable", "description": "", "properties": {"Area": "Хранение", "Domain": "Migration"}}
        ],
        "relationships": [
          {"source": "h_m_wp1", "target": "h_m_dl1", "type": "realization-relationship", "name": "создаёт"},
          {"source": "h_m_dl1", "target": "h_m_p2", "type": "realization-relationship", "name": "реализует"}
        ]
      }
    },
    "Отчётность": {
      "business": {
        "nodes": [
          {"id": "o_b_a1", "name": "Директор", "type": "business-actor", "description": "", "properties": {"Area": "Отчётность", "Domain": "Business"}},
          {"id": "o_b_p1", "name": "Формирование отчёта (AS-IS)", "type": "business-process", "description": "Вручную", "properties": {"Area": "Отчётность", "Domain": "Business", "Phase": "AS-IS"}},
          {"id": "o_b_p2", "name": "Автоотчёты (TO-BE)", "type": "business-process", "description": "BI-дашборды", "properties": {"Area": "Отчётность", "Domain": "Business", "Phase": "TO-BE"}},
          {"id": "o_b_o1", "name": "Excel-отчёт", "type": "business-object", "description": "", "properties": {"Area": "Отчётность", "Domain": "Business"}}
        ],
        "relationships": [
          {"source": "o_b_a1", "target": "o_b_p1", "type": "assignment-relationship", "name": "выполняет"}
        ]
      },
      "application": {
        "nodes": [
          {"id": "o_a_c1", "name": "Excel Pivot (AS-IS)", "type": "application-component", "description": "", "properties": {"Area": "Отчётность", "Domain": "Application", "Phase": "AS-IS"}},
          {"id": "o_a_c2", "name": "Power BI (TO-BE)", "type": "application-component", "description": "", "properties": {"Area": "Отчётность", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "o_a_s1", "name": "Analytics API", "type": "application-service", "description": "", "properties": {"Area": "Отчётность", "Domain": "Application", "Phase": "TO-BE"}},
          {"id": "o_a_f1", "name": "Generate Dashboard", "type": "application-function", "description": "", "properties": {"Area": "Отчётность", "Domain": "Application", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "o_a_c1", "target": "o_b_p1", "type": "serving-relationship", "name": "поддерживает"},
          {"source": "o_a_c2", "target": "o_b_p2", "type": "serving-relationship", "name": "поддерживает"}
        ]
      },
      "technology": {
        "nodes": [
          {"id": "o_t_n1", "name": "ПК бухгалтера (AS-IS)", "type": "node", "description": "", "properties": {"Area": "Отчётность", "Domain": "Technology", "Phase": "AS-IS"}},
          {"id": "o_t_n2", "name": "Azure VM (TO-BE)", "type": "node", "description": "", "properties": {"Area": "Отчётность", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "o_t_d1", "name": "4K-монитор (TO-BE)", "type": "device", "description": "", "properties": {"Area": "Отчётность", "Domain": "Technology", "Phase": "TO-BE"}},
          {"id": "o_t_s1", "name": "Azure Cloud", "type": "technology-service", "description": "", "properties": {"Area": "Отчётность", "Domain": "Technology", "Phase": "TO-BE"}}
        ],
        "relationships": [
          {"source": "o_t_n1", "target": "o_a_c1", "type": "assignment-relationship", "name": "размещает"},
          {"source": "o_t_n2", "target": "o_a_c2", "type": "assignment-relationship", "name": "размещает"}
        ]
      },
      "migration": {
        "nodes": [
          {"id": "o_m_p1", "name": "AS-IS Plateau (Отчётность)", "type": "plateau", "description": "Текущее состояние", "properties": {"Area": "Отчётность", "Domain": "Migration", "Phase": "AS-IS"}},
          {"id": "o_m_p2", "name": "TO-BE Plateau (Отчётность)", "type": "plateau", "description": "Целевое состояние", "properties": {"Area": "Отчётность", "Domain": "Migration", "Phase": "TO-BE"}},
          {"id": "o_m_wp1", "name": "WP3: BI-дашборды", "type": "work-package", "description": "2 мес, 700k", "properties": {"Area": "Отчётность", "Domain": "Migration", "Duration": "2", "Budget": "700000"}},
          {"id": "o_m_g1", "name": "Функциональный разрыв", "type": "gap", "description": "Ручные → BI", "properties": {"Area": "Отчётность", "Domain": "Migration"}}
        ],
        "relationships": [
          {"source": "o_m_p1", "target": "o_m_g1", "type": "association-relationship", "name": "имеет разрыв"},
          {"source": "o_m_g1", "target": "o_m_wp1", "type": "association-relationship", "name": "преодолевается через"}
        ]
      }
    }
  },
  "cross_area_relationships": [
    {"source": "z_b_o1", "target": "h_a_c2", "type": "flow-relationship", "name": "передаёт данные"},
    {"source": "h_a_c2", "target": "o_a_c2", "type": "flow-relationship", "name": "источник для отчётов"},
    {"source": "z_m_wp1", "target": "h_m_wp1", "type": "triggering-relationship", "name": "предшествует"},
    {"source": "h_m_wp1", "target": "o_m_wp1", "type": "triggering-relationship", "name": "предшествует"}
  ]
}

⚠️ ВАЖНО:
1. **~48 элементов** (4 × 3 областей × 4 слоя)
2. **70-100 связей** (все элементы связаны)
3. **4 слоя**: Business → Application → Technology → **Migration (внизу)**
4. **ID-префиксы**: \`z_\` (Запись), \`h_\` (Хранение), \`o_\` (Отчётность), далее \`b_\`/\`a_\`/\`t_\`/\`m_\` (слои)
5. **Properties**: "Area", "Domain", "Phase"

ВЕРНИ ТОЛЬКО JSON в тегах <migration_model>...</migration_model>`;

// ============================================================
// [extractJSON, validateModel, generateWithRetry — БЕЗ ИЗМЕНЕНИЙ]
// ============================================================
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
        return cleanContent.substring(firstBrace, lastBrace + 1);
    }
    
    logConsole("✗ No JSON found in response");
    return null;
}

function validateModel(jsonObject) {
    if (!jsonObject.areas) {
        logConsole("✗ Missing 'areas' structure");
        return false;
    }
    
    let totalElements = 0;
    
    for (let areaName in jsonObject.areas) {
        const area = jsonObject.areas[areaName];
        
        if (!area.business || !area.application || !area.technology || !area.migration) {
            logConsole(`✗ Area "${areaName}" missing layers (need 4: business/application/technology/migration)`);
            return false;
        }
        
        const businessCount = area.business.nodes ? area.business.nodes.length : 0;
        const appCount = area.application.nodes ? area.application.nodes.length : 0;
        const techCount = area.technology.nodes ? area.technology.nodes.length : 0;
        const migrationCount = area.migration.nodes ? area.migration.nodes.length : 0;
        const areaTotal = businessCount + appCount + techCount + migrationCount;
        
        logConsole(`  Area "${areaName}": Business=${businessCount}, App=${appCount}, Tech=${techCount}, Migration=${migrationCount}, Total=${areaTotal}`);
        
        totalElements += areaTotal;
    }
    
    logConsole(`  TOTAL ELEMENTS: ${totalElements}`);
    
    if (totalElements < 40 || totalElements > 60) {
        logConsole(`⚠ Expected ~50 elements (40-60), got ${totalElements}`);
    }
    
    return true;
}

function generateWithRetry() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        logConsole(`\n>>> Attempt ${attempt}/${MAX_RETRIES}`);
        
        try {
            logConsole("→ Calling Anthropic API...");
            const content = callAnthropicAPI(MIGRATION_INTEGRATED_PROMPT);
            logConsole(`← Response received: ${content.length} chars`);
            
            const extractedJSON = extractJSON(content);
            if (!extractedJSON) {
                logConsole("✗ No JSON found, retrying...");
                if (attempt < MAX_RETRIES) continue;
                throw new Error("No JSON found after " + MAX_RETRIES + " attempts");
            }
            
            const jsonObject = JSON.parse(extractedJSON);
            
            if (!validateModel(jsonObject)) {
                logConsole("✗ Validation failed, retrying...");
                if (attempt < MAX_RETRIES) continue;
            }
            
            logConsole(`✓ Validated successfully`);
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
// СОЗДАНИЕ ЭЛЕМЕНТА И СВЯЗИ
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

function createRelationship(targetModel, source, target, relType, name) {
    const validTypes = [
        'association-relationship',
        'assignment-relationship',
        'realization-relationship',
        'serving-relationship',
        'access-relationship',
        'flow-relationship',
        'triggering-relationship'
    ];
    
    const type = validTypes.includes(relType) ? relType : 'association-relationship';
    
    try {
        return targetModel.createRelationship(type, name || '', source, target);
    } catch (e) {
        return targetModel.createRelationship('association-relationship', name || '', source, target);
    }
}

// ============================================================
// СОЗДАНИЕ 4-СЛОЙНОЙ VIEW
// ============================================================
function createIntegratedView(targetModel, modelJson) {
    const viewName = "Implementation & Migration Integrated — Fitness Club";
    const view = targetModel.createArchimateView(viewName);
    
    view.documentation = `🔄 Implementation & Migration Integrated View (4 слоя)\n\n` +
                        `${modelJson.description || ''}\n\n` +
                        `Вертикальное размещение слоёв:\n` +
                        `1. Business Layer (#FFFFB3)\n` +
                        `2. Application Layer (#C0FFFF)\n` +
                        `3. Technology Layer (#D6EEC3)\n` +
                        `4. Implementation & Migration Layer (#FFE4B5, #E0FFE0, #F0F0F0, #FFD0D0)\n\n` +
                        `3 домена (горизонтально): Запись | Хранение | Отчётность\n\n` +
                        `ArchiMate 3.2, Implementation & Migration Viewpoint`;
    
    view.prop("viewpoint", "implementation_migration");
    
    const elementMap = {};
    const visualMap = {};
    
    const areas = ['Запись', 'Хранение', 'Отчётность'];
    const layers = ['business', 'application', 'technology', 'migration']; // 4 слоя!
    
    // Размещение элементов: домены горизонтально, слои вертикально
    for (let areaIdx = 0; areaIdx < areas.length; areaIdx++) {
        const areaName = areas[areaIdx];
        const areaData = modelJson.areas[areaName];
        
        if (!areaData) {
            logConsole(`⚠ Area "${areaName}" not found in model`);
            continue;
        }
        
        const baseX = LAYOUT_CONFIG.MARGIN_LEFT + areaIdx * (LAYOUT_CONFIG.AREA_WIDTH + LAYOUT_CONFIG.AREA_GAP);
        
        // Grouping контейнер для области
        const areaGrouping = targetModel.createElement('grouping', `📊 ${areaName}`);
        areaGrouping.prop("Area", areaName);
        
        const totalHeight = LAYOUT_CONFIG.LAYER_HEIGHT * 4 + LAYOUT_CONFIG.LAYER_GAP * 3 + 40;
        const areaVisual = view.add(areaGrouping, baseX, LAYOUT_CONFIG.MARGIN_TOP, LAYOUT_CONFIG.AREA_WIDTH, totalHeight);
        areaVisual.fillColor = "#F5F5F5";
        areaVisual.opacity = 20;
        
        // Размещение 4 слоёв вертикально
        for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
            const layerName = layers[layerIdx];
            const layerData = areaData[layerName];
            
            if (!layerData || !layerData.nodes) {
                continue;
            }
            
            const layerY = LAYOUT_CONFIG.MARGIN_TOP + 30 + layerIdx * (LAYOUT_CONFIG.LAYER_HEIGHT + LAYOUT_CONFIG.LAYER_GAP);
            
            // Grouping для слоя
            let layerLabel = layerName === 'business' ? '📊 Business' : 
                            layerName === 'application' ? '💻 Application' : 
                            layerName === 'technology' ? '🖥️ Technology' :
                            '🔄 Migration'; // 4-й слой!
            
            const layerGrouping = targetModel.createElement('grouping', `${layerLabel} — ${areaName}`);
            layerGrouping.prop("Area", areaName);
            layerGrouping.prop("Domain", layerName);
            
            const layerColor = layerName === 'business' ? '#FFFFB3' :
                             layerName === 'application' ? '#C0FFFF' :
                             layerName === 'technology' ? '#D6EEC3' :
                             '#FFE4B5'; // Migration
            
            const layerVisual = view.add(layerGrouping, baseX + 10, layerY, LAYOUT_CONFIG.AREA_WIDTH - 20, LAYOUT_CONFIG.LAYER_HEIGHT);
            layerVisual.fillColor = layerColor;
            layerVisual.opacity = 15;
            
            // Размещение элементов слоя
            let elementX = baseX + 30;
            let elementY = layerY + 35;
            let col = 0;
            
            for (let i = 0; i < layerData.nodes.length; i++) {
                const node = layerData.nodes[i];
                
                try {
                    const element = createElement(targetModel, node);
                    elementMap[node.id] = element;
                    
                    const visualObj = view.add(element, elementX, elementY, LAYOUT_CONFIG.ELEMENT_WIDTH, LAYOUT_CONFIG.ELEMENT_HEIGHT);
                    visualMap[node.id] = visualObj;
                    visualObj.fillColor = LAYER_COLORS[node.type] || layerColor;
                    
                    col++;
                    if (col >= LAYOUT_CONFIG.ELEMENTS_PER_ROW) {
                        col = 0;
                        elementX = baseX + 30;
                        elementY += LAYOUT_CONFIG.ELEMENT_HEIGHT + 10;
                    } else {
                        elementX += LAYOUT_CONFIG.ELEMENT_WIDTH + 20;
                    }
                    
                } catch (e) {
                    logConsole(`✗ Failed to create element ${node.id}: ${e.message}`);
                }
            }
            
            // Связи внутри слоя
            if (layerData.relationships) {
                for (let i = 0; i < layerData.relationships.length; i++) {
                    const rel = layerData.relationships[i];
                    try {
                        const sourceElement = elementMap[rel.source];
                        const targetElement = elementMap[rel.target];
                        const sourceVisual = visualMap[rel.source];
                        const targetVisual = visualMap[rel.target];
                        
                        if (sourceElement && targetElement && sourceVisual && targetVisual) {
                            const relationship = createRelationship(targetModel, sourceElement, targetElement, rel.type, rel.name || '');
                            view.add(relationship, sourceVisual, targetVisual);
                        }
                    } catch (e) {
                        // Пропускаем
                    }
                }
            }
        }
    }
    
    // Связи между областями
    logConsole(`\n  Creating cross-area relationships...`);
    let crossRels = 0;
    
    if (modelJson.cross_area_relationships) {
        for (let i = 0; i < modelJson.cross_area_relationships.length; i++) {
            const rel = modelJson.cross_area_relationships[i];
            try {
                const sourceElement = elementMap[rel.source];
                const targetElement = elementMap[rel.target];
                const sourceVisual = visualMap[rel.source];
                const targetVisual = visualMap[rel.target];
                
                if (sourceElement && targetElement && sourceVisual && targetVisual) {
                    const relationship = createRelationship(targetModel, sourceElement, targetElement, rel.type, rel.name || '');
                    view.add(relationship, sourceVisual, targetVisual);
                    crossRels++;
                }
            } catch (e) {
                // Пропускаем
            }
        }
    }
    
    logConsole(`✓ Created ${Object.keys(elementMap).length} elements`);
    logConsole(`✓ Created ${crossRels} cross-area relationships`);
    
    return view;
}

// ============================================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================================
function main() {
    try {
        logConsole('\n========================================');
        logConsole('=== Migration Integrated View v8.0 ===');
        logConsole('========================================');
        
        const targetModel = getTargetModel();
        
        logConsole('\n=== Generating 4-Layer Integrated Migration View ===');
        
        const modelJson = generateWithRetry();
        
        if (!modelJson || !modelJson.areas) {
            throw new Error("Invalid JSON structure");
        }
        
        createIntegratedView(targetModel, modelJson);
        
        let totalElements = 0;
        for (let areaName in modelJson.areas) {
            const area = modelJson.areas[areaName];
            totalElements += (area.business.nodes ? area.business.nodes.length : 0);
            totalElements += (area.application.nodes ? area.application.nodes.length : 0);
            totalElements += (area.technology.nodes ? area.technology.nodes.length : 0);
            totalElements += (area.migration.nodes ? area.migration.nodes.length : 0); // +Migration!
        }
        
        logConsole('\n=== SUCCESS ===');
        logConsole(`✅ Migration Integrated View (4 слоя) создан!`);
        logConsole(`  Всего элементов: ${totalElements}`);
        logConsole(`  Слои: Business → Application → Technology → Migration`);
        logConsole(`  Домены: Запись | Хранение | Отчётность`);
        logConsole(`\n📌 Проверьте в Archi: Views → "Implementation & Migration Integrated — Fitness Club"`);
        
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
}