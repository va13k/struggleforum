export const apiRoutes = {
  health: "/api/health",
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  account: {
    profile: "/api/account/profile",
    password: "/api/account/password",
  },
  users: {
    item: (id: string) => `/api/users/${id}`,
  },
  posts: {
    collection: "/api/posts",
    item: (id: string) => `/api/posts/${id}`,
    lock: (id: string) => `/api/posts/${id}/lock`,
    unlock: (id: string) => `/api/posts/${id}/unlock`,
    comments: (id: string) => `/api/posts/${id}/comments`,
  },
  comments: {
    item: (id: string) => `/api/comments/${id}`,
    lock: (id: string) => `/api/comments/${id}/lock`,
    unlock: (id: string) => `/api/comments/${id}/unlock`,
  },
  categories: {
    collection: "/api/categories",
  },
  likes: {
    collection: "/api/likes",
    item: (id: string) => `/api/likes/${id}`,
  },
  notifications: {
    collection: "/api/notifications",
    markRead: (id: string) => `/api/notifications/${id}/read`,
  },
  admin: {
    users: {
      collection: "/api/admin/users",
      role: (id: string) => `/api/admin/users/${id}/role`,
    },
    posts: {
      item: (id: string) => `/api/admin/posts/${id}`,
    },
    comments: {
      item: (id: string) => `/api/admin/comments/${id}`,
    },
  },
} as const;
