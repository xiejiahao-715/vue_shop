<template>
  <div class="users">
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="breadcrumbClick">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter=20>
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @keyup.enter.native="search">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
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
            <el-switch v-model="scope.row.state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="light" content="修改信息" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="light" content="删除用户" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
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

    <!--添加用户对话框-->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        :close-on-click-modal="false"
        @closed="addDialogClosed"
        width="50%">
      <!--内容主体区域-->
      <el-form
          v-loading="loading"
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
        title="修改用户"
        width="50%"
        @closed="editDialogClosed"
        :close-on-click-modal="false"
        :visible.sync="editDialogVisible">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {get,put,post} from '@/network/request'
export default {
  name: "Users",
  data(){
    // 验证邮箱的规制
    const checkEmail = (rule, value, callback)=>{
      const regEmail = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if(regEmail.test(value)){
        return callback()
      }
      else{
        callback(new Error('请输入合法的邮箱'));
      }
    };
    // 验证手机号的规则
    const checkMobile = (rule, value, callback)=>{
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if(regMobile.test(value)){
        return callback();
      }
      else{
        callback(new Error('请输入合法的手机号'));
      }
    };
    // 返回的data数据
    return {
      // 获取用户列表的参数对象
      queryInfo:{
        query:'',
        // 当前的页数
        pageNum: 1,
        // 当前每页显示多少条数据
        pageSize: 10
      },
      userList:[],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑用户的表单数据
      editForm:{
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 2,max: 10,message: '用户名的长度在2~10个字符之间'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail,trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkMobile,trigger: 'blur'}
        ]
      },
      // 编辑表单的验证规则对象
      editFormRules:{
        email:[
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail,trigger: 'blur'}
        ],
        mobile:[
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkMobile,trigger: 'blur'}
        ]
      },
      // 判断是否处理加载状态下(目前只显示在dialog组件中)
      loading: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false
    }
  },
  created() {
    this.getUserList();
  },
  methods:{
    // 当点击面包屑组件的首页文字时的事件,用于vuex保存活跃的路由
    breadcrumbClick(){
      this.$store.commit('setActivePath','');
    },
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
    },
    // 监听switch开关的变化
    userStateChanged(userInfo){
      // 使用put请求调用后端接口，来改变数据库中的信息
      put({
        method: 'put',
        url: '/state',
        params:{
          'id': userInfo.id,
          'state': userInfo.state
        }
      }).then(res=>{
        if(res.data.status === true){
          // 修改成功
          this.$message({type: 'success',message:'修改用户状态成功',center:true,duration:1000})
        }
        else{
          // 修改失败
          userInfo.state = !userInfo.state
          this.$message({type: 'error',message:'修改用户状态失败',center:true,duration:1000})
        }
      })
    },
    // 搜索按钮的使用
    search(){
      this.queryInfo.pageNum = 1;
      this.getUserList()
    },

    // ---------------------------------添加用户的功能------------------------
    // 点击按钮添加新用户
    addUser(){
      this.$refs.addFormRef.validate(valid=>{
        if (!valid) return;
        // 处于加载状态
        this.loading = true;
        // 可以发起添加用户的网络请求
        post({
          method:'post',
          data: this.addForm,
          url: '/adduser'
        }).then(res=>{
          if(res.data.status === true){
            this.getUserList()
            this.$message({type:'success',center:true,duration:1000,message:'添加用户成功'});
          }
          else{
            this.$message({type:'error',center:true,duration:1000,message:'添加用户失败'});
          }
          this.loading = false;
          this.addDialogVisible = false;
        }).catch(err=>{
          console.log(err);
          this.loading = false;
          this.$message({type:'error',center:true,duration:1000,message:'无网络连接'});
        })
      })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields();
    },
    // ---------------------------------------------------------------------

    // ---------------------------------修改用户的功能------------------------
    // 展示编辑用户的对话框
    showEditDialog(user){
      this.editForm.id = user.id;
      this.editForm.username = user.username;
      this.editForm.email = user.email;
      this.editForm.mobile = user.mobile;
      this.editDialogVisible = true;
    },
    // 编辑用户信息并提交
    editUser(){
      this.$refs.editFormRef.validate(valid=>{
        if (!valid) return;
        post({
          method: 'post',
          url: '/edituser',
          data:this.editForm
        }).then(res=>{
          if(res.data.status === true){
            this.getUserList();
            this.$message.success('修改信息成功');
            this.editDialogVisible = false;
          }
          else{
            this.$message.error('修改信息失败');
          }
        })
      })
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
      for(let key in this.editForm){
        this.editForm[key] = ""
      }
    },
    // ---------------------------------------------------------------------

    // ---------------------------------删除用户的功能------------------------
    // 删除用户信息并提交
    deleteUser(id){
      post({
        method: 'post',
        url: '/deleteuser',
        data: {
          id: id
        }
      }).then(res=>{
        if(res.data.status === true){
          this.getUserList();
          this.$message.success('删除用户成功');
        }
        else{
          this.$message.error('删除用户失败');
        }
      })
    },
    // 根据ID删除对应的用户
    removeUserById(id){
      this.$confirm('此操作将永久删除该用户的数据，是否继续?','提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(()=>{
        this.deleteUser(id)
      }).catch(()=>{this.$message.error('成功取消删除用户的操作');})
    }
    // ---------------------------------------------------------------------
  },
  watch:{
    // 深度监听
    'queryInfo.query':{
      handler(newValue){
        if(newValue === ''){
          this.search();
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="less">

</style>