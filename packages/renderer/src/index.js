import { createApp } from 'vue'
import App from '/@/App.vue'
import router from '/@/router'
import '/@/plugins/logger'
import '@mdi/font/css/materialdesignicons.css'
import './index.css'

import { loadFonts } from '/@/plugins/webfontloader'
import { createPinia } from 'pinia'

loadFonts()

const app = createApp(App)
app.use(createPinia()).use(router).mount('#app')
