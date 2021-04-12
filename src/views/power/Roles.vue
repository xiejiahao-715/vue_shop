<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }" @click.native="$store.commit('setActivePath','')">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表区域-->
      <el-table
          ref="rolesRef"
          @expand-change="expandChange"
          border stripe
          :data="roleList">
        <!--  展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children"
                    :class="['bdBottom',index1 === 0 ? 'bdTop' : '','vcenter']"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <el-row v-for="(item2,index2) in item1.children"
                        :class="[index2 === 0 ? '' : 'bdTop','vcenter']"
                        :key="item2.id">
                  <el-col :span="6">
                    <!--渲染二级权限-->
                    <el-tag
                        closable
                        @close="removeRightById(scope.row,item2.id)"
                        type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--渲染三级权限-->
                    <el-tag v-for="item3 in item2.children"
                            closable
                            @close="removeRightById(scope.row,item3.id)"
                            type="warning"
                            :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--  索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限的对话框-->
    <el-dialog
        :close-on-click-modal="false"
        @close="setRightDialogClosed"
        title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!--树形控件-->
      <el-tree
          ref="treeRef"
          :default-checked-keys="defKeys"
          show-checkbox node-key="id" default-expand-all
          :data="rightsList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {get, Delete, post} from '@/network/request'
export default {
  name: "Roles",
  data(){
    return {
      // 所有角色列表区域
      roleList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList();
  },
  methods:{
    // 使权限列表的展开为手风琴模式(即最多就保持一个展开)
    expandChange(row,expandedRows){
      // 原理是每一次展开一行向expandedRows队尾添加数据，关闭上一个打开的展开行保证打开的个数不超过一个
      if(expandedRows.length > 1){
        this.$refs.rolesRef.toggleRowExpansion(expandedRows[0],false);
      }
    },
    // 获取所有角色的列表
    getRolesList(){
      get({
        url:'roles'
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.roleList = res.data;
        }
        else{
          this.$message({type:'error',duration:1000,center:true,message:'获取角色列表失败',showClose:true});
        }
      })
    },
    // 根据Id删除对应的权限
    removeRightById(role,rightId){
      this.$confirm('此操作将永久删除该文件,是否继续?','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).then(()=>{
          // this.$message({type:'success',message:'确认了删除',duration:1000,showClose:true,center:true});
        Delete({
          url:`roles/${role.id}/rights/${rightId}`
        }).then(res=>{
          res = res.data;
          if(res.meta.status === 200){
            this.$message({type:'success',message:'删除权限成功',duration:1000,showClose:true,center:true});
            role.children = res.data
          }
          else{
            this.$message({type:'error',message:'删除权限失败',duration:1000,showClose:true,center:true});
          }
        }).catch(()=>{
          this.$message({type:'error',message:'无法连接到服务器',duration:1000,showClose:true,center:true});
        })
      }).catch(()=>{
        this.$message({type:'info',message:'取消了删除操作',duration:1000,showClose:true,center:true});
      })
    },
    // 展示分配权限的对话框
    showSetRightDialog(role){
      this.roleId = role.id;
      // 获取所有权限的数据
      get({
        url: `rights/tree`
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.rightsList = res.data;
          // 递归获取三级节点的Id
          this.getLeafKeys(role,this.defKeys);
        }
        else{
          this.$message({type:'error',duration:1000,center:true,message:'获取权限数据失败',showClose:true});
        }
      })
      this.setRightDialogVisible = true;
    },
    // 通过递归的形式获取角色下所有三级全向的id，并保存到defKeys数组中
    getLeafKeys(node, arr){
      // 如果当前node节点不包含children属性，则为三级节点
      if(!node.children){
        return arr.push(node.id);
      }
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr);
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = [];
    },
    // 点击对话框确定按钮时为角色分配权限
    allotRights(){
      const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',');
      post({
        url: `roles/${this.roleId}/rights`,
        data:{
          rids: idStr
        }
      }).then(res=>{
        res = res.data;
        if(res.meta.status === 200){
          this.$message({type:'success',duration:1000,center:true,message:'分配权限成功',showClose:true});
          this.getRolesList();
          this.setRightDialogVisible = false;
        }
        else{
          this.$message({type:'error',duration:1000,center:true,message:'分配权限失败',showClose:true});
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.el-tag{
  margin: 7px;
}
.bdTop{
  border-top: 1px solid #eee;
}
.bdBottom{
  border-bottom: 1px solid #eee;
}
//垂直方向的居中对齐
.vcenter{
  display: flex;
  align-items: center;
}
</style>