# TAC Landing Page - Documentacion Completa

## 1. Resumen del Proyecto

**The Americas Conference (TAC)** es una plataforma de landing pages para una organizacion hemisferica con tres sub-marcas:
- **ACU** (The Americas Conference of Universities) - Plataforma educativa
- **ACM** (The Americas Conference of Mayors) - Plataforma de gobernanza
- **ACC** (The Americas Chambers of Commerce) - Plataforma de comercio

El proyecto es un **monorepositorio** que combina un **Backend Headless WordPress** con un **Frontend SSR Astro**.

---

## 2. Tech Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend CMS** | WordPress (Roots Bedrock) + PHP 8.3+ |
| **Frontend Framework** | Astro 7.0 (SSR mode) |
| **UI Interactivo** | React 19 + AlpineJS |
| **Base de Datos** | MariaDB 10.11 |
| **ORM** | Drizzle ORM (MySQL) |
| **Estilos** | Tailwind CSS v4 + shadcn/ui |
| **State Management** | Zustand (chatbot) |
| **AI/LLM** | Groq SDK (llama-3.3-70b-versatile) |
| **Embeddings** | Google Gemini (gemini-embedding-001) |
| **Maps** | Leaflet.js (OpenStreetMap) |
| **Infraestructura** | Docker Compose |
| **i18n** | 3 idiomas: ES (default), EN, PT |

---

## 3. Quick Start

### 3.1 Prerequisitos
- Docker y Docker Compose
- Node.js >= 22.12.0 (para desarrollo local del frontend)
- pnpm

### 3.2 Instalacion con Docker
```bash
# Levantar todo el entorno
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

### 3.3 Desarrollo Frontend (sin Docker)
```bash
cd landing-page/frontend
pnpm install
pnpm dev          # http://localhost:4321
```

### 3.4 Desarrollo Backend (WordPress)
```bash
# Acceder al contenedor PHP
docker compose exec -u lomi wordpress-php bash

# Dentro del contenedor
composer install
composer lint:fix
composer test
```

### 3.5 Comandos Utiles

| Comando | Descripcion |
|---------|-------------|
| `docker compose up -d` | Levantar entorno |
| `docker compose down` | Detener entorno |
| `docker compose logs -f` | Ver logs |
| `pnpm dev` | Servidor desarrollo Astro |
| `pnpm build` | Build produccion |
| `pnpm preview` | Preview produccion |
| `pnpm db:generate` | Generar esquemas Drizzle |
| `pnpm db:migrate` | Ejecutar migraciones |
| `composer lint` | Verificar estilo PHP |
| `composer lint:fix` | Corregir estilo PHP |
| `composer test` | Ejecutar tests PHP |

---

## 4. Arquitectura

### 4.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Infrastructure                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  MariaDB     │  │  WordPress   │  │  Astro Frontend  │  │
│  │  (port 3306) │←─│  PHP-FPM     │←─│  (port 4321)     │  │
│  │              │  │  + Nginx     │  │  SSR + React     │  │
│  │              │  │  (port 8000) │  │  + AlpineJS      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         ↑                ↑                    ↑              │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                   tac_web network                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Datos

1. **WordPress** gestiona contenido (paginas, eventos, programas) con ACF
2. Plugin personalizado `tac-structure` registra post types, taxonomias, campos ACF y endpoints REST
3. **Astro Frontend** consume la API REST de WordPress
4. Contenido validado con Zod, traducido con IA, cacheado en BD, renderizado con layouts por marca

### 4.3 Patron Arquitectonico: Clean Architecture / Hexagonal

```
src/core/
├── interfaces/      # Puertos (contratos abstractos)
├── providers/       # Adaptadores externos (APIs de IA)
├── repositories/    # Adaptadores internos (BD)
├── services/        # Logica de negocio
├── entities/        # Objetos de dominio
└── factories/       # Composicion de dependencias
```

---

## 5. Estructura de Directorios

### 5.1 Raiz del Proyecto

```
landing-page/
├── .env                    # Variables de entorno
├── CLAUDE.md               # Guia para agentes IA
├── GEMINI.md               # Guia para agentes IA
├── compose.yaml            # Configuracion Docker
├── docker/
│   ├── frontend/
│   │   └── Dockerfile      # Imagen Astro
│   └── wordpress/
│       ├── Dockerfile      # Imagen PHP-FPM
│       └── nginx.conf      # Configuracion Nginx
├── frontend/               # Astro Frontend
└── wordpress/              # WordPress Backend (Bedrock)
```

### 5.2 Frontend (Astro)

```
frontend/
├── astro.config.mjs        # Configuracion Astro
├── drizzle.config.ts       # Configuracion Drizzle ORM
├── package.json            # Dependencias Node.js
├── tsconfig.json           # Configuracion TypeScript
├── public/                 # Archivos estaticos
└── src/
    ├── assets/             # Imagenes y SVGs
    ├── components/         # Componentes React/Astro
    │   ├── ac/             # Componentes generales TAC
    │   ├── acc/            # Componentes Chambers of Commerce
    │   ├── acm/            # Componentes Mayors
    │   ├── acu/            # Componentes Universities
    │   ├── app/            # Componentes de la app principal
    │   └── ui/             # Primitivas UI (shadcn)
    ├── consts/             # Constantes
    ├── core/               # Clean Architecture
    │   ├── chatbot/        # Sistema RAG chatbot
    │   ├── shared/         # Adaptadores HTTP, excepciones
    │   └── translations/   # Sistema de traducciones
    ├── db/                 # Drizzle ORM (esquemas + conexion)
    ├── i18n/               # Internacionalizacion estatica
    ├── layouts/            # Layouts especializados
    │   ├── Layout.astro    # Layout base
    │   ├── app/            # Layout principal
    │   ├── acc/            # Layout Chambers of Commerce
    │   ├── acm/            # Layout Mayors
    │   └── acu/            # Layout Universities
    ├── lib/                # Utilidades compartidas
    ├── pages/              # Rutas Astro
    ├── schemas/            # Esquemas Zod
    ├── scripts/            # Scripts AlpineJS
    ├── stores/             # Zustand stores
    ├── styles/             # Estilos globales
    ├── types/              # Tipos TypeScript
    └── utils/              # Funciones utilitarias
```

### 5.3 WordPress (Bedrock)

```
wordpress/
├── composer.json           # Dependencias PHP
├── config/
│   ├── application.php     # Configuracion principal
│   └── environments/
│       ├── development.php # Entorno dev
│       └── staging.php     # Entorno staging
├── tests/                  # Tests Pest PHP
└── web/
    ├── app/
    │   ├── mu-plugins/     # Plugins obligatorios
    │   ├── plugins/        # Plugins instalados
    │   │   ├── advanced-custom-fields/
    │   │   ├── acf-openstreetmap-field/
    │   │   ├── disable-gutenberg/
    │   │   ├── headless-mode/
    │   │   ├── wp-rest-api-controller/
    │   │   └── tac-structure/    # Plugin personalizado
    │   └── themes/
    └── wp/                 # Core de WordPress
```

---

## 6. Modulos Principales

### 6.1 Pages (Paginas Estaticas)

**Proposito**: Paginas estaticas con secciones dinamicas desde WordPress.

**Endpoints REST**: `/wp-json/wp/v2/pages`

**Esquema Zod** (`src/schemas/pages.ts`):

```typescript
PageSchema = {
  id: number,
  slug: string,
  title: { rendered: string },
  content: { rendered: string },
  acf: {
    hero: { subtitle: string, description: string },
    content: { title: string, subtitle: string, phrase: string },
    cta: { title: string, description: string, redirect_text: string, redirect_url: string, image: FeaturedImages }
  },
  featured_images: FeaturedImages,
  sections: PageSection[]
}

PageSection = {
  id: number,
  title: string,
  content: string,
  images: FeaturedImages,
  acf: { subtitle: string },
  cards: SectionCard[]
}

SectionCard = { title: string, content: string, icon: string }
```

**Rutas**:
| Ruta | Entity ID | Layout |
|------|-----------|--------|
| `/[lang]/` | 140 | AppLayout |
| `/[lang]/about` | 146 | ExtrasLayout |
| `/[lang]/contact` | 162 | ExtrasLayout |
| `/[lang]/acu/` | 132 | UniversityLayout |
| `/[lang]/acm/` | 128 | MayorsLayout |
| `/[lang]/acc/` | 136 | CommerceLayout |

**Componentes**:
- `Hero.astro` - Hero principal de la pagina
- `MainContent.astro` - Contenido principal
- `CTASection.astro` - Seccion de llamada a la accion
- `SectionHeading.astro` - Encabezado de seccion
- `SectionSubHeading.astro` - Subencabezado de seccion

---

### 6.2 Events (Eventos)

**Proposito**: Gestion de conferencias y eventos con ponentes, ubicaciones y highlights.

**Endpoints REST**: `/wp-json/wp/v2/event`

**Esquema Zod** (`src/schemas/events.ts`):

```typescript
EventSchema = {
  id: number,
  slug: string,
  title: { rendered: string },
  content: { rendered: string },
  featured_images: FeaturedImages,
  acf: {
    cta: CtaSchema,
    subtitle: string,
    description: string,
    start_date: string,
    end_date: string,
    is_featured: boolean,
    location: LocationSchema
  },
  speakers: Speaker[],
  highlights: Highlight[],
  enterprise_details: Enterprise[]
}

Speaker = {
  name: string,
  position: string,
  organization: string,
  linkedin: string,
  photo: FeaturedImages
}

Highlight = { title: string, description: string, icon: string }
Enterprise = { id: number, name: string, slug: string }

LocationSchema = {
  lat: number,
  lng: number,
  zoom: number,
  address: string,
  markers: Marker[]
}
```

**Rutas**:
| Ruta | Descripcion |
|------|-------------|
| `/[lang]/acu/events` | Lista eventos ACU |
| `/[lang]/acm/events` | Lista eventos ACM |
| `/[lang]/acc/events` | Lista eventos ACC |
| `/[lang]/events/[slug]` | Detalle evento individual |

**Componentes**:
- `EventItem.astro` - Tarjeta de evento
- `ListEventsSection.astro` - Seccion de lista
- `ListEventsContainer.astro` - Contenedor de lista
- `SpeakerItem.astro` - Tarjeta de ponente
- `LocationMap.astro` - Mapa Leaflet

---

### 6.3 Programs (Programas)

**Proposito**: Gestion de programas educativos/formacion con beneficios y modalidades.

**Endpoints REST**: `/wp-json/wp/v2/program`

**Esquema Zod** (`src/schemas/programs.ts`):

```typescript
ProgramSchema = {
  id: number,
  slug: string,
  title: { rendered: string },
  content: { rendered: string },
  acf: {
    cta: CtaSchema,
    subtitle: string,
    description: string,
    target_audience: string,
    duration: string,
    is_featured: boolean,
    modality: "hybrid" | "in_person" | "virtual",
    location: LocationSchema
  },
  featured_images: FeaturedImages,
  benefits: Benefit[],
  highlights: Highlight[],
  enterprise_details: Enterprise[]
}

Benefit = { title: string, description: string, icon: string }
```

**Rutas**:
| Ruta | Descripcion |
|------|-------------|
| `/[lang]/acu/programs` | Lista programas ACU |
| `/[lang]/acm/programs` | Lista programas ACM |
| `/[lang]/acc/programs` | Lista programas ACC |
| `/[lang]/programs/[slug]` | Detalle programa individual |

**Componentes**:
- `ProgramItem.astro` - Tarjeta de programa
- `BenefitItem.astro` - Tarjeta de beneficio
- `ListProgramsSection.astro` - Seccion de lista
- `ListProgramsContainer.astro` - Contenedor de lista

---

### 6.4 Contact (Contacto)

**Proposito**: Pagina de contacto con informacion por sub-marca.

**Esquema Zod** (`src/schemas/pages.ts`):

```typescript
ContactPageSchema = PageSchema.extend({
  acf: ACFSchema.extend({
    contact: {
      title: string,
      subtitle: string,
      acm: ContactItem,
      acc: ContactItem,
      acu: ContactItem
    }
  })
})

ContactItem = {
  title: string,
  content: string,
  address: string,
  number_phone: string,
  email: string,
  schedule: string
}
```

**Ruta**: `/[lang]/contact`

---

### 6.5 Translations (Sistema de Traducciones)

**Proposito**: Traduccion automatica de contenido dinamico usando IA (Groq LLM).

**Tabla BD**: `wp_translations`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | VARCHAR(36) | UUID primario |
| namespace | VARCHAR(100) | Tipo de entidad (pages, events, programs) |
| key | VARCHAR(255) | ID de la entidad WordPress |
| locale | VARCHAR(10) | Idioma destino (en, pt) |
| originalText | JSON | Texto original traducible |
| translatedText | JSON | Texto traducido |
| provider | VARCHAR(50) | Proveedor IA (groq, gemini) |
| hash | CHAR(64) | SHA-256 del texto original |

**Flujo de Traduccion**:

```
1. Fetch contenido de WordPress REST API
2. Validar con Zod schemas
3. Extraer campos traducibles
4. Buscar cache en wp_translations (por hash)
5. Si stale/falta → traducir via Groq API (JSON mode)
6. Guardar traduccion en BD
7. Aplicar traduccion a la entidad
8. (Decorador) Generar embeddings para chatbot RAG
```

**Interfaces**:
- `TranslationProvider` - Interfaz para proveedores de traduccion
- `TranslationRepository` - Interfaz para repositorio de traducciones

**Implementaciones**:
- `TranslationProviderImpl` - Usa Groq SDK para traducir
- `TranslationRepositoryImpl` - Accede a tabla wp_translations

**Servicios**:
- `ApiPageService` - Traduce paginas
- `ApiEventService` - Traduce eventos
- `ApiProgramService` - Traduce programas
- `ApiContactPageService` - Traduce pagina de contacto
- `ListAllEventsService` - Lista todos los eventos traducidos
- `ListAllProgramsService` - Lista todos los programas traducidos

---

### 6.6 Chatbot (RAG - Retrieval Augmented Generation)

**Proposito**: Chatbot AI que responde preguntas sobre el contenido de la plataforma usando embeddings y RAG.

**Tabla BD**: `chatbot_embeddings`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | VARCHAR(36) | UUID primario |
| namespace | VARCHAR(100) | Tipo de contenido |
| key | VARCHAR(255) | ID de la entidad |
| locale | VARCHAR(10) | Idioma |
| content | TEXT | Texto en markdown |
| embedding | JSON | Vector de embeddings |
| contentHash | CHAR(64) | Hash del contenido |
| dimensions | INT | Dimensiones del vector |

**Arquitectura RAG**:

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Usuario    │────>│  Embedding Index │────>│  Context Repo   │
│  (Query)    │     │  Service         │     │  (similarity)   │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       v
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Respuesta  │<────│  Chat Provider   │<────│  Chat Context   │
│  (Stream)   │     │  (Groq LLM)      │     │  Service        │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

**Interfaces**:
- `ChatProvider` - Interfaz para proveedores de chat
- `ContextRepository` - Interfaz para repositorio de contexto
- `EmbeddingProvider` - Interfaz para generacion de embeddings
- `EmbeddingRepository` - Interfaz para repositorio de embeddings

**Implementaciones**:
- `ChatProviderImpl` - Usa Groq SDK (llama-3.3-70b-versatile)
- `EmbeddingProviderImpl` - Usa Google Gemini (gemini-embedding-001)
- `ContextRepositoryImpl` - Busca contextos por similitud coseno
- `EmbeddingRepositoryImpl` - Almacena/recupera embeddings
- `EmbeddingSyncTranslationRepository` - Decorador que sincroniza embeddings al guardar traducciones

**Servicios**:
- `EmbeddingIndexService` - Indexa contenido (extrae markdown, genera embeddings)
- `ChatContextService` - Recupera contexto relevante para una query

**API Endpoint**: `/api/chat` (streaming via ReadableStream)

**Frontend**:
- `Chatbot.tsx` - Componente principal
- `ChatbotBubble.tsx` - Burbuja de chat
- `ChatContent.tsx` - Contenido del chat
- `ChatbotInput.tsx` - Input del usuario
- `MessageItem.tsx` - Item de mensaje
- `stores/chat.ts` - Zustand store para estado

---

## 7. Schema de Base de Datos

### 7.1 wp_translations

```sql
CREATE TABLE wp_translations (
  id VARCHAR(36) PRIMARY KEY,
  namespace VARCHAR(100) NOT NULL,
  `key` VARCHAR(255) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  original_text JSON NOT NULL,
  translated_text JSON NOT NULL,
  provider VARCHAR(50) DEFAULT 'gemini' NOT NULL,
  hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY wp_translations_unique_idx (namespace, `key`, locale)
);
```

### 7.2 chatbot_embeddings

```sql
CREATE TABLE chatbot_embeddings (
  id VARCHAR(36) PRIMARY KEY,
  namespace VARCHAR(100) NOT NULL,
  `key` VARCHAR(255) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  embedding JSON NOT NULL,
  content_hash CHAR(64) NOT NULL,
  dimensions INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY chatbot_embeddings_unique_idx (namespace, `key`, locale)
);
```

---

## 8. Referencia de API Services

### 8.1 ApiPageService

```typescript
class ApiPageService {
  constructor({ http, repository, translation, context, entityId, locale })
  
  async getCommonPage(): Promise<Response | null>
  // Fetch pagina de WordPress, valida con Zod, retorna null o redirect
  
  async getTranslatePage(): Promise<PageType>
  // Traduce pagina si no es locale default
}
```

### 8.2 ApiEventService

```typescript
class ApiEventService {
  constructor({ http, repository, translation, context, slug, locale })
  
  async getCommonEvent(): Promise<Response | null>
  async getTranslateEvent(): Promise<EventType>
}
```

### 8.3 ApiProgramService

```typescript
class ApiProgramService {
  constructor({ http, repository, translation, context, slug, locale })
  
  async getCommonProgram(): Promise<Response | null>
  async getTranslateProgram(): Promise<ProgramType>
}
```

### 8.4 ListAllEventsService

```typescript
class ListAllEventsService {
  constructor({ http, repository, translation, context, locale })
  
  async getCommonEvents(): Promise<Response | null>
  async getTranslatedEvents(): Promise<EventType[]>
}
```

### 8.5 ListAllProgramsService

```typescript
class ListAllProgramsService {
  constructor({ http, repository, translation, context, locale })
  
  async getCommonPrograms(): Promise<Response | null>
  async getTranslatedPrograms(): Promise<ProgramType[]>
}
```

### 8.6 ApiContactPageService

```typescript
class ApiContactPageService {
  constructor({ http, repository, translation, context, entityId, locale })
  
  async getCommonPage(): Promise<Response | null>
  async getTranslatePage(): Promise<ContactPage>
}
```

---

## 9. Referencia de Componentes

### 9.1 Componentes App (Principal)

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `Hero.astro` | Astro | Hero principal con titulo y descripcion |
| `MainHeader.astro` | Astro | Encabezado principal |
| `MainFooter.astro` | Astro | Pie de pagina principal |
| `MainContent.astro` | Astro | Contenido principal |
| `MainMobileNav.astro` | Astro | Navegacion mobile |
| `NavLink.astro` | Astro | Enlace de navegacion |
| `MobileNavLink.astro` | Astro | Enlace mobile |
| `FooterNavLink.astro` | Astro | Enlace de footer |
| `SectionHeading.astro` | Astro | Encabezado de seccion |
| `SectionSubHeading.astro` | Astro | Subencabezado de seccion |
| `ThemeToggleButton.astro` | Astro | Toggle tema claro/oscuro |
| `GetDefaultTheme.astro` | Astro | Tema por defecto |
| `HeroIcon.astro` | Astro | Icono del hero |
| `Loader.tsx` | React | Indicador de carga |

### 9.2 Componentes Home

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `ProgramsSection.astro` | Astro | Seccion de programas |
| `ProgramCard.astro` | Astro | Tarjeta de programa |
| `ConferencesSection.astro` | Astro | Seccion de conferencias |
| `ConferenceCard.astro` | Astro | Tarjeta de conferencia |
| `OurImpactSection.astro` | Astro | Seccion de impacto |
| `OurImpactCard.astro` | Astro | Tarjeta de impacto |
| `RestBreakSection.astro` | Astro | Seccion de descanso |

### 9.3 Componentes Events

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `ListEventsSection.astro` | Astro | Seccion de lista de eventos |
| `ListEventsContainer.astro` | Astro | Contenedor de eventos |
| `EventItem.astro` | Astro | Tarjeta de evento |
| `SpeakerItem.astro` | Astro | Tarjeta de ponente |

### 9.4 Componentes Programs

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `ListProgramsSection.astro` | Astro | Seccion de lista de programas |
| `ListProgramsContainer.astro` | Astro | Contenedor de programas |
| `ProgramItem.astro` | Astro | Tarjeta de programa |
| `BenefitItem.astro` | Astro | Tarjeta de beneficio |

### 9.5 Componentes About

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `CommitmentsSection.astro` | Astro | Seccion de compromisos |
| `CommitmentCard.astro` | Astro | Tarjeta de compromiso |
| `MissionAndVisionSection.astro` | Astro | Seccion de mision/vision |
| `MissionAndVisionCard.astro` | Astro | Tarjeta de mision/vision |
| `WhatWeDoSection.astro` | Astro | Seccion de que hacemos |
| `WhatWeDoCard.astro` | Astro | Tarjeta de que hacemos |

### 9.6 Componentes Extras

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `CTASection.astro` | Astro | Seccion de llamada a la accion |
| `ExtrasHero.astro` | Astro | Hero de paginas extras |
| `HighlightItem.astro` | Astro | Item de highlight |

### 9.7 Componentes Chatbot (React)

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `Chatbot.tsx` | React | Componente principal del chatbot |
| `ChatbotBubble.tsx` | React | Burbuja flotante del chat |
| `ChatContent.tsx` | React | Contenido del chat |
| `ChatbotInput.tsx` | React | Input del usuario |
| `MessageItem.tsx` | React | Item de mensaje |

### 9.8 Componentes Leaflet

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `LocationMap.astro` | Astro | Mapa con Leaflet.js |

### 9.9 Componentes UI (shadcn)

| Componente | Tipo | Descripcion |
|-----------|------|-------------|
| `button.tsx` | React | Boton reutilizable |

### 9.10 Componentes por Sub-Marca

**AC (General)**:
- `Header.astro` - Encabezado general
- `Footer.astro` - Pie general

**ACC (Chambers of Commerce)**:
- `Header.astro` - Encabezado ACC
- `Footer.astro` - Pie ACC

**ACM (Mayors)**:
- `Header.astro` - Encabezado ACM
- `Footer.astro` - Pie ACM

**ACU (Universities)**:
- `Header.astro` - Encabezado ACU
- `Footer.astro` - Pie ACU

---

## 10. Referencia de Schemas Zod

### 10.1 Schema Base (`src/schemas/index.ts`)

```typescript
FeaturedImageSizesSchema = "thumbnail" | "medium" | "medium_large" | "large" | "full"

FeaturedImageAttSchema = { url: string, width: number, height: number }

FeaturedImagesSchema = PartialRecord<FeaturedImageSizes, FeaturedImageAtt> | null

DefaultWordpressSchema = { id: number, slug: string, title: { rendered: string }, content: { rendered: string } }

CtaSchema = { title: string, description: string, redirect_text: string, redirect_url: string, image: FeaturedImages }

EnterpriseSchema = { id: number, name: string, slug: string }

LocationSchema = { lat: number, lng: number, zoom: number, address: string, markers: Marker[] }

MarkerSchema = { label: string, default_label: string, lat: number, lng: number }

HighlightSchema = { title: string, description: string, icon: string }
```

### 10.2 Schema Pages (`src/schemas/pages.ts`)

```typescript
HeroSchema = { subtitle: string, description: string }
ContentSchema = { title: string, subtitle: string, phrase: string }
SectionCardSchema = { title: string, content: string, icon: string }
PageSectionSchema = { id: number, title: string, content: string, images: FeaturedImages, acf: { subtitle: string }, cards: SectionCard[] }
PageSchema = DefaultWordpressSchema + { acf: { hero, content, cta }, featured_images, sections: PageSection[] }
ContactPageSchema = PageSchema + { acf: { contact: { title, subtitle, acm, acc, acu } } }
```

### 10.3 Schema Events (`src/schemas/events.ts`)

```typescript
SpeakerSchema = { name: string, position: string, organization: string, linkedin: string, photo: FeaturedImages }
EventSchema = DefaultWordpressSchema + { featured_images, acf: { cta, subtitle, description, start_date, end_date, is_featured, location }, speakers: Speaker[], highlights: Highlight[], enterprise_details: Enterprise[] }
```

### 10.4 Schema Programs (`src/schemas/programs.ts`)

```typescript
ProgramModalities = "hybrid" | "in_person" | "virtual"
BenefitSchema = { title: string, description: string, icon: string }
ProgramSchema = DefaultWordpressSchema + { acf: { cta, subtitle, description, target_audience, duration, is_featured, modality, location }, featured_images, benefits: Benefit[], highlights: Highlight[], enterprise_details: Enterprise[] }
```

---

## 11. Sistema i18n

### 11.1 Idiomas Soportados

| Codigo | Idioma | Default |
|--------|--------|---------|
| `es` | Espanol | Si |
| `en` | Ingles | No |
| `pt` | Portugues | No |

### 11.2 Dos Sistemas de i18n

**1. Strings Estaticos** (UI):
- Archivos: `src/i18n/locales/{es,en,pt}.json`
- Uso: `useTranslations()` para navegacion, paginas de error, labels del chatbot

**2. Contenido Dinamico** (WordPress):
- Sistema de traduccion automatica via Groq LLM
- Cache en tabla `wp_translations`
- Embeddings para chatbot RAG

### 11.3 Routing i18n

- Todas las rutas estan prefijadas con `/[lang]/`
- Middleware detecta locale de cookie → Accept-Language → default `es`
- Redirige a `/{locale}/...` si falta el prefijo

### 11.4 Traduccion de Contenido

Para cada entidad (page, event, program):

```
1. Fetch de WordPress REST API (idioma default: es)
2. Validar con Zod
3. Extraer campos traducibles a JSON
4. Buscar en cache (wp_translations) por hash
5. Si stale/falta → traducir via Groq API
6. Guardar en BD
7. Aplicar traduccion a entidad
8. (Decorador) Generar embeddings para chatbot
```

---

## 12. Guias de Desarrollo

### 12.1 Frontend (TypeScript, React, Astro, CSS)

**Rutas de Importacion**: Usar siempre el alias `@/` que apunta a `frontend/src/`.

```typescript
// Correcto
import { ApiPageService } from "@/core/translations/services/ApiPageService";
import AppLayout from "@/layouts/app/AppLayout.astro";

// Incorrecto
import { ApiPageService } from "../../../core/translations/services/ApiPageService";
```

**Tipado Estricto**: Declarar tipos de TypeScript para todas las propiedades.

**Validacion de Datos**: Usar esquemas Zod en `frontend/src/schemas` para validar respuestas de la API REST.

**Estilos CSS**:
- Usar Tailwind CSS v4
- Diseno responsivo y moderno
- Degradados suaves, transiciones, hover y microinteracciones
- Evitar estilos inline; usar clases utilitarias de Tailwind

**Layouts Especializados**:
- `Layout.astro` - Base general
- `AppLayout.astro` - Landing principal
- `CommerceLayout.astro` - Cámaras de Comercio
- `MayorsLayout.astro` - Alcaldes
- `UniversityLayout.astro` - Universidades

### 12.2 Backend (PHP, WordPress, PSR12)

**Estilo PHP**: Seguir estandar PSR12 configurado en `phpcs.xml`.

**Laravel Pint**: Ejecutar `composer lint:fix` antes de cada cambio.

**Tests**: Usar Pest PHP en `/tests`. Archivos terminados en `Test.php`.

**Seguridad**: Usar funciones nativas de WordPress:
- `esc_html()`, `esc_attr()` - Escapar salidas
- `sanitize_text_field()` - Sanitizar entradas

### 12.3 Convenciones de Nomenclatura

| Elemento | Convencion | Ejemplo |
|----------|-----------|---------|
| Componentes Astro | PascalCase | `Hero.astro` |
| Componentes React | PascalCase | `Chatbot.tsx` |
| Schemas Zod | PascalCase + Schema | `EventSchema` |
| Types TypeScript | PascalCase + Type | `EventType` |
| Servicios | PascalCase + Service | `ApiPageService` |
| Repositorios | PascalCase + Repository | `TranslationRepositoryImpl` |
| Utilidades | camelCase | `useTranslations()` |
| Constantes | SCREAMING_SNAKE_CASE | `API_URL` |

### 12.4 Patron de Clean Architecture

Al crear nuevos modulos, seguir esta estructura:

```
core/<module>/
├── entities/        # Objetos de dominio
├── interfaces/      # Contratos abstractos
├── providers/       # Adaptadores externos (APIs)
├── repositories/    # Adaptadores internos (BD)
├── services/        # Logica de negocio
└── factories/       # Composicion de dependencias
```

---

## 13. Despliegue

### 13.1 Docker Services

| Servicio | Container | Puerto | Descripcion |
|----------|-----------|--------|-------------|
| `wordpress_db` | `tac_wordpress_db` | 3306 | MariaDB 10.11 |
| `wordpress_php` | `tac_wordpress_php` | - | PHP-FPM WordPress |
| `wordpress_server` | `tac_wordpress_nginx` | 8000 | Nginx reverse proxy |
| `frontend` | `tac_frontend` | 4321 | Astro SSR server |

### 13.2 Redes Docker

- `tac_web` - Red interna (bridge) para servicios
- `tac_global_net` - Red externa para conectividad entre proyectos

### 13.3 Variables de Entorno

**Frontend** (`frontend/.env`):
| Variable | Descripcion |
|----------|-------------|
| `API_URL` | URL base de la API REST de WordPress |

**WordPress** (`wordpress/.env`):
| Variable | Descripcion |
|----------|-------------|
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contrasena de la base de datos |
| `DB_HOST` | Host de la base de datos |
| `WP_HOME` | URL de WordPress |
| `WP_SITEURL` | URL del sitio WordPress |

### 13.4 Plugins WordPress

| Plugin | Proposito |
|--------|-----------|
| `advanced-custom-fields` | Campos personalizados para contenido |
| `acf-openstreetmap-field` | Campo de mapa OpenStreetMap |
| `disable-gutenberg` | Deshabilitar editor Gutenberg |
| `headless-mode` | Modo headless para WordPress |
| `wp-rest-api-controller` | Control de endpoints REST |
| `tac-structure` | Plugin personalizado (post types, taxonomias, ACF fields) |

### 13.5 Plugin Personalizado: tac-structure

```
tac-structure/
├── tac-structure.php      # Entry point
├── PostTypes.php          # Registro de post types
├── Taxonomies.php         # Registro de taxonomias
├── ThemeSupport.php       # Soporte de temas
├── Fields/
│   └── Repeater.php       # Campo repeater personalizado
├── FieldGroups/
│   ├── CTAFields.php      # Campos CTA
│   ├── EventFields.php    # Campos de eventos
│   ├── ProgramFields.php  # Campos de programas
│   ├── PageFields.php     # Campos de paginas
│   └── FieldGroups.php    # Registro de field groups
├── RestFields/
│   ├── RestFields.php     # Campos REST generales
│   ├── RestPageFields.php     # Campos REST paginas
│   ├── RestProgramFields.php  # Campos REST programas
│   └── RestEventFields.php    # Campos REST eventos
├── Helpers/
│   ├── DateFormatter.php  # Formateo de fechas
│   └── ImageFormatter.php # Formateo de imagenes
└── Filters/
    ├── RestQueryFilters.php   # Filtros REST
    └── ACFJsonFilters.php     # Filtros ACF JSON
```

---

## 14. Dependencias Principales

### 14.1 Frontend (package.json)

| Paquete | Version | Uso |
|---------|---------|-----|
| `astro` | 7.0.0 | Framework SSR |
| `react` | 19.2.6 | UI interactiva |
| `alpinejs` | 3.15.12 | Interactividad ligera |
| `tailwindcss` | 4.3.0 | Estilos |
| `drizzle-orm` | 0.45.2 | ORM MySQL |
| `mysql2` | 3.22.4 | Cliente MySQL |
| `groq-sdk` | 1.3.0 | API Groq LLM |
| `@google/genai` | 2.8.0 | Google Gemini |
| `zustand` | 5.0.14 | State management |
| `leaflet` | 1.9.4 | Mapas |
| `lucide-react` | 1.16.0 | Iconos |
| `radix-ui` | 1.4.3 | Componentes UI |
| `shadcn` | 4.8.2 | Componentes UI |
| `sanitize-html` | 2.17.5 | Limpieza HTML |
| `react-markdown` | 10.1.0 | Renderizado markdown |

### 14.2 Backend (composer.json)

| Paquete | Version | Uso |
|---------|---------|-----|
| `roots/wordpress` | 7.0 | Core WordPress |
| `roots/bedrock-autoloader` | 1.0 | Autoload PHP |
| `vlucas/phpdotenv` | 5.0 | Variables de entorno |
| `wpackagist-plugin/advanced-custom-fields` | 6.8 | Campos personalizados |
| `wpackagist-plugin/disable-gutenberg` | 3.3 | Deshabilitar Gutenberg |
| `wpackagist-plugin/headless-mode` | 0.4.0 | Modo headless |
| `wpackagist-plugin/wp-rest-api-controller` | 2.1 | Control REST |
| `laravel/pint` | 1.0 | Formateo PHP |
| `pestphp/pest` | 4.0 | Testing PHP |
