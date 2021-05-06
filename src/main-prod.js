import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/plugins/tree-table'
import '@/plugins/quill-editor'


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
