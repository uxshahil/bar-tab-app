import { createApp } from 'vue'
import { plugin, defaultConfig } from '@formkit/vue'
import formKitConfig from '../formkit.config'
import { createPinia } from 'pinia'
import { createMetaManager } from 'vue-meta'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import 'iconify-icon'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createMetaManager())
app.use(plugin, defaultConfig(formKitConfig as Parameters<typeof defaultConfig>[0]))

app.mount('#app')
