<template>
  <el-container>
    <!--头部区域-->
    <el-header>
      <div>
        <img src="@/assets/img/title.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <sidebar></sidebar>
      <!--右侧内容主体-->
      <el-main>
        <!--路由的占位符-->
        <keep-alive exclude="Add">
          <router-view></router-view>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Sidebar from "@/views/home/Sidebar";
export default {
  name: "Home",
  methods: {
    breadcrumbClick(){
      console.log('首页被点击了')
    },
    clearDate(){
      window.sessionStorage.clear();
      this.$store.commit('setUsername','');
      this.$store.commit('setPassword','');
      this.$store.commit('setToken','');
      this.$store.commit('setActivePath','');
    },
    logout() {
      this.clearDate();
      this.$router.push('/login');
      this.$message({showClose: true,type: 'success', center: true, message: '退出成功', duration: 1000})
    },
  },
  components:{
    Sidebar,
  }
}
</script>

<style scoped lang="less">
.el-container{
  // 隐藏右边滚动条
  overflow-x: hidden;
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
    >img{
      width: 50px;
      height:50px;
    }
    span{
      margin-left: 15px;
    }
  }
}
.el-main{
  background-color: #eaedf1;
}
</style>