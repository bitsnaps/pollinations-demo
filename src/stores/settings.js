import { defineStore } from 'pinia'

const STORAGE_KEY = 'pollinations-settings'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apiKey: load().apiKey || '',
    byopKey: load().byopKey || '',
    useProxy: load().useProxy ?? false,
    safe: load().safe ?? true,
    theme: load().theme || 'dark',
  }),
  getters: {
    activeKey: (s) => s.byopKey || s.apiKey || '',
  },
  actions: {
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
    },
    setKey(key) {
      if (key.startsWith('pk_')) this.byopKey = key
      else this.apiKey = key
      this.save()
    },
    setTheme(t) {
      this.theme = t
      document.documentElement.setAttribute('data-theme', t)
      localStorage.setItem('pollinations-theme', t)
    },
    initTheme() {
      const saved = localStorage.getItem('pollinations-theme') || this.theme
      this.theme = saved
      document.documentElement.setAttribute('data-theme', saved)
    },
  },
})
