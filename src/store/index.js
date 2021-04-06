import Vue from 'vue'
import Vuex from 'vuex'
import mutations from "@/store/mutations";
Vue.use(Vuex)
const state = {
  token: '',
  username:'',
  password:'',
  activePath:''
}
export default new Vuex.Store({
  state,
  mutations,
  actions: {
  },
  modules: {
  }
})
