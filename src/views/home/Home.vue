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
      <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
            :default-active="activePath"
            router
            :collapse="isCollapse"
            :collapse-transition="false"
            unique-opened
            background-color="#333744"
            text-color="#fff"
            active-text-color="#ffd04b">
          <!--一级菜单-->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!--一级菜单的模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{ item.authName}}</span>
            </template>

            <!--二级菜单-->
            <el-menu-item :index="'/'+ subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="savaNavState('/'+ subItem.path)">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <!--路由的占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {get} from '@/network/request'
export default {
  name: "Home",
  data(){
    return{
      activePath: '',
      // 是否折叠
      isCollapse: false,
      menuList:[],
      iconsObj:{
        1: 'iconfont icon-users',
        2: 'iconfont icon-tijikongjian',
        3: 'iconfont icon-shangpin',
        4: 'iconfont icon-danju',
        5: 'iconfont icon-baobiao'
      }
    }
  },
  methods: {
    clearDate(){
      window.sessionStorage.clear();
      this.$store.commit('setUsername','');
      this.$store.commit('setPassword','');
      this.$store.commit('setToken','');
    },
    logout() {
      this.clearDate();
      this.$router.push('/login');
      this.$message({
        type: 'success',
        center: 'true',
        message: '退出成功',
        duration: 1000
      })
    },
    getMenuList(){
      // 获取所有的菜单
      get({
        url:'/menus'
      }).then(res=>{
        if(res.data.status === true){
          this.menuList = res.data.menuList;
        }
        else {
          this.clearDate();
          this.$router.push('/login');
          this.$message({
            showClose: true,
            type:'error',
            message:'登录状态异常，请重新登录',
            center: true,
            duration: 1000
          })
        }
      }).catch(()=>{
        this.clearDate();
        this.$router.push('/login');
        this.$message({
          showClose: true,
          type:'error',
          message:'请求服务器失败,请重新登录',
          center: true,
          duration: 1000
        })
      })
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活状态
    savaNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath);
      this.activePath = activePath;
    }
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  }
}
</script>

<style scoped lang="less">
.el-container{
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
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}
.el-main{
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>