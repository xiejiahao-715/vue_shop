import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/plugins/element.js'
import '@/plugins/tree-table'
import '@/plugins/quill-editor'

//导入字体图标
import '@/assets/font/iconfont.css'

//导入全局样式表
import '@/assets/css/global.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
