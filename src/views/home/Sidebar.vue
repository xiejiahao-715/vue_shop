<template>
  <!--侧边栏-->
  <el-aside :width="isCollapse ? '64px': '200px'">
    <!--折叠按钮-->
    <div class="toggle-button" @click="toggleCollapse">|||</div>
    <el-menu
        ref="sidebarRef"
        :default-active="$store.state.activePath"
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
</template>

<script>
import {get} from "@/network/request";

export default {
  name: "Sidebar",
  data(){
    return{
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
  methods:{
    clearDate(){
      window.sessionStorage.clear();
      this.$store.commit('setUsername','');
      this.$store.commit('setPassword','');
      this.$store.commit('setToken','');
    },
    getMenuList(){
      // 获取所有的菜单
      get({
        method:'get',
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
      this.$store.commit('setActivePath',activePath);
    }
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  }
}
</script>

<style scoped lang="less">
.el-aside{
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
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