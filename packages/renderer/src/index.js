import { createApp } from 'vue'
import App from '/@/App.vue'
import router from '/@/router'
import vuetify from '/@/plugins/vuetify'
import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'

import { loadFonts } from '/@/plugins/webfontloader'
import { createPinia } from 'pinia'

loadFonts()

const app = createApp(App)
app.use(VNetworkGraph)
app.use(createPinia()).use(vuetify).use(router).mount('#app')
