<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="report" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1.导入Echarts
import * as echarts from 'echarts';
import {get} from '@/network/request'
import _ from 'lodash'
export default {
  name: "Reports",
  // 此时页面上的元素已经被渲染完毕了
  data(){
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  mounted(){
    // 3.基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById('report'));

    get({
      url: `reports/type/1`
    }).then(res=>{
      res = res.data;
      if(res.meta.status === 200){
        // 4.准备数据和配置项
        const result = _.merge(res.data,this.options);

        // 5.绘制图表
        myChart.setOption(result);
      }
      else{
        this.$message.error('获取折线图数据失败!')
      }
    })

  }
}
</script>

<style scoped>

</style>