import { ref } from 'vue'

const sidebarOpen = ref(true)
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 768)

export function useSidebar() {
  function toggle() { sidebarOpen.value = !sidebarOpen.value }
  function close() { sidebarOpen.value = false }
  function open() { sidebarOpen.value = true }

  return { sidebarOpen, isMobile, toggle, close, open }
}
