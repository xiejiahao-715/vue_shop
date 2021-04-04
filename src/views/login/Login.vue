<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="@/assets/img/logo.png" alt="">
      </div>
      <!--登陆表单区-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form"
               v-loading="loading">
        <!-- 用户名-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <!-- 密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-lock_fill" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {postLogin} from '@/network/request'
export default {
  name: "Login",
  data(){
    return {
      // 这是登陆表单的数据绑定对象
      loginForm:{
        username: '1910300212',
        password: '155116'
      },
      // 表单的验证规则对象
      loginFormRules:{
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      loading:false
    }
  },
  methods:{
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields();
    },
    login(){
      // 进行表单的预验证,validate第一个形参表示验证是否通过
      this.$refs.loginFormRef.validate(valid=>{
        if(!valid) return;
        this.loading = true;
        postLogin({
          method: "post",
          url: '/login',
          data:this.loginForm
        }).then(res=>{
          if(res.data.status === true){
            this.$message({
              showClose: true,
              message:"登录成功",
              type:'success',
              center: true,
              duration:1000
            });
            window.sessionStorage.setItem('token',res.data.token);
            this.$store.commit('setUsername',this.loginForm.username);
            this.$store.commit('setPassword',this.loginForm.password);
            this.$store.commit('setToken',res.data.token);
            this.$router.push('/home');
          }
          else{
            this.$message({
              showClose: true,
              message:"用户名或密码错误",
              type:'error',
              center:true,
              duration:1000
            });
            this.loading = false;
          }
        }).catch(err=>{
          this.$message({
            showClose: true,
            message:"请求服务器失败",
            type:'error',
            center:true,
            duration:1000
          });
          console.log(err);
          this.loading = false;
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  width:450px;
  height:300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  // 使盒子水平垂直居中
  transform:translate(-50%,-50%);
}
.avatar_box{
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px  #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%,-50%);
  background-color: #fff;
  img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
    // 使图片不可被拖动
    -webkit-user-drag: none;
    -webkit-user-select: none;
  }
}
.login_form{
  position: absolute;
  bottom:0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btn{
  display: flex;
  flex-direction:row;
  justify-content:center;
}
</style>