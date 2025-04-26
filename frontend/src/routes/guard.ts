import 'vue-router'

// Ensuring it is treated as a module
export {}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean; // If true, only authenticated users can access
    isAdmin?: boolean; // If true, only admin users can access
  }
}
