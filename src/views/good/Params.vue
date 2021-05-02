<template>
  <div class="params">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
          show-icon
          title="注意:只允许为第三级分类设置相关参数"
          type="warning"
          :closable="false"></el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
              clearable
              @change="handleChange"
              v-model="selectedCatKeys"
              :props="cateProps"
              :options="cateList"></el-cascader>
        </el-col>
      </el-row>

      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible = true" type="primary" size="middle" :disabled="isBtnDisable">添加参数</el-button>
          <el-table
              :data="manyTableData"
              border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template #default="scope">
                <!--循环渲染Tag标签-->
                <el-tag
                    v-for="(item,i) in scope.row.attr_vals" :key="i"
                    @close="handleClose(i,scope.row)"
                    closable>{{item}}</el-tag>
                <el-input
                    v-if="scope.row.inputVisible"
                    class="input-new-tag"
                    v-model="scope.row.inputValue"
                    ref="savaTagInput"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    size="small"></el-input>
                <el-button
                    v-else
                    @click="showInput(scope.row)"
                    size="small">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="removeParams(scope.row.attr_id)"  size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="addDialogVisible = true" type="primary" size="middle" :disabled="isBtnDisable">添加属性</el-button>
          <el-table
              :data="onlyTableData"
              border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template #default="scope">
                <!--循环渲染Tag标签-->
                <el-tag
                    v-for="(item,i) in scope.row.attr_vals" :key="i"
                    @close="handleClose(i,scope.row)"
                    closable>{{item}}</el-tag>
                <el-input
                    v-if="scope.row.inputVisible"
                    class="input-new-tag"
                    v-model="scope.row.inputValue"
                    ref="savaTagInput"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    size="small"></el-input>
                <el-button
                    v-else
                    @click="showInput(scope.row)"
                    size="small">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button @click="showEditDialog(scope.row.attr_id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button @click="removeParams(scope.row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的对话框-->
    <el-dialog
        @close="addDialogClosed"
        :close-on-click-modal="false" width="50%"
        :visible.sync="addDialogVisible"
        :title="'添加'+titleText">
      <!--添加参数的对话框-->
      <template #footer class="dialog-footer">
        <el-form
            @submit.native.prevent
            label-width="90px"
            ref="addFormRef"
            :rules="addFormRules"
            :model="addForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button @click="addParams" type="primary">确定</el-button>
      </template>
    </el-dialog>

    <!--修改参数的对话框-->
    <el-dialog
        @close="editDialogClosed"
        :close-on-click-modal="false" width="50%"
        :visible.sync="editDialogVisible"
        :title="'修改'+titleText">
      <!--添加参数的对话框-->
      <template #footer class="dialog-footer">
        <!--@submit.native.prevent 取消在input标签中按下enter触发form表单默认提交刷新事件-->
        <el-form
            @submit.native.prevent
            label-width="90px"
            ref="editFormRef"
            :rules="editFormRules"
            :model="editForm">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button @click="editParams" type="primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {get,post,put,Delete} from '@/network/request'
export default {
  name: "Params",
  data(){
    return{
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label : 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCatKeys: [],
      // 被激活的标签页的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm:{
        attr_name: ''
      },
      // 添加参数表单的验证规则
      addFormRules:{
        attr_name: [{required:true,message:'请输入参数名称',trigger:'blur'}]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm:{
      },
      // 修改表单的验证规则对象
      editFormRules:{
        attr_name: [{required:true,message:'请输入参数名称',trigger:'blur'}]
      },
    }
  },
  computed:{
    isBtnDisable(){
      // 如果级联选择框中选中了三级分类，则返回false，不被禁用
      return this.selectedCatKeys.length !== 3;
    },
    // 当前选中的三级分类的Id
    cateId(){
      return this.selectedCatKeys.length === 3 ? this.selectedCatKeys[2] : null;
    },
    // 动态计算标题的文本
    titleText(){
      if(this.activeName === 'many')
        return '动态参数';
      else if(this.activeName === 'only')
        return '静态属性';
      else
        return '出错';
    }
  },
  methods:{
    //获取所有商品分类的列表
    async getCateList(){
       const {data:res} = await get({
        url:'categories'
      });
      if(res.meta.status === 200){
        this.cateList = res.data;
      }
      else{
        return this.$message.error('获取商品分类失败!');
      }
    },
    // 获取参数的列表数据
    async getParamsData(){
      if(this.selectedCatKeys.length !==3){
        // 证明选中的不是三级分类
        this.selectedCatKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
      }
      else{
        // 证明选中的是三级分类
        // 根据所选分类的Id和当前所处理的面板，获取对应的参数
        const {data:res} = await get({
          url:`categories/${this.cateId}/attributes`,
          params:{sel: this.activeName}
        });
        res.data.forEach(item =>{
          item.attr_vals = item.attr_vals.replace(/^[ ]+$/,'') ? item.attr_vals.split(' '): [];
          // 控制文本框的显示与隐藏
          item.inputVisible = false;
          item.inputValue = '';
        });
        if(res.meta.status === 200){
          if(this.activeName === 'many'){
            this.manyTableData = res.data;
          }
          else if(this.activeName === 'only'){
            this.onlyTableData = res.data;
          }
          else{
            return this.$message.error('获取参数列表失败!');
          }
        }
        else {
          return this.$message.error('获取参数列表失败!');
        }
      }
    },
    // 级联选择框选中项变化会触发这个函数
    handleChange(){
      if(this.selectedCatKeys.length === 3)
        this.getParamsData();
      else {
        this.selectedCatKeys = [];
        this.onlyTableData = [];
        this.manyTableData = [];
      }
    },
    // tab页签点击时的处理函数
    handleTabClick(){
      this.getParamsData();
    },
    // 监听添加对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加参数
    addParams(){
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) return;
        const {data: res} = await post({
          url:`categories/${this.cateId}/attributes`,
          data:{
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        });
        if(res.meta.status === 201){
          this.$message.success('添加参数成功');
          this.addDialogVisible = false;
          await this.getParamsData();
        }
        else{
          return this.$message.error('添加参数失败');
        }
      })
    },
    // 点击按钮展示修改的对话框
    async showEditDialog(attr_id){
      // 查询当前参数的信息
      const {data:res} = await get({
        url: `categories/${this.cateId}/attributes/${attr_id}`,
        params:{
          attr_sel: this.activeName
        }
      })
      if(res.meta.status === 200){
        this.editForm = res.data;
        this.editDialogVisible = true;
      }
      else {
        return this.$message.error('获取参数信息失败');
      }
    },
    // 监听修改对话框关闭的事件
    editDialogClosed(){
      // 重置修改的表单
      this.$refs.editFormRef.resetFields();
    },
    // 点击修改对话框的确定按钮，修改参数信息
    editParams(){
      this.$refs.editFormRef.validate(async valid =>{
        if(!valid) return;
        const {data:res} = await put({
          url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          data:{
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        });
        if(res.meta.status === 200){
          this.$message.success('修改参数成功');
          await this.getParamsData();
          this.editDialogVisible = false;
        }
        else{
          return this.$message.error('修改参数失败!');
        }
      })
    },
    // 根据id删除对应的参数项
    async removeParams(attr_id){
      const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续?','提示',{
        confirmButtonText:'确定',
        cancelButtonText: '取消',
        type:'warning'
      }).catch(err=>err)
      // 用户取消了删除的操作
      if(confirmResult !== 'confirm'){
        return this.$message.info('已取消删除！');
      }
      //删除的业务逻辑
      const {data:res} = await Delete({
        url: `categories/${this.cateId}/attributes/${attr_id}`
      })
      if(res.meta.status === 200){
        this.$message.success('删除参数成功');
        await this.getParamsData();
      }
      else{
        return this.$message.error('删除参数失败');
      }
    },
    // 文本框失去焦点或按下了enter都会触发
    handleInputConfirm(row){
      if(row.inputValue.trim().length === 0){
        row.inputValue = '';
        row.inputVisible = false;
        return null;
      }
      // 如果没有return 则证明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;
      // 需要发起请求保存此次添加的参数
      this.savaAttrVals(row);
    },
    // 点击按钮展示文本输入框
    showInput(row){
      row.inputVisible = true;
      // 是文本框自动获得焦点
      // $nextTick方法的作用就是当页面上元素被重新渲染之后才会回调函数中的代码
      this.$nextTick(()=>{
        this.$refs.savaTagInput.$refs.input.focus();
      })
    },
    // 删除对应的参数可选项
    handleClose(index,row){
      row.attr_vals.splice(index,1);
      this.savaAttrVals(row);
    },
    // 将对attr_vals的操作保存到数据库
    async savaAttrVals(row){
      const {data:res} = await put({
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        data:{
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      });
      if(res.meta.status === 200){
        this.$message.success('修改参数项成功!');
      }
      else{
        return this.$message.error('修改参数项失败!');
      }
    }
  },
  created() {
    this.getCateList();
  },
}
</script>

<style scoped lang="less">
.params{
  /deep/.el-alert__title{
    font-size: 18px;
  }
  .cat_opt{
    margin: 15px 0;
  }
  /deep/.el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
  }
}
</style>