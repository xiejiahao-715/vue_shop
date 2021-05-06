<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单列表数据-->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template #default="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default>
            <el-button @click="showBox" size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button @click="showProgressBox" size="mini" type="success" icon="el-icon-location"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5,10,15]"
          :page-size="queryInfo.pagesize"
          layout="total,sizes,prev,pager,next,jumper"
          :total="total"></el-pagination>
    </el-card>

    <!--修改地址的对话框-->
    <el-dialog
        title="修改地址"
        :close-on-click-modal="false"
        :visible.sync="addressVisible"
        @close="addressDialogClosed"
        width="50%">
      <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressFormRules"
          label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
              :options="cityData" clearable
              v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button @click="addressVisible = false" type="primary">确 定</el-button>
      </template>
    </el-dialog>

    <!--物流进度对话框-->
    <el-dialog
        title="物流进度"
        :close-on-click-modal="false"
        :visible.sync="progressVisible"
        width="50%">
      <!--时间线-->
      <el-timeline :reverse="true">
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import {get} from '@/network/request'
import cityData from '@/views/order/citydata'
import progressData from "@/views/order/progressData";
export default {
  name: "Orders",
  data(){
    return {
      queryInfo:{
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{type:'array',required: true,message:'请选择省市区/县',trigger:'change'}],
        address2: [{required: true,message:'请填写详细地址',trigger:'blur'}]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList();
  },
  methods:{
    async getOrderList(){
      const {data:res} = await get({
        url: `orders`,
        params:this.queryInfo
      });
      if(res.meta.status === 200){
        this.total = res.data.total;
        this.orderList = res.data.goods;
      }
      else{
        return this.$message.error('获取订单列表失败!');
      }
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox(){
      this.addressVisible = true;
    },
    addressDialogClosed(){
      this.$refs.addressFormRef.resetFields();
    },
    showProgressBox(){
      get({
        url: "/kuaidi"
      }).then(()=>{
        this.progressInfo = progressData;
        this.progressVisible = true;
      }).catch(()=>{
        this.$message.error('连接服务器失败，无法获取物流进度');
      })
    }
  }
}
</script>

<style scoped lang="less">
.el-cascader{
  width: 100%;
}
</style>