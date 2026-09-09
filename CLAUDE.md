# Guía de Desarrollo para Asistentes de IA (CLAUDE.md)

Este documento detalla las directrices del proyecto, comandos frecuentes y normas de estilo de código para asistir a los desarrolladores y agentes de IA que colaboren en el repositorio.

---

## 1. Arquitectura del Proyecto

El proyecto es un monorepositorio que combina un Backend Headless en WordPress y un Frontend renderizado por servidor (SSR) con Astro:
*   **Docker:** Toda la infraestructura se levanta en contenedores Docker (Base de Datos MariaDB, PHP-FPM de WordPress, Servidor Nginx y un contenedor para el Frontend de Node.js).
*   **Backend (`/wordpress`):** Basado en **Roots Bedrock**, un boilerplate profesional que añade soporte para Composer, variables de entorno con dotenv y una estructura organizada.
*   **Frontend (`/frontend`):** Basado en **Astro 7.0**, con integraciones para React 19 y AlpineJS. Accede directamente a la base de datos de WordPress usando **Drizzle ORM** (para caché y traducciones) y consume la API REST de WordPress para el contenido.

---

## 2. Comandos Frecuentes

### 2.1 Gestión de Infraestructura (Docker)
Todos los comandos de Docker se ejecutan desde la raíz del proyecto:
*   Levantar entorno de desarrollo: `docker compose up -d`
*   Detener el entorno: `docker compose down`
*   Ver logs de los servicios: `docker compose logs -f`
*   Acceder al contenedor PHP: `docker compose exec -u lomi wordpress-php bash`
*   Acceder al contenedor Frontend: `docker compose exec -u lomi frontend bash`

### 2.2 Frontend (Astro, React, TypeScript)
Ejecutar preferiblemente dentro del contenedor `frontend` en `/app` o en local si se dispone de la versión correcta de Node (>=22.12.0):
*   Instalar dependencias: `pnpm install`
*   Ejecutar servidor de desarrollo: `pnpm dev` (disponible en `http://localhost:4321`)
*   Compilar para producción: `pnpm build`
*   Previsualizar la build de producción: `pnpm preview`
*   Generar esquemas de Drizzle ORM: `pnpm db:generate`
*   Ejecutar migraciones de Drizzle ORM: `pnpm db:migrate`

### 2.3 Backend (WordPress Bedrock & Pest PHP)
Ejecutar dentro del contenedor `wordpress-php` en `/var/www/html`:
*   Instalar dependencias de PHP: `composer install`
*   Verificar estilo de código (Laravel Pint): `composer lint`
*   Corregir estilo automáticamente: `composer lint:fix`
*   Ejecutar suite de pruebas unitarias/funcionales (Pest): `composer test`
*   Ejecutar PHP Code Sniffer (local): `vendor/bin/phpcs`

---

## 3. Guías de Estilo y Reglas de Código

### 3.1 Frontend (TypeScript, React, Astro, CSS)
*   **Rutas de Importación:** Usar siempre el alias `@/` que apunta a `frontend/src/` (configurado en `tsconfig.json`). Evitar rutas relativas largas como `../../components`.
*   **Tipado Estricto:** Declarar tipos de TypeScript para todas las propiedades de los componentes.
*   **Validación de Datos:** Usar esquemas Zod (`zod` o `astro/zod`) en `frontend/src/schemas` para validar respuestas de la API REST antes de procesar o renderizar datos en las páginas.
*   **Estilos y CSS:**
    *   Utilizar Tailwind CSS v4.
    *   Dar preferencia a un diseño responsivo y moderno (usar degradados suaves, transiciones, hover y microinteracciones).
    *   Evitar estilos "en línea" innecesarios; usar clases utilitarias de Tailwind.
*   **Estructura de Layouts:**
    *   La aplicación cuenta con diferentes layouts especializados según la sección bajo `frontend/src/layouts/`:
        *   `Layout.astro` (Base general).
        *   `app/AppLayout.astro` (Layout de la landing principal).
        *   `acc/CommerceLayout.astro` (Cámaras de Comercio).
        *   `acm/MayorsLayout.astro` (Alcaldes).
        *   `acu/UniversityLayout.astro` (Universidades).

### 3.2 Backend (PHP, WordPress, PSR12)
*   **Estilo PHP:** Seguir el estándar **PSR12** configurado en `phpcs.xml` de la raíz del proyecto.
*   **Laravel Pint:** Toda edición en los archivos PHP del backend debe pasar por `composer lint:fix` antes de ser enviada para mantener el formato automatizado.
*   **Tests:** Escribir tests usando el framework **Pest PHP** en el directorio `/tests`. Los nombres de archivo deben finalizar con `Test.php` (ej. `ExampleTest.php`).
*   **Seguridad:** Utilizar las funciones nativas de WordPress para escapar salidas (`esc_html`, `esc_attr`, etc.) y sanitizar entradas (`sanitize_text_field`).
