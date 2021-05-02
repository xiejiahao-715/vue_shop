<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <tree-table
          class="treeTable"
          :data="categoriesList"
          :columns="columns"
          show-index
          index-text="#"
          border
          :show-row-hover="false"
          :selection-type="false"
          :expand-type="false">
        <!--是否有效-->
        <template #isOk="scope">
          <i class="el-icon-success"
             style="color: lightgreen;"
             v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error"
             style="color: red;"
             v-else></i>
        </template>
        <!--排序列-->
        <template #order="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!--操作列-->
        <template v-slot:opt>
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!--分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3,5,10,15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <!--添加分类的对话框-->
    <el-dialog
        width="50%"
        title="添加分类"
        @close="addCateDialogClosed"
        :close-on-click-modal="false"
        :visible.sync="addCateDialogVisible">
      <!--添加分类的表单-->
      <el-form
          label-width="100px"
          ref="addCateFormRef"
          :rules="addCateFormRules"
          :model="addCateForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
              v-model="selectedKeys"
              :props="cascaderProps"
              :options="parentCateList"
              @change="parentCateChanged"
              clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {get,post} from '@/network/request'
export default {
  name: "Categories",
  data(){
    return{
      // 商品分类的数据列表
      categoriesList: [],
      // 查询条件
      queryInfo:{
        type: 3,
        pagenum: 1,
        pagesize:5
      },
      // 总数据条数
      total:0,
      // 为table指定列的定义
      columns: [
        {label:'分类名称',prop:'cat_name'},
        {label:'是否有效',type:'template',template:'isOk'},
        {label:'排序',type: 'template',template:'order'},
        {label:'操作',type: 'template',template:'opt'}
      ],
      loading: false,
      // 控制分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm:{
        // 将要添加分类的名称
        cat_name: '',
        // 父级分类的的Id
        cat_pid: 0,
        // 分类层级,默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类的
      addCateFormRules:{
        cat_name:[
          {required: true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps:{
        value: 'cat_id',
        label: 'cat_name',
        children:'children',
        expandTrigger: 'hover',
        // 只有点击选项上的圆圈才能算是选择上
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCategoriesList();
  },
  methods:{
    // 获取商品分类数据
    getCategoriesList(){
      this.loading = true;
      get({
        url: 'categories',
        params: this.queryInfo
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.categoriesList = res.data.result;
          this.total = res.data.total;
          this.loading = false;
        }
        else this.$message.error('获取商品分类数据失败');
        this.loading = false;
      })
    },
    // 监听pagesize改变
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getCategoriesList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage;
      this.getCategoriesList();
    },
    // 点击按钮展示添加分类的对话框
    showAddCateDialog(){
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList(){
      const {data:res} = await get({
        url:'categories',
        parms:{
          type: 2
        }
      })
      if(res.meta.status === 200){
        this.parentCateList = res.data;
      }
      else {
        this.$message.error('获取父级分类数据失败');
      }
    },
    // 选择项发生变化触发这个函数
    parentCateChanged(){
      if(this.selectedKeys.length >0){
        // 获取数据的最后一项（父级分类的id）
        this.addCateForm.cat_pid = this.selectedKeys.slice(-1)[0];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
      }
      else{
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定按钮添加新的分类
    addCate(){
      this.$refs.addCateFormRef.validate(valid=>{
        if(!valid) return;
        post({
          url: 'categories',
          data: this.addCateForm
        }).then(res=>{
          res = res.data;
          if(res.meta.status === 201){
            this.$message.success('添加分类成功');
            this.getCategoriesList();
            this.addCateDialogVisible = false;
          }
          else{
            this.$message.error('添加分类失败')
          }
        })
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  }
}
</script>

<style scoped lang="less">
.treeTable{
  margin-top:15px;
}
.el-cascader{
  width: 100%;
}
</style>