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
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="search">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
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

    <!--添加用户对话框-->
    <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        @close="addDialogClosed"
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
    <el-dialog title="修改用户"
               width="50%"
               @close="editDialogClosed"
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
      dialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑用户的表单数据
      editForm:{
        username: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3,max: 10,message: '用户名的长度在3~10个字符之间'}
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
    // 当点击面包屑组件的首页文字时的事件
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
    // 监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields();
    },
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
          this.dialogVisible = false;
        }).catch(err=>{
          console.log(err);
          this.loading = false;
          this.$message({type:'error',center:true,duration:1000,message:'无网络连接'});
        })
      })
    },
    // 展示编辑用户的对话框
    showEditDialog(user){
      this.editForm.username = user.username;
      this.editForm.email = user.email;
      this.editForm.mobile = user.mobile;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
    },
    // 编辑用户信息并提交
    editUser(){
      this.$refs.editFormRef.validate(valid=>{
        if (!valid) return;
        this.editDialogVisible = false;
        this.$message.success('修改成功');
      })
    }
  },
}
</script>

<style scoped lang="less">

</style>