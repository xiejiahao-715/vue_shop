<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
    {{this.$store.state.token}}
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login');
      this.$message({
        type: 'success',
        center: 'true',
        message: '退出成功',
        duration: 1000
      })
      this.$store.commit('setUsername','');
      this.$store.commit('setPassword','');
      this.$store.commit('setToken','');
    }
  },
  created() {
    if(!this.$store.state.token){
      this.$router.push('/login');
      this.$message({
        type: 'error',
        center: 'true',
        message: '登陆状态异常',
        duration: 1000
      })
    }
  }
}
</script>

<style scoped>

</style>