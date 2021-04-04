<template>
  <div class="users">
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter=20>
        <el-col :span="7">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表数据-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.state" disabled></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template >
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="light" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pageNum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import {get} from '@/network/request'
export default {
  name: "Users",
  data(){
    return {
      // 获取用户列表的参数对象
      queryInfo:{
        query:'',
        // 当前的页数
        pageNum: 1,
        // 当前每页显示多少条数据
        pageSize: 5
      },
      userList:[],
      total: 0
    }
  },
  created() {
    this.getUserList()
  },
  methods:{
    getUserList(){
      get({
        url:'/users',
        method: 'get',
        params:this.queryInfo
      }).then(res=>{
        if(res.data.status === true){
          this.userList = res.data.userList;
          this.total = res.data.total;
        }
      })
    },
    // 监听 page-size改变的事件  每个页面存放的数据条数
    handleSizeChange(newSize){
      // console.log(newSize);
      this.queryInfo.pageSize = newSize;
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage){
       // console.log(newPage)
      this.queryInfo.pageNum =newPage;
      this.getUserList()
    }
  },
}
</script>

<style scoped lang="less">

</style>