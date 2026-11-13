# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 H5 mobile template project for a government portal system (云南门户移动端). Built with TypeScript, Vite 8, Vant 4 UI library, and Tailwindcss.

## Development Commands

```bash
# Install dependencies (requires Node 20+ and pnpm 9+)
pnpm install

# Start development server
pnpm dev

# Build for production (includes type check)
pnpm build

# Build only (without type check)
pnpm build-only

# Run TypeScript type check
pnpm type-check

# Run ESLint
pnpm lint

# Run ESLint with auto-fix
pnpm lint:fix

# Preview production build locally
pnpm preview
```

## Architecture

### API Layer

- **Base Pattern**: All API controllers inherit from `BaseController` (`src/api/BaseController.ts`)
- **Organization**: API modules organized by business domain:
  - `src/api/generated/` - Auto-generated API controllers
  - `src/api/system/` - System-related APIs (login, dictionary, user)
  - `src/api/flow/` - Workflow-related APIs
  - `src/api/recruitManagement/` - Recruitment management APIs
  - `src/api/partnerEvaluation/` - Partner evaluation APIs
  - `src/api/negativeManagement/` - Negative behavior management APIs
- **HTTP Layer**: Custom request wrapper (`src/common/http/request.ts`) built on Axios with features:
  - Request throttling
  - Error handling
  - Loading mask management
  - Token authentication
- **API Prefix**: All APIs use `/gov/admin` context path (defined in `src/api/config.ts`)

### State Management (Pinia)

- **Store Structure**: Multiple domain-specific stores in `src/store/`:
  - `useLoginStore` - User authentication and info
  - `useLayoutStore` - Layout state, menu management
  - `useDictMapStore` - Dictionary data caching
  - `useStaticDictStore` - Static dictionary data
  - `useMessageStore` - Message management
  - `usePartnerEvaluationStore` - Partner evaluation state
- **Persistence**: Uses `pinia-plugin-persist` for state persistence

### Routing System

- **Dynamic Routes**: Routes defined in `src/router/systemRouters.ts` with dynamic loading
- **Route Files**: Modular route definitions (`layout.ts`, `login.ts`, `message.ts`, etc.)
- **Authentication**: Route guards check token and handle token-based login from URL parameters
- **Page Title**: Automatically set based on route meta
- **Route Caching**: Components cached by default; set `noCache: true` in route meta to disable

### Component Architecture

- **Auto-Import**: Vant components auto-imported via `unplugin-vue-components`
- **Vue APIs**: Auto-imported via `unplugin-auto-import` (vue, vue-router, pinia, @vueuse/core)
- **Custom Components** in `src/components/`:
  - `i-icon` - Icon wrapper (supports Iconify and SVG)
  - `svg-icon` - Local SVG icon component
  - `nav-bar` - Navigation bar component
  - `tabbar` - Tab bar component

### Styling

- **Tailwindcss**: Atomic CSS framework with JIT mode
- **PostCSS**: `cnjm-postcss-px-to-viewport` for viewport adaptation (design width: 375px)
- **Dark Mode**: Supported via `src/utils/dark-mode.ts`
- **Global Styles**: Located in `src/styles/`

### Icons

Two approaches available:
1. **Iconify** (recommended): Use `<i-icon icon="icon-set:icon-name" />`
   - Online: Fetches from Iconify API
   - Offline: Install icon set package (e.g., `@iconify-icons/fa6-solid`)
2. **Local SVG**: Place SVG files in `src/icons/svg/`, use `<svg-icon name="filename" />`

### TypeScript Configuration

- **Path Alias**: `@/*` maps to `src/*`, `@build/*` maps to `build/*`
- **Strict Mode**: Enabled with strict function types
- **Experimental Decorators**: Enabled for class-based API controllers

### Environment Variables

- `.env.development`: Development settings (eruda debug tool enabled)
- `.env.production`: Production settings (CDN disabled by default)
- Key variables:
  - `VITE_BASE_API`: API base URL
  - `VITE_PUBLIC_PATH`: Public path for deployment
  - `VITE_ENABLE_ERUDA`: Enable eruda debug panel (dev only)
  - `VITE_CDN_DEPS`: Enable CDN for dependencies (prod)

### Build Configuration

- **Vite Plugins**:
  - Vue + Vue JSX support
  - Mock dev server for development
  - Auto-import for Vue APIs and components
  - SVG icons plugin
  - Compression (gzip) for production
  - Optional CDN support
- **Output Structure**: JS in `static/js/`, assets in `static/[ext]/`

### Proxy Configuration

Development proxy configured in `vite.config.ts`:
- `/gov/admin/` proxies to backend server (currently `http://192.168.10.40`)

## Key Patterns

### API Controller Pattern

```typescript
// All controllers extend BaseController
export class MyController extends BaseController {
  static async getList(params: ANY_OBJECT) {
    return await this.get('/api/path', params);
  }
}
```

### Route Definition

```typescript
{
  path: 'path',
  name: 'RouteName',
  component: () => import('@/views/path/index.vue'),
  meta: {
    title: 'Page Title',
    noCache: false // optional, disable caching
  }
}
```

### Component Naming for Caching

Component name must match route name for proper caching:
```vue
<script setup lang="ts">
defineOptions({
  name: 'RouteName' // Must match route name
})
</script>
```

### Dictionary System

Dictionaries loaded via `DictionaryController.dictGlobalDict()` and cached in `useDictMapStore`. Common dictionaries initialized in router's `initMapDict()` function.

### Token-based Authentication

Supports URL token login: `?token=xxx&oppoCode=xxx`. Token stored and used for subsequent requests via Axios interceptors.

## Git Commit Convention

Follow Angular commit convention enforced by husky:
- `feat`: New feature
- `fix`: Bug fix
- `style`: Code style changes
- `perf`: Performance optimization
- `refactor`: Code refactoring
- `docs`: Documentation
- `chore`: Build/config changes

Format: `<type>(<scope>): <subject>`