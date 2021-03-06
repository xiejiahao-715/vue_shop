import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/plugins/element.js'
import '@/plugins/tree-table'
import '@/plugins/quill-editor'

// 导入element-ui的样式表
import 'element-ui/lib/theme-chalk/index.css'
// 导入富文本编辑器的样式表
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入nprogress样式表
import 'nprogress/nprogress.css'

//导入字体图标
import '@/assets/font/iconfont.css'

//导入全局样式表
import '@/assets/css/global.css'

Vue.config.productionTip = false

// 全局过滤器
Vue.filter('dateFormat',function (originVal){
  const date = new Date(originVal);
  // 获取年月日时分秒，不足两位高位填0
  const year = date.getFullYear();
  const month = (date.getMonth()+ 1 + '').padStart(2,'0');
  const day = (date.getDate() + '').padStart(2,'0');
  const hour = (date.getHours()+'').padStart(2,'0');
  const minute = (date.getMinutes()+ '').padStart(2,'0');
  const second = (date.getSeconds()+ '').padStart(2,'0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
