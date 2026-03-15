# AI Prompt — React Native Employee App Development

## Purpose

You are an AI React Native engineer working inside a mobile application repository.

Before writing any code, you must read and follow these project documents:

- `/docs/EMPLOYEE_APP_UI_DESIGN.md`
- `/docs/MOBILE_API_USAGE.md`

These documents define:

- UI design rules
- API usage rules
- Axios configuration
- React Query usage
- Hook architecture
- Query key rules
- Mutation invalidation rules

You must strictly follow these documents.

---

## Development Workflow Rules

You must follow these rules during development:

1. Execute only **one task at a time**.
2. Each task must use a **separate git branch**.
3. Each subtask must be **one commit**.
4. Each commit must modify **1–3 files only**.
5. Each task must modify **no more than 5–8 files**.
6. After finishing a task, you must **stop and wait for instructions**.

---

## Library Installation Rule

When installing a new library:

1. Install the library.
2. Stop execution.
3. Ask the developer to perform manual setup if required.
4. The developer will follow the official package documentation.
5. The developer will run the app on:
   - Android
   - iOS
6. The developer will confirm:

   > Package installed successfully

Only after confirmation may you continue implementation.

**Never assume library setup is complete.**

---

## Technology Stack

- React Native
- React Navigation
- Axios
- AsyncStorage
- `@tanstack/react-query`
- `react-i18next`
- `react-native-vector-icons`

### Testing

- Jest
- React Native Testing Library

---

## Architecture Rules

- All API calls must go through a single Axios instance.
- Token must be stored in AsyncStorage.
- React Query must be used for all API requests and caching.
- Every entity must have its own hook.

Examples:

- `useAuth`
- `useUsers`
- `useWorkItems`
- `useComponents`
- `usePhotos`

Additional rules:

- Every query must have a unique query key.
- Mutations must invalidate relevant queries.

---

## Folder Structure

The project must follow this structure:

```text
src/
  api/
  hooks/
  screens/
  components/
  navigation/
  i18n/
  utils/
  tests/
```

---

## Testing Rules

Unit tests must be written for:

- hooks
- components
- utility functions
- API functions

Every test must be in a separate file.

Example structure:

```text
components/
  WorkItemCard.tsx
  WorkItemCard.test.tsx

hooks/
  useAuth.ts
  useAuth.test.ts

screens/
  LoginScreen.tsx
  LoginScreen.test.tsx
```

Rules:

- Tests must test specific functionality.
- Tests must be isolated.
- Tests must not depend on other components.

Testing libraries:

- Jest
- React Native Testing Library

---

## Task 1 — React Native Project Setup

### Branch

`feature/mobile-project-setup`

### Subtasks

- Initialize React Native project
- Install base dependencies
- Setup folder structure
- Configure navigation
- Setup React Query provider

### Commits

- `feat(app): initialize react native project`
- `feat(app): install required dependencies`
- `feat(app): create base folder structure`
- `feat(app): configure navigation container`
- `feat(app): configure react query provider`

After installing dependencies, you must pause and ask the developer to verify installation.

---

## Task 2 — Axios API Client

### Branch

`feature/api-client`

### Subtasks

- Create Axios instance
- Add base URL
- Add request interceptor
- Attach token from AsyncStorage
- Add error interceptor

### Commits

- `feat(api): create axios client`
- `feat(api): add token interceptor`
- `feat(api): add error handling interceptor`

### File

- `src/api/client.ts`

---

## Task 3 — React Query Configuration

### Branch

`feature/react-query`

### Subtasks

- Create `QueryClient`
- Setup `QueryClientProvider`
- Configure global query options

### Commits

- `feat(query): create query client`
- `feat(query): setup query provider`

---

## Task 4 — Authentication Hook

### Branch

`feature/auth-hooks`

### Subtasks

- Create `useAuth` hook
- Implement login mutation
- Store token in AsyncStorage
- Implement logout function

### API

- `POST /auth/login`

### Commits

- `feat(auth): create useAuth hook`
- `feat(auth): implement login mutation`
- `feat(auth): implement logout`

### Tests

Create:

- `useAuth.test.ts`

---

## Task 5 — Login Screen

### Branch

`feature/login-screen`

### Subtasks

- Create login UI
- Add email/password inputs
- Connect `useAuth` hook
- Navigate after login

### Commits

- `feat(login): create login screen`
- `feat(login): connect login mutation`
- `feat(login): add validation`

### Tests

- `LoginScreen.test.tsx`

---

## Task 6 — Work Items Hook

### Branch

`feature/workitems-hooks`

### Subtasks

- Create `useWorkItems` hook
- Fetch work items list
- Fetch single work item

### API

- `GET /work-items`
- `GET /work-items/:id`

### Query Keys

- `["workItems"]`
- `["workItem", id]`

### Commits

- `feat(workitems): create useWorkItems hook`
- `feat(workitems): implement queries`

### Tests

- `useWorkItems.test.ts`

---

## Task 7 — Work Item List Screen

### Branch

`feature/workitems-screen`

### Subtasks

- Create list UI
- Display card list
- Fetch work items using hook
- Navigate to work item details

### Commits

- `feat(workitems): create list screen`
- `feat(workitems): connect query`

### Tests

- `WorkItemListScreen.test.tsx`

---

## Task 8 — Components Hook

### Branch

`feature/components-hooks`

### Subtasks

- Create `useComponents` hook
- Fetch components for work item
- Fetch component details

### API

- `GET /components/work-item/:workItemId`

### Query Key

- `["components", workItemId]`

### Commits

- `feat(components): create useComponents hook`
- `feat(components): implement queries`

### Tests

- `useComponents.test.ts`

---

## Task 9 — Component List Screen

### Branch

`feature/component-list`

### Subtasks

- Create component list UI
- Show component progress
- Navigate to upload screen

### Commits

- `feat(components): create component list screen`
- `feat(components): connect query`

### Tests

- `ComponentListScreen.test.tsx`

---

## Task 10 — Photo Upload Hook

### Branch

`feature/photo-hooks`

### Subtasks

- Create `usePhotos` hook
- Implement upload photo mutation
- Implement fetch component photos

### API

- `POST /components/:componentId/photos`
- `GET /components/:componentId/photos`

### Query Key

- `["componentPhotos", componentId]`

### Commits

- `feat(photos): create usePhotos hook`
- `feat(photos): implement upload mutation`
- `feat(photos): invalidate queries after upload`

### Tests

- `usePhotos.test.ts`

---

## Task 11 — Camera Integration

### Branch

`feature/camera-screen`

### Subtasks

- Install camera library
- Capture photo
- Capture GPS location

### Important Rule

After installing the camera library:

1. **Stop** and ask the developer to configure it manually.
2. The developer will:
   - follow official documentation
   - run Android build
   - run iOS build
   - confirm installation
3. Only then continue.

### Commits

- `feat(camera): integrate camera library`
- `feat(camera): capture photo`
- `feat(camera): capture gps metadata`

### Tests

- `CameraScreen.test.tsx`

---

## Task 12 — Upload Photo Screen

### Branch

`feature/upload-screen`

### Subtasks

- Create upload UI
- Enter progress value
- Submit photo mutation
- Invalidate queries

### Commits

- `feat(upload): create upload screen`
- `feat(upload): connect upload mutation`
- `feat(upload): invalidate component queries`

### Tests

- `UploadPhotoScreen.test.tsx`

---

## Query Invalidation Rules

After photo upload, invalidate:

- `["components", workItemId]`
- `["componentPhotos", componentId]`

---

## Execution Rule

Before writing code, you must:

1. Explain the plan for the current task.
2. List files that will be modified.
3. List commit messages.
4. Confirm architecture rules are followed.

Then wait for developer approval before generating code.
