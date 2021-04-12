<template>
  <div>
    <!--面包屑导航区域-->
    <!--当点击面包屑组件的首页文字时的事件,用于vuex保存活跃的路由-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {get} from '@/network/request';

export default {
  name: "Rights",
  data(){
    return {
      rightsList:[], // 权限列表
    }
  },
  created() {
    this.getRightsList(); // 获取所有的权限
  },
  methods:{
    // 获取权限列表
    getRightsList(){
      get({
        url: 'rights/list'
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.rightsList = res.data;
        }
        else{
          this.$message({type:'error',message:'获取权限列表失败',showClose:true,duration: 1000,center: true});
        }
      }).catch(()=>{
        this.$message({type:'error',message:'连接服务器失败',showClose:true,duration: 1000,center: true});
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>