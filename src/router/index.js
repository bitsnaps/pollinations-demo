import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'chat', component: () => import('../views/ChatView.vue') },
  { path: '/image', name: 'image', component: () => import('../views/ImageView.vue') },
  { path: '/video', name: 'video', component: () => import('../views/VideoView.vue') },
  { path: '/audio', name: 'audio', component: () => import('../views/AudioView.vue') },
  { path: '/3d', name: '3d', component: () => import('../views/ThreeDView.vue') },
  { path: '/realtime', name: 'realtime', component: () => import('../views/RealtimeView.vue') },
  { path: '/embeddings', name: 'embeddings', component: () => import('../views/EmbeddingsView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
