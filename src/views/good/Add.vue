<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
          show-icon
          :closable="false" center
          title="添加商品信息"></el-alert>
      <!--步骤条区域-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab区域-->
      <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px" label-position="top">
        <el-tabs
            :tab-position="'left'"
            v-model="activeIndex"
            :before-leave="beforeTabLeave"
            @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                  clearable
                  :options="cateList" :props="cateProps"
                  v-model="addForm.goods_cat"
                  @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
                v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_checked_vals" >
                <el-checkbox v-for="(checkbox,i) in item.attr_vals" :key="i"
                             :label="checkbox" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
                v-for="item in onlyTableData"
                :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--action表示图片要上传到的后台API地址-->
            <el-upload
                drag
                :action="uploadURL"
                :headers="headerObj"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                list-type="picture">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor
                v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品的按钮-->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--图片预览-->
    <el-dialog
        title="图片预览" width="50%"
        :visible.sync="previewVisible">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import {get,post} from '@/network/request'
import _ from 'lodash'
export default {
  name: "Add",
  data(){
    return{
      // 步骤条的进度
      activeIndex: 0,
      // 添加商品的表单数据对象
      addForm:{
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的介绍
        goods_introduce:'',
      },
      // 添加商品表单的验证规则
      addFormRules:{
        goods_name: [{required: true,message: '请输入商品名称',trigger:'blur'}],
        goods_price: [{required: true,message: '请输入商品价格',trigger:'blur'}],
        goods_weight: [{required: true,message: '请输入商品重量',trigger:'blur'}],
        goods_number: [{required: true,message: '请输入商品数量',trigger:'blur'}],
        goods_cat: [{type:'array',required: true,message: '请选择商品分类',trigger: 'change' }]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置项
      cateProps:{
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        // 只能选择最后一级
        checkStrictly:false
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的API地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj:{
        Authorization: this.$store.state.token
      },
      // 预览图片的路径
      previewPath:'',
      // 控制图片预览对话框的显示与隐藏
      previewVisible: false,
      // 获取动态参数和静态属性的请求只能触发一次
      control :{
        getManyTableData: 0,
        getOnlyTableData: 0
      },
    }
  },
  computed:{
    cateId(){
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null;
    },
  },
  created() {
    this.getCateList();
  },
  methods:{
    // 获取商品分类的数据列表
    async getCateList(){
      const {data:res} = await get({
        url: `categories`
      });
      if(res.meta.status === 200){
        this.cateList = res.data;
      }
      else{
        return this.$message.error('获取商品分类数据失败');
      }
    },
    // 级联选择器选中项变化时触发
    async getManyTableData(){
      const {data:res} = await get({
        url: `categories/${this.cateId}/attributes`,
        params:{sel: 'many'}
      });
      if(res.meta.status === 200){
        res.data.forEach(item=>{
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
          // ...为ES6的特性 扩展运算符
          item.attr_checked_vals = [...item.attr_vals];
        })
        this.manyTableData = res.data;
      }
      else{
        return this.$message.error('获取动态参数列表失败');
      }
    },
    async getOnlyTableData(){
      const {data:res} = await get({
        url: `categories/${this.cateId}/attributes`,
        params:{sel: 'only'}
      });
      if(res.meta.status === 200){
        this.onlyTableData = res.data;
      }
      else{
        return this.$message.error('获取静态属性失败');
      }
    },
    handleChange(){
      if(this.addForm.goods_cat.length !== 3){
        this.addForm.goods_cat = [];
      }
    },
    // 但标签页切换时触发的函数
    beforeTabLeave(activeName,oldActiveName){
      // 用来判断是否可以切换标签
      let beforeAble;
      // 但页面刚进行渲染时,oldActiveName为undefined
      if(oldActiveName === undefined)
        return true;
      this.$refs.addFormRef.validate(valid=>{
        beforeAble = valid;
      });
      if(beforeAble === false) return false;
      activeName = parseInt(activeName);
      oldActiveName = parseInt(oldActiveName);
      if(activeName > oldActiveName+1){
        this.$message.warning('请先按要求逐步填写商品信息');
        return false;
      }
      return true;
    },
    // 当Tags标签页被点击时触发
    tabClicked(){
      if(this.activeIndex === '1' && this.control.getManyTableData === 0){
        this.getManyTableData();
        this.control.getManyTableData++;
      }else if(this.activeIndex === '2' && this.control.getOnlyTableData === 0){
        this.getOnlyTableData();
        this.control.getOnlyTableData++;
      }
    },
    // 处理图片预览效果
    handlePreview(file){
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file){
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中找到一个图片对应的索引值
      const index = this.addForm.pics.findIndex(item => item.pic === filePath);
      // 3.调用数组的splic方法，把图片信息对象从pics数组中移除
      this.addForm.pics.splice(index,1);

      // 这里还不够完善，没有向服务器发送请求并清除已经存储的图片，因为没有提供合适的接口
    },
    // 监听图片上传成功的事件
    handleSuccess(response){
      // 1.拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 点击按钮添加商品
    add(){
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid)
          return this.$message.error('请填写必要的表单项目!');
        // 执行添加的业务逻辑
        // 使用lodash cloneDeep(obj)实现深拷贝，因为addForm的goods_cat始终要为一个数组，不能为字符串
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');
        form.attrs = []
        // 处理动态参数
        this.manyTableData.forEach(item=>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_checked_vals.join(' ')
          };
          if(newInfo.attr_value.replace(/ +/,'') !== '')
            form.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach(item=>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          if(newInfo.attr_value.replace(/ +/,'') !== '')
            form.attrs.push(newInfo);
        });
        // 发送请求添加商品
        const {data:res} = await post({
          url: `goods`,
          data: form
        });
        if(res.meta.status === 201){
          this.$message.success('添加商品成功');
          await this.$router.push('/goods');
        }
        else {
          return this.$message.error('添加商品失败');
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
/deep/.el-steps{
  margin: 15px;
  display: flex;
  align-items:center;
  justify-content:center
}
/deep/.el-step__title{
  font-size: 14px;
}
/deep/.el-cascader .el-input .el-input__inner{
  width: 280px;
}
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.previewImg{
  width: 100%;
}
/deep/.ql-editor{
  min-height: 300px;
}
.btnAdd{
  margin-top: 15px;
}
</style>