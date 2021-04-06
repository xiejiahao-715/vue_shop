export default {
  setUsername(state,payload){
    state.username = payload;
  },
  setPassword(state,payload){
    state.password  = payload;
  },
  setToken(state,payload){
    state.token = payload;
  },
  setActivePath(state,payload){
    state.activePath = payload
  }
}