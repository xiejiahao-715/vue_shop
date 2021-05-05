<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable @clear="getGoodsList">
            <template #append>
              <el-button icon="el-icon-search" @click="getGoodsList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--表格区域-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" align="center"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="200px" align="center"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="200px" align="center"></el-table-column>
        <el-table-column label="创建时间" width="200px" align="center">
          <template #default="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px" align="center">
          <template #default="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button @click="removeById(scope.row.goods_id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5,10,15,20]"
          :page-size="queryInfo.pagesize"
          layout="total,sizes,prev,pager,next,jumper"
          :total="total" background></el-pagination>
    </el-card>
  </div>
</template>

<script>
import {get,Delete} from '@/network/request'

export default {
  name: "List",
  data(){
    return{
      queryInfo:{
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 商品的总个数
      total: 0,
    }
  },
  created() {
    this.getGoodsList();
  },
  methods:{
    // 根据页面获取对应的商品列表
    async getGoodsList(){
      const {data:res} = await get({
        url: `goods`,
        params: this.queryInfo
      });
      if(res.meta.status === 200){
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      }
      else{
        return this.$message.error('获取商品列表失败!');
      }
    },
    // 当页面显示数据的大小改变时触发
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 当页码值发生变化时触发
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 点击删除按钮删除该商品
    async removeById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该商品,是否继续?','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type:'warning'
      }).catch(err=>err);
      if(confirmResult !== 'confirm'){
        return this.$message.info('已经取消删除');
      }
      const {data:res} = await Delete({
        url:`goods/${id}`
      });
      if(res.meta.status === 200){
        this.$message.success('删除成功');
        await this.getGoodsList();
      }
      else{
        return this.$message.error('删除失败');
      }
    },
    // 点击按钮跳转添加商品的页面
    goAddPage(){
      this.$router.push('/goods/add');
    }
  },
  filters:{
    // 将秒切换为实际时间的过滤器
    dateFormat(originVal){
      const date = new Date(originVal);
      // 获取年月日时分秒，不足两位高位填0
      const year = date.getFullYear();
      const month = (date.getMonth()+ 1 + '').padStart(2,'0');
      const day = (date.getDate() + '').padStart(2,'0');
      const hour = (date.getHours()+'').padStart(2,'0');
      const minute = (date.getMinutes()+ '').padStart(2,'0');
      const second = (date.getSeconds()+ '').padStart(2,'0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
  },
  watch:{
    'queryInfo.query':{
      handler(newValue,oldValue){
        if(newValue === '' && oldValue !== ''){
          this.getGoodsList();
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="less">

</style>