<template>
  <div>
    <!--面包屑导航区域-->
    <!--当点击面包屑组件的首页文字时的事件,用于vuex保存活跃的路由-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter=20>
        <el-col :span="7">
          <el-input placeholder="请输入待查询的用户名" v-model="queryInfo.query" clearable @keyup.enter.native="search">
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
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template #default="scope">
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
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
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
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
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
        <el-button @click="addDialogVisible = false">取 消</el-button>
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

    <!--分配角色的对话框-->
    <el-dialog
        @close="setRoleDialogClosed"
        :close-on-click-modal="false"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        title="分配角色">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList"
                       :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import {get,put,post,Delete} from '@/network/request'
export default {
  name: "Users",
  data(){
    // 验证邮箱的规制
    const checkEmail = (rule, value, callback)=>{
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)){
        return callback()
      }
      else{
        callback(new Error('请输入合法的邮箱'));
      }
    };
    // 验证手机号的规则
    const checkMobile = (rule, value, callback)=>{
      const regMobile =  /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
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
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      userList:[],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password:'',
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
          {min: 1,max: 10,message: '用户名的长度在1~10个字符之间'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail,trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkMobile,trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur'}
        ],
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
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo:{},
      // 所有角色的数据列表
      rolesList:[],
      // 已选中的角色id值
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList();
  },
  methods:{
    getUserList(){
      get({
        url:'/users',
        params:this.queryInfo
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.userList = res.data.users;
          this.total = res.data.total;
        }
      })
    },
    // 监听 page-size改变的事件  每个页面存放的数据条数
    handleSizeChange(newSize){
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage){
       // console.log(newPage)
      this.queryInfo.pagenum =newPage;
      this.getUserList()
    },
    // 监听switch开关的变化
    userStateChanged(userInfo){
      // 使用put请求调用后端接口，来改变数据库中的信息
      put({
        url: `users/${userInfo.id}/state/${userInfo.mg_state}`,
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          // 修改成功
          this.$message({type: 'success',message:'修改用户状态成功',center:true,duration:1000,showClose: true})
        }
        else{
          // 修改失败
          userInfo.mg_state = !userInfo.mg_state;
          this.$message({type: 'error',message:'修改用户状态失败',center:true,duration:1000,showClose: true})
        }
      })
    },
    // 搜索按钮的使用
    search(){
      this.queryInfo.pagenum = 1;
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
          data: this.addForm,
          url: 'users'
        }).then(res=>{
          res = res.data;
          if(res.meta.status === 201){
            this.getUserList()
            this.$message({type:'success',center:true,duration:1000,message:'添加用户成功',showClose: true});
          }
          else{
            this.$message({type:'error',center:true,duration:1000,message:'添加用户失败',showClose: true});
          }
          this.loading = false;
          this.addDialogVisible = false;
        }).catch(err=>{
          console.log(err);
          this.loading = false;
          this.$message({type:'error',center:true,duration:1000,message:'无网络连接',showClose: true});
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
        put({
          url: `users/${this.editForm.id}`,
          data:{
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        }).then(res=>{
          res = res.data;
          if(res.meta.status === 200){
            this.getUserList();
            this.$message({type:'success',center:true,duration:1000,message:'修改信息成功',showClose: true});
            this.editDialogVisible = false;
          }
          else{
            this.$message({type:'error',center:true,duration:1000,message:'修改信息失败',showClose: true});
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
      // 当前页面显示的用户的数量
      let userNumber = this.userList.length;
      Delete({
        url: `users/${id}`,
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          if(userNumber<=1 && this.queryInfo.pagenum >1)
            this.queryInfo.pagenum--;
          this.getUserList();
          this.$message({type:'success',center:true,duration:1000,message:'删除用户成功',showClose: true});
        }
        else{
          this.$message({type:'error',center:true,duration:1000,message:'删除用户失败',showClose: true});
        }
      })
    },
    // 根据ID删除对应的用户
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户的数据，是否继续?', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
        this.deleteUser(id)
      }).catch(() => {
        this.$message({type: 'error', center: true, duration: 1000, message: '成功取消删除用户操作', showClose: true});
      })
    },
    // ---------------------------------------------------------------------

    // 展示分配角色的对话框
    setRole(userInfo){
      this.userInfo = userInfo;
      // 在展示对话框之前，获取所有角色的列表
      get({
        url: 'roles'
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.rolesList = res.data;
        }
        else{
          this.$message.error('获取角色列表失败')
        }
      })
      this.setRoleDialogVisible = true
    },
    // 点击对话框的确定按钮分配角色
    saveRoleInfo(){
      if(!this.selectedRoleId){
        this.$message.error('请选择要分配的角色');
      }
      else{
        put({
          url: `users/${this.userInfo.id}/role`,
          data:{
            rid: this.selectedRoleId
          }
        }).then(res=>{
          res = res.data;
          if(res.meta.status === 200){
            this.$message.success('更新角色成功');
            this.getUserList();
            this.setRoleDialogVisible = false;
          }
          else{
            this.$message.error('更新角色失败');
          }
        })
      }
    },
    //  监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId = '';
      this.userInfo = {};
    }
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