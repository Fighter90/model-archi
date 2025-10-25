/**
 * @name Generate Technology Views - Fitness Club (AS-IS & TO-BE)
 * @description Создаёт 8 Technology Layer Views (4 AS-IS + 4 TO-BE) с минимум 40 элементами каждая
 * @version 1.1
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

logConsole("=== Technology Layer Generator v1.1 (Fixed) ===");

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const ANTHROPIC_API_KEY = "";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_API_VERSION = "2023-06-01";
const API_TIMEOUT = 180000;
const MAX_TOKENS = 28000;
const MAX_RETRIES = 3;

const VIEWS_CONFIG = [
    // AS-IS Views
    { phase: "AS-IS", area: "Integrated", viewType: "Integrated" },
    { phase: "AS-IS", area: "Запись", viewType: "Area" },
    { phase: "AS-IS", area: "Хранение", viewType: "Area" },
    { phase: "AS-IS", area: "Отчётность", viewType: "Area" },
    
    // TO-BE Views
    { phase: "TO-BE", area: "Integrated", viewType: "Integrated" },
    { phase: "TO-BE", area: "Запись", viewType: "Area" },
    { phase: "TO-BE", area: "Хранение", viewType: "Area" },
    { phase: "TO-BE", area: "Отчётность", viewType: "Area" }
];

// Цвет Technology Layer по ArchiMate 3.2
const TECH_COLOR = "#C9E7B7"; // Technology Green (Archi default)

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
        
        throw new Error("No ArchiMate model found! Please open model_fitnes.archimate in Archi.");
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
            logConsole("⚠ Response truncated due to max_tokens");
        }
        
        return jsonResponse.content[0].text;
        
    } catch (e) {
        logConsole(`✗ API call failed: ${e.message}`);
        throw e;
    }
}

// ============================================================
// ПРОМПТ ДЛЯ TECHNOLOGY LAYER (ИСПРАВЛЕННЫЙ)
// ============================================================
function buildTechnologyPrompt(phase, area, viewType) {
    const isASIS = phase === "AS-IS";
    const isIntegrated = viewType === "Integrated";
    
    let contextDescription = "";
    
    if (isASIS && isIntegrated) {
        contextDescription = `
## КОНТЕКСТ AS-IS (Integrated):
Текущая IT-инфраструктура фитнес-клуба ООО "Спорт+" — фрагментированная, устаревшая, с минимальной автоматизацией.

**Ключевые характеристики:**
- Локальные серверы Windows Server 2012 на устаревшем железе
- Отсутствие облачных технологий и виртуализации
- Разрозненные системы: Excel на ПК администраторов, локальная MySQL 5.x
- Файловые хранилища на сетевом диске (NAS)
- Телефонная линия (PBX) как основной канал связи с клиентами
- Минимальная сетевая инфраструктура: коммутатор 100 Мбит/с, один роутер
- Резервное копирование на внешний USB-диск вручную раз в неделю
- Отсутствие мониторинга и логирования

**Типовые проблемы:**
- Низкая отказоустойчивость: падение сервера = остановка работы
- Нет резервирования критичных сервисов
- Отсутствие мобильного доступа для клиентов и тренеров
- Ручное управление конфигурациями и обновлениями
- Невозможность масштабирования при росте клиентской базы
`;
    } else if (isASIS) {
        contextDescription = `
## КОНТЕКСТ AS-IS (${area}):
Фрагмент инфраструктуры для области "${area}" в текущем состоянии.

**${area === "Запись" ? `
### Инфраструктура записи клиентов (AS-IS):
**Устройства:**
- ПК администратора (Desktop PC Intel Core i3, 4GB RAM, HDD 500GB)
- Стационарный телефон (Panasonic KX-TS)
- Принтер для квитанций (HP LaserJet P1102)

**Серверы и ПО:**
- Файловый сервер (Windows Server 2012, локальная сеть)
- База данных расписаний (MySQL 5.5 на том же сервере)
- Microsoft Excel 2010 (локальная установка на ПК администратора)

**Сеть:**
- Локальная сеть 100 Мбит/с (коммутатор TP-Link)
- Роутер с подключением к интернету (DSL 10 Мбит/с)

**Процессы:**
- Ручной поиск слотов в Excel-файле
- Запись данных клиента в локальную базу
- Печать квитанции на принтере
` : area === "Хранение" ? `
### Инфраструктура хранения данных (AS-IS):
**Серверы:**
- Файловый сервер (Windows Server 2012, RAID 1, 2TB)
- База данных клиентов (MySQL 5.5, отдельный сервер)
- NAS для резервных копий (Synology DS218+, 4TB)

**Устройства:**
- ПК менеджера (Desktop PC для работы с БД)
- Сканер документов (Canon CanoScan)

**ПО:**
- MySQL Workbench (для управления БД)
- Windows File Explorer (для навигации по файлам)
- WinRAR (для архивации данных)

**Сеть:**
- Локальная сеть 100 Мбит/с
- Сетевое хранилище (NAS) в той же подсети

**Процессы:**
- Ручное резервное копирование раз в неделю
- Синхронизация файлов расписаний между серверами (вручную через копирование)
- Ручная очистка устаревших данных раз в квартал
` : `
### Инфраструктура отчётности (AS-IS):
**Устройства:**
- ПК менеджера (Desktop PC Intel Core i5, 8GB RAM)
- Принтер для отчётов (HP OfficeJet Pro)

**Серверы и ПО:**
- База данных продаж (MySQL 5.5 на локальном сервере)
- Microsoft Excel 2010 (для ручного формирования отчётов)
- Файловый сервер для хранения отчётов (Windows Server 2012)

**Сеть:**
- Локальная сеть 100 Мбит/с
- Роутер для подключения к интернету (только для email)

**Процессы:**
- Ручная выгрузка данных из БД в Excel
- Формирование сводных таблиц вручную
- Печать отчётов для руководства
- Email-рассылка PDF-отчётов раз в неделю
`}
`;
    } else if (!isASIS && isIntegrated) {
        contextDescription = `
## КОНТЕКСТ TO-BE (Integrated):
Целевая архитектура — облачная, масштабируемая, высокодоступная, с автоматизацией и мониторингом.

**Ключевые изменения:**
- Переход на облачную инфраструктуру (AWS или Azure)
- Контейнеризация приложений (Docker) и оркестрация (Kubernetes)
- Микросервисная архитектура с API Gateway для интеграции
- Мобильные устройства клиентов (iOS/Android приложения)
- CDN для быстрой загрузки статического контента
- Автоматическое резервное копирование с репликацией в другой регион
- Централизованный мониторинг (Prometheus + Grafana) и логирование (ELK Stack)
- Load Balancer для распределения нагрузки
- Auto-scaling для масштабирования при пиковых нагрузках

**Технологический стек:**
- Cloud VMs: AWS EC2 или Azure Virtual Machines
- Managed Databases: AWS RDS PostgreSQL или Azure SQL Database
- Cloud Storage: AWS S3 или Azure Blob Storage
- Container Orchestration: Kubernetes (EKS/AKS)
- API Gateway: AWS API Gateway или Azure API Management
- Notification Services: AWS SNS + FCM (Firebase Cloud Messaging)
- Payment Gateway: Stripe API или YooKassa
- CDN: AWS CloudFront или Azure CDN
- Monitoring: Prometheus, Grafana, CloudWatch/Azure Monitor
`;
    } else {
        contextDescription = `
## КОНТЕКСТ TO-BE (${area}):
Целевая инфраструктура для области "${area}".

**${area === "Запись" ? `
### Инфраструктура онлайн-записи (TO-BE):
**Устройства клиентов:**
- Мобильное приложение клиента (iOS/Android)
- Web-приложение (PWA) в браузере
- QR-сканер на входе в зал (Android-терминал)

**Облачные серверы:**
- API Gateway (AWS API Gateway / Nginx на AWS EC2)
- Backend API Server (Docker-контейнеры на Kubernetes)
- Cloud Database для слотов (AWS RDS PostgreSQL)
- Redis Cache для сессий и быстрой проверки слотов

**Сервисы:**
- Push Notification Service (AWS SNS + FCM)
- SMS Service (Twilio API)
- Load Balancer (AWS ALB / Azure Load Balancer)
- CDN для статики мобильного приложения (AWS CloudFront)

**Сеть:**
- Cloud Virtual Network (AWS VPC / Azure VNet)
- Интернет (публичный доступ через HTTPS)

**Процессы:**
- Автоматическая проверка доступности слотов (API endpoint)
- Real-time синхронизация расписания между устройствами
- Автоматическая отправка уведомлений при подтверждении записи
` : area === "Хранение" ? `
### Инфраструктура облачного хранения (TO-BE):
**Облачные сервисы:**
- Cloud CRM System (Salesforce или HubSpot CRM на AWS/Azure)
- Cloud Database — реляционная (AWS RDS PostgreSQL)
- Cloud Database — NoSQL для логов (AWS DynamoDB / Azure Cosmos DB)
- Object Storage для документов (AWS S3 / Azure Blob Storage)
- Managed Backup Service (AWS Backup / Azure Backup)

**Серверы:**
- API Server для интеграции с мобильным приложением (Docker на Kubernetes)
- Sync Service для синхронизации расписаний (микросервис в контейнере)
- ETL Pipeline для миграции данных из AS-IS (AWS Glue / Azure Data Factory)

**Устройства:**
- Планшеты администраторов (iPad / Android-планшет)
- ПК менеджера (обновлённый, с доступом к Cloud CRM через браузер)

**Сеть:**
- Cloud Virtual Network с приватными подсетями
- VPN для безопасного доступа администраторов

**Процессы:**
- Автоматическое резервное копирование каждые 6 часов с репликацией
- Синхронизация данных между CRM и мобильным приложением в реальном времени
- Автоматическая архивация старых данных (старше 2 лет)
` : `
### Инфраструктура BI и аналитики (TO-BE):
**Облачные платформы:**
- BI Analytics Platform (Microsoft Power BI / Tableau на AWS)
- Data Warehouse (AWS Redshift / Azure Synapse Analytics)
- ETL Pipeline для агрегации данных (AWS Glue / Azure Data Factory)

**Серверы:**
- API для финансовых отчётов (RESTful API на Docker)
- Notification Service для менеджеров (AWS SNS + Email)
- Dashboard Hosting (Cloud VM с nginx)

**Устройства:**
- ПК менеджера (с доступом к Power BI через браузер)
- Мобильное приложение менеджера (iOS/Android) для просмотра дашбордов

**Сервисы:**
- Data Lake для хранения сырых данных (AWS S3 / Azure Data Lake)
- Analytics Service (AWS QuickSight / Azure Analysis Services)
- Scheduled Reports Service (автоматическая генерация отчётов раз в день)

**Сеть:**
- Cloud Virtual Network
- Интернет (публичный доступ через HTTPS с OAuth 2.0)

**Процессы:**
- Автоматическая агрегация данных из всех источников (CRM, платёжная система, посещаемость)
- Real-time обновление дашбордов
- Автоматическая отправка email-отчётов руководству раз в неделю
`}
`;
    }

    return `Ты — senior инфраструктурный архитектор, эксперт по ArchiMate 3.2 Technology & Physical Layer.

ЗАДАЧА: Создать ${phase} Technology Layer для фитнес-клуба ООО "Спорт+".

${contextDescription}

## ТРЕБОВАНИЯ:
✅ Минимум 40 элементов Technology Layer
✅ 70-90 связей (serving-relationship, assignment, realization, composition, access)
✅ Использовать ТОЛЬКО элементы Technology & Physical Layer:
   - **node** (физические/виртуальные серверы, VM)
   - **device** (ПК, телефоны, планшеты, принтеры, сканеры, роутеры)
   - **system-software** (ОС, СУБД, middleware, Docker, Kubernetes)
   - **technology-collaboration** (кластеры, балансировщики)
   - **technology-interface** (API endpoints, сетевые интерфейсы)
   - **path** (сетевые каналы связи)
   - **communication-network** (LAN, WAN, VPC, Internet)
   - **technology-function** (функции обработки запросов, синхронизации)
   - **technology-process** (процессы бэкапа, мониторинга, деплоя)
   - **technology-service** (хостинг, БД-сервис, CDN, уведомления)
   - **artifact** (конфигурационные файлы, Docker Images, скрипты)

## ✅ ТИПЫ СВЯЗЕЙ (СТРОГО по ArchiMate 3.2):
1. **assignment-relationship**: Device → Node (устройство размещено на узле)
2. **composition-relationship**: Node → System Software (узел содержит ПО)
3. **realization-relationship**: System Software → Technology Service (ПО реализует сервис)
4. **serving-relationship**: Technology Service → Application Component (сервис обслуживает приложение)
5. **access-relationship**: Technology Function → Artifact (функция читает конфигурацию)
6. **association-relationship**: Network → Node (сеть соединяет узлы)
7. **aggregation-relationship**: Technology Collaboration → Node (кластер включает узлы)

## СОСТАВ (минимум 40):

**Nodes (10-12):**
${isASIS ? `
- node "Сервер приложений" (Windows Server 2012)
- node "Файловый сервер" (Windows Server 2012, RAID 1)
- node "БД-сервер MySQL" (CentOS 6, MySQL 5.5)
- node "ПК администратора" (Desktop PC)
- node "ПК менеджера" (Desktop PC)
- node "Резервный сервер" (старое железо для бэкапа)
- node "Принт-сервер" (Windows Server 2008 R2)
- node "Роутер офисный" (Cisco 800 Series)
- node "Коммутатор" (TP-Link TL-SG1024)
- node "NAS для бэкапов" (Synology DS218+)
` : `
- node "AWS EC2 Instance (App Server)" (t3.medium)
- node "AWS RDS Instance (PostgreSQL 14)" (db.t3.large)
- node "Load Balancer Node" (AWS ALB)
- node "API Gateway Node" (AWS API Gateway managed)
- node "CDN Edge Node" (CloudFront PoP)
- node "Kubernetes Master Node" (EKS Control Plane)
- node "Kubernetes Worker Node 1" (t3.large)
- node "Kubernetes Worker Node 2" (t3.large)
- node "Monitoring Server" (Prometheus on EC2)
- node "Backup Server" (AWS S3 managed)
- node "Redis Cache Node" (ElastiCache)
- node "ETL Pipeline Node" (AWS Glue managed)
`}

**Devices (8-10):**
${isASIS ? `
- device "Телефон администратора" (Panasonic KX-TS)
- device "ПК администратора" (Desktop PC Intel Core i3)
- device "ПК менеджера" (Desktop PC Intel Core i5)
- device "Принтер для квитанций" (HP LaserJet P1102)
- device "Принтер для отчётов" (HP OfficeJet Pro)
- device "Сканер документов" (Canon CanoScan)
- device "Роутер офисный" (D-Link DIR-615)
- device "Коммутатор" (TP-Link TL-SG1024)
- device "NAS для резервного копирования" (Synology DS218+)
` : `
- device "Смартфон клиента (iOS/Android)"
- device "Планшет администратора (iPad)"
- device "QR-сканер на входе (Android-терминал)"
- device "ПК менеджера (обновлённый)"
- device "Смартфон тренера (iOS/Android)"
- device "Умные часы клиента" (опционально, Apple Watch)
- device "Роутер Wi-Fi (офис)" (Ubiquiti UniFi)
- device "Wi-Fi Access Point (зал)" (Ubiquiti UniFi AP)
`}

**System Software (8-10):**
${isASIS ? `
- system-software "Windows Server 2012"
- system-software "Microsoft Excel 2010"
- system-software "MySQL 5.5"
- system-software "Windows File System (NTFS)"
- system-software "Антивирус (Kaspersky Endpoint)"
- system-software "WinRAR (архиватор)"
- system-software "MySQL Workbench"
- system-software "Windows Backup Utility"
` : `
- system-software "Linux (Ubuntu Server 22.04)"
- system-software "Docker Engine 24.x"
- system-software "Kubernetes 1.28"
- system-software "PostgreSQL 14"
- system-software "Redis 7.x"
- system-software "nginx 1.24 (Web Server)"
- system-software "Prometheus (Monitoring)"
- system-software "Grafana (Visualization)"
- system-software "Node.js Runtime (для API)"
- system-software "Python 3.11 (для ETL)"
`}

**Technology Services (10-12):**
${isASIS ? `
- technology-service "Локальный файловый сервис"
- technology-service "Служба базы данных MySQL"
- technology-service "Служба печати"
- technology-service "Служба резервного копирования"
- technology-service "Телефонная служба (PBX)"
- technology-service "Служба электронной почты (локальная)"
- technology-service "Служба сетевой папки (SMB/CIFS)"
- technology-service "Служба антивируса"
- technology-service "Служба мониторинга дисков (S.M.A.R.T.)"
- technology-service "Служба обновления Windows (WSUS)"
` : `
- technology-service "Cloud Hosting Service (AWS EC2)"
- technology-service "Managed Database Service (AWS RDS)"
- technology-service "Cloud Storage Service (AWS S3)"
- technology-service "CDN Service (CloudFront)"
- technology-service "Push Notification Service (FCM + SNS)"
- technology-service "SMS Service (Twilio API)"
- technology-service "Payment Gateway Service (Stripe API)"
- technology-service "Monitoring Service (CloudWatch + Prometheus)"
- technology-service "Backup Service (AWS Backup)"
- technology-service "Load Balancing Service (AWS ALB)"
- technology-service "API Gateway Service (AWS API Gateway)"
- technology-service "Container Orchestration Service (EKS)"
`}

**Artifacts (4-6):**
${isASIS ? `
- artifact "Конфигурационные файлы (my.cnf для MySQL)"
- artifact "Скрипты резервного копирования (.bat)"
- artifact "Файлы расписаний (Excel .xlsx)"
- artifact "Логи системы (Windows Event Log)"
- artifact "Файлы конфигурации роутера (.cfg)"
` : `
- artifact "Docker Images (API Server)"
- artifact "Kubernetes Deployment YAML"
- artifact "Terraform Configuration (Infrastructure as Code)"
- artifact "Ansible Playbooks (автоматизация)"
- artifact "Скрипты миграции данных (Python)"
- artifact "Конфигурация nginx (nginx.conf)"
- artifact "Prometheus Configuration (prometheus.yml)"
`}

**Networks (3-4):**
${isASIS ? `
- communication-network "Локальная сеть (LAN 100 Мбит/с)"
- communication-network "Интернет (внешняя связь, DSL 10 Мбит/с)"
- communication-network "Телефонная сеть (PSTN)"
` : `
- communication-network "Cloud Virtual Network (AWS VPC)"
- communication-network "CDN Network (CloudFront)"
- communication-network "Интернет (публичный доступ, HTTPS)"
- communication-network "Private Subnet (для БД и бэкенда)"
`}

**Technology Functions (4-6):**
${isASIS ? `
- technology-function "Обработка запросов (ручной поиск в Excel)"
- technology-function "Синхронизация файлов (ручное копирование)"
- technology-function "Проверка доступности базы данных"
- technology-function "Печать документов"
` : `
- technology-function "Request Processing (API Gateway)"
- technology-function "Data Sync (real-time синхронизация)"
- technology-function "Health Check (мониторинг состояния сервисов)"
- technology-function "Log Aggregation (сбор логов)"
- technology-function "Auto-scaling (автоматическое масштабирование)"
- technology-function "Load Distribution (распределение нагрузки)"
`}

**Technology Processes (3-5):**
${isASIS ? `
- technology-process "Резервное копирование (вручную раз в неделю)"
- technology-process "Обновление системы (вручную раз в месяц)"
- technology-process "Проверка дисков (раз в квартал)"
` : `
- technology-process "Automated Backup Process (каждые 6 часов)"
- technology-process "CI/CD Pipeline (автоматический деплой)"
- technology-process "Infrastructure Monitoring (24/7)"
- technology-process "Auto-scaling Process (динамическое масштабирование)"
- technology-process "Security Patching Process (автоматические обновления)"
`}

## ФОРМАТ ОТВЕТА: JSON в тегах <technology_model>...</technology_model>

{
  "description": "Technology Layer ${phase} для области ${area}",
  "nodes": [
    {"id": "n1", "type": "node", "name": "Сервер приложений", "description": "Windows Server 2012", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "d1", "type": "device", "name": "ПК администратора", "description": "Desktop PC", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "sw1", "type": "system-software", "name": "Windows Server", "description": "", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "ts1", "type": "technology-service", "name": "Служба базы данных", "description": "", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "net1", "type": "communication-network", "name": "Локальная сеть", "description": "LAN", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "art1", "type": "artifact", "name": "Конфигурация MySQL", "description": "my.cnf", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "fn1", "type": "technology-function", "name": "Обработка запросов", "description": "", "properties": {"Phase": "${phase}", "Area": "${area}"}},
    {"id": "proc1", "type": "technology-process", "name": "Резервное копирование", "description": "Раз в неделю", "properties": {"Phase": "${phase}", "Area": "${area}"}}
  ],
  "relationships": [
    {"source": "d1", "target": "n1", "type": "assignment-relationship", "name": "Подключается"},
    {"source": "n1", "target": "sw1", "type": "composition-relationship", "name": "Содержит"},
    {"source": "sw1", "target": "ts1", "type": "realization-relationship", "name": "Реализует"},
    {"source": "ts1", "target": "fn1", "type": "serving-relationship", "name": "Обслуживает"},
    {"source": "fn1", "target": "art1", "type": "access-relationship", "name": "Читает"},
    {"source": "net1", "target": "n1", "type": "association-relationship", "name": "Соединяет"},
    {"source": "proc1", "target": "n1", "type": "association-relationship", "name": "Выполняется на"}
  ]
}

⚠️ ВАЖНО:
1. РОВНО 40-45 элементов (не меньше 40!)
2. 70-90 связей (используй ПРАВИЛЬНЫЕ типы: assignment, composition, realization, serving, access)
3. ВСЕ элементы должны быть связаны (нет изолированных узлов)
4. Используй короткие id (n1, d1, sw1, ts1, net1, art1, fn1, proc1)
5. Для каждого элемента property "Phase" и "Area"
6. Описания 2-5 слов (для экономии токенов)
7. НЕ используй serving-relationship для Device → Node (это ОШИБКА, используй assignment-relationship)

ВЕРНИ ТОЛЬКО JSON в тегах <technology_model>...</technology_model> БЕЗ ЛИШНЕГО ТЕКСТА`;
}

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
        const extracted = cleanContent.substring(firstBrace, lastBrace + 1);
        
        if (!extracted.endsWith('}')) {
            logConsole("⚠ JSON truncated, attempting to fix...");
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
    
    logConsole("✗ No JSON found in response");
    return null;
}

// ============================================================
// ГЕНЕРАЦИЯ С RETRY
// ============================================================
function generateWithRetry(phase, area, viewType) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        logConsole(`\n>>> Attempt ${attempt}/${MAX_RETRIES}: ${phase} ${area}`);
        
        try {
            const prompt = buildTechnologyPrompt(phase, area, viewType);
            
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
            
            if (!jsonObject.nodes || !jsonObject.relationships) {
                throw new Error("Missing nodes or relationships in JSON");
            }
            
            const typeCounts = countByType(jsonObject.nodes);
            const totalNodes = jsonObject.nodes.length;
            
            logConsole(`✓ Parsed: ${totalNodes} nodes, ${jsonObject.relationships.length} relationships`);
            logConsole(`  Types: ${JSON.stringify(typeCounts)}`);
            
            if (totalNodes < 40) {
                logConsole(`⚠ Only ${totalNodes}/40 nodes, retrying...`);
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
// СОЗДАНИЕ ЭЛЕМЕНТОВ
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
        'composition-relationship',
        'aggregation-relationship',
        'access-relationship',
        'triggering-relationship',
        'flow-relationship',
        'specialization-relationship'
    ];
    
    const type = validTypes.includes(relType) ? relType : 'association-relationship';
    
    try {
        return targetModel.createRelationship(type, name || '', source, target);
    } catch (e) {
        logConsole(`⚠ Failed to create ${relType}, using association: ${e.message}`);
        return targetModel.createRelationship('association-relationship', name || '', source, target);
    }
}

// ============================================================
// СОЗДАНИЕ VIEW С ГРУППИРОВКОЙ ПО ТИПАМ
// ============================================================
function createTechnologyView(targetModel, phase, area, modelJson) {
    const viewName = `Technology Layer — ${phase} — ${area}`;
    const view = targetModel.createArchimateView(viewName);
    
    const typeCounts = countByType(modelJson.nodes);
    
    view.documentation = `🖥️ Technology & Physical Layer: ${phase} ${area}\n\n` +
                        `${modelJson.description || ''}\n\n` +
                        `Элементов: ${modelJson.nodes.length}, Связей: ${modelJson.relationships.length}\n\n` +
                        `Статистика:\n${JSON.stringify(typeCounts, null, 2)}\n\n` +
                        `ArchiMate 3.2, Technology Layer\n` +
                        `Цветовая кодировка: #C9E7B7 (Technology Green)`;
    
    view.prop("viewpoint", "technology");
    view.prop("Phase", phase);
    view.prop("Area", area);
    
    const elementMap = {};
    const visualMap = {};
    
    // Группировка по типам
    const nodesByType = {
        'node': [],
        'device': [],
        'system-software': [],
        'technology-service': [],
        'artifact': [],
        'communication-network': [],
        'technology-function': [],
        'technology-process': [],
        'technology-collaboration': [],
        'technology-interface': [],
        'path': []
    };
    
    for (let i = 0; i < modelJson.nodes.length; i++) {
        const node = modelJson.nodes[i];
        const type = node.type;
        if (nodesByType[type]) {
            nodesByType[type].push(node);
        } else {
            // Неизвестный тип — добавляем в отдельную группу
            if (!nodesByType['other']) nodesByType['other'] = [];
            nodesByType['other'].push(node);
        }
    }
    
    // Размещение по типам
    let xOffset = 50;
    let yOffset = 50;
    const columnWidth = 220;
    const rowHeight = 100;
    const itemsPerRow = 4;
    
    const typeOrder = ['node', 'device', 'system-software', 'technology-service', 
                      'artifact', 'communication-network', 'technology-function', 
                      'technology-process', 'technology-collaboration', 'technology-interface', 
                      'path', 'other'];
    
    for (let typeIdx = 0; typeIdx < typeOrder.length; typeIdx++) {
        const type = typeOrder[typeIdx];
        const nodes = nodesByType[type];
        
        if (!nodes || nodes.length === 0) continue;
        
        logConsole(`  Placing ${nodes.length} elements of type: ${type}`);
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            try {
                const element = createElement(targetModel, node);
                elementMap[node.id] = element;
                
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                
                const x = xOffset + col * columnWidth;
                const y = yOffset + row * rowHeight;
                
                const visualObj = view.add(element, x, y, 200, 80);
                visualMap[node.id] = visualObj;
                
                // Применяем единый цвет Technology Layer
                visualObj.fillColor = TECH_COLOR;
                
            } catch (e) {
                logConsole(`✗ Failed to create element ${node.id}: ${e.message}`);
            }
        }
        
        // Отступ между типами
        const rowsUsed = Math.ceil(nodes.length / itemsPerRow);
        yOffset += rowsUsed * rowHeight + 50;
    }
    
    logConsole(`✓ Created ${Object.keys(elementMap).length}/${modelJson.nodes.length} elements`);
    
    // Создание связей
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
            } else {
                logConsole(`⚠ Missing elements for relationship ${i + 1}: ${rel.source} → ${rel.target}`);
            }
        } catch (e) {
            logConsole(`✗ Relationship ${i + 1} failed: ${e.message}`);
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
        logConsole('=== Technology Layer Generator v1.1 ===');
        logConsole('========================================');
        
        const targetModel = getTargetModel();
        
        const results = [];
        
        for (let i = 0; i < VIEWS_CONFIG.length; i++) {
            const config = VIEWS_CONFIG[i];
            logConsole(`\n=== View ${i + 1}/${VIEWS_CONFIG.length}: ${config.phase} ${config.area} ===`);
            
            try {
                const modelJson = generateWithRetry(config.phase, config.area, config.viewType);
                
                if (!modelJson || !modelJson.nodes || !modelJson.relationships) {
                    throw new Error("Invalid JSON structure");
                }
                
                createTechnologyView(targetModel, config.phase, config.area, modelJson);
                
                results.push({
                    phase: config.phase,
                    area: config.area,
                    elements: modelJson.nodes.length,
                    relationships: modelJson.relationships.length,
                    success: true
                });
                
                logConsole(`✓ ${config.phase} ${config.area}: OK`);
                
            } catch (error) {
                logConsole(`✗ ${config.phase} ${config.area}: FAILED - ${error.message}`);
                results.push({
                    phase: config.phase,
                    area: config.area,
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
        logConsole(`  Успешно создано: ${successCount}/${results.length} views`);
        logConsole(`  Всего элементов: ${totalElements}`);
        logConsole(`  Всего связей: ${totalRels}`);
        
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            if (r.success) {
                logConsole(`  ${i + 1}. ${r.phase} ${r.area}: ✓ ${r.elements} элементов, ${r.relationships} связей`);
            } else {
                logConsole(`  ${i + 1}. ${r.phase} ${r.area}: ✗ ${r.error}`);
            }
        }
        
        if (successCount === results.length) {
            logConsole(`\n✅ ВСЕ Technology Views успешно созданы!`);
            logConsole(`\n📌 Проверьте в Archi: Views → Technology Layer`);
            logConsole(`\n🎨 Цветовая кодировка: #C9E7B7 (Technology Green)`);
            logConsole(`\n⚙️ Следующий шаг: Tools → Validate Model для проверки корректности`);
        } else {
            logConsole(`\n⚠️ Создано ${successCount}/${results.length} views`);
            logConsole(`   Проверьте ошибки выше и повторите запуск для неудачных views`);
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