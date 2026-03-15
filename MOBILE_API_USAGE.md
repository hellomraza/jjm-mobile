# JJM Mobile App — API Usage Guide

This document explains how the React Native mobile application should interact with the JJM backend APIs.

The backend API specification is defined in the Swagger/OpenAPI document.

This guide defines:

- API usage rules
- Axios configuration
- Authentication token storage
- React Query usage
- Custom hooks structure
- Query key conventions
- Query key should not be hard coded
- Mutation invalidation rules

---

## Networking Stack

The mobile app must use the following stack for API communication:

- HTTP Client: `Axios`
- Data Fetching: `@tanstack/react-query`
- Token Storage: `AsyncStorage`
- State Management: `React Query cache`

---

## Axios Configuration

All API requests must go through a single Axios instance.

File:

- `/src/lib/api.ts`

Example configuration:

```ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.jjm.example.com',
  timeout: 15000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

---

## Token Storage

The authentication token must be stored using AsyncStorage.

Key:

- `access_token`

Example:

```ts
await AsyncStorage.setItem('access_token', token);
```

Retrieve token:

```ts
await AsyncStorage.getItem('access_token');
```

Remove token on logout:

```ts
await AsyncStorage.removeItem('access_token');
```

---

## React Query Setup

React Query must be initialized in the root of the application.

Example:

```tsx
const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## Query Key Rules

Every query must have a unique query key.

Query keys must follow this structure:

```ts
['entity'][('entity', id)][('entity', filters)];
```

Examples:

- `["authUser"]`
- `["users"]`
- `["workItems"]`
- `["workItem", workItemId]`
- `["components", workItemId]`
- `["componentPhotos", componentId]`

Never reuse the same query key for different data.

---

## Custom Hooks Structure

Each entity must have a dedicated hook.

Directory structure:

```text
/src/hooks
  useAuth.ts
  useUsers.ts
  useWorkItems.ts
  useComponents.ts
  usePhotos.ts
```

---

## Authentication Hook

File:

- `useAuth.ts`

Used for:

- login
- logout
- fetching current user

Login API:

- `POST /auth/login`

Example:

```ts
const loginMutation = useMutation({
  mutationFn: data => api.post('/auth/login', data),
  onSuccess: async res => {
    await AsyncStorage.setItem('access_token', res.data.access_token);
  },
});
```

---

## Users Hook

File:

- `useUsers.ts`

Fetch users:

- `GET /users`

Query:

```ts
useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users'),
});
```

---

## Work Items Hook

File:

- `useWorkItems.ts`

Fetch work items:

- `GET /work-items`

Query:

```ts
useQuery({
  queryKey: ['workItems'],
  queryFn: () => api.get('/work-items'),
});
```

Fetch single work item:

- `GET /work-items/:id`

Query key:

- `["workItem", id]`

---

## Components Hook

File:

- `useComponents.ts`

Fetch components of a work item:

- `GET /components/work-item/:workItemId`

Example:

```ts
useQuery({
  queryKey: ['components', workItemId],
  queryFn: () => api.get(`/components/work-item/${workItemId}`),
});
```

Fetch component details:

- `GET /components/:id`

Query key:

- `["component", componentId]`

---

## Photo Upload Hook

File:

- `usePhotos.ts`

Upload photo:

- `POST /components/:componentId/photos`

Example mutation:

```ts
useMutation({
  mutationFn: data => api.post(`/components/${id}/photos`, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['components', workItemId]);
    queryClient.invalidateQueries(['componentPhotos', componentId]);
  },
});
```

---

## Fetch Component Photos

API:

- `GET /components/:componentId/photos`

Query key:

- `["componentPhotos", componentId]`

Example:

```ts
useQuery({
  queryKey: ['componentPhotos', componentId],
  queryFn: () => api.get(`/components/${componentId}/photos`),
});
```

---

## Contractor Photo Submission

API:

- `POST /components/:componentId/submit-photo`

Mutation:

```ts
useMutation({
  mutationFn: photoId =>
    api.post(`/components/${componentId}/submit-photo`, { photoId }),

  onSuccess: () => {
    queryClient.invalidateQueries(['components', workItemId]);
    queryClient.invalidateQueries(['component', componentId]);
  },
});
```

---

## District Officer Approval

Approve component:

- `POST /components/:componentId/approve`

Reject component:

- `POST /components/:componentId/reject`

Mutation rule:

- Invalidate queries:
  - `["components"]`
  - `["pendingApproval"]`

---

## Pending Approval Query

API:

- `GET /components/pending-approval`

Query key:

- `["pendingApproval"]`

---

## Approved Components Query

API:

- `GET /components/approved`

Query key:

- `["approvedComponents"]`

---

## Mutation Rules

Every mutation must invalidate relevant queries.

### Photo Upload

Invalidate:

- `["components", workItemId]`
- `["componentPhotos", componentId]`

### Component Submit

Invalidate:

- `["components", workItemId]`
- `["component", componentId]`

### Approval

Invalidate:

- `["pendingApproval"]`
- `["approvedComponents"]`

---

## Error Handling

Axios interceptor must handle unauthorized errors.

Example:

```ts
if (error.response.status === 401) {
  AsyncStorage.removeItem('access_token');
}
```

User must be redirected to login.

---

## Pagination Rules

List APIs support pagination.

Example:

```text
?page=1
&limit=20
```

React Query must include pagination in query key.

Example:

- `["workItems", page]`

---

## Performance Guidelines

React Query cache should be used aggressively.

Recommended stale times:

- Work items: `staleTime: 60 seconds`
- Master data: `staleTime: 10 minutes`

---

## Summary

- API Client: Axios with interceptor
- Token Storage: AsyncStorage
- State Management: React Query
- Custom Hooks: `useAuth`, `useUsers`, `useWorkItems`, `useComponents`, `usePhotos`
- Query Keys: Unique keys per resource
- Mutation Strategy: Always invalidate affected queries

---

## End of Document
