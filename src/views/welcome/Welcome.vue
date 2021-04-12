<template>
  <div>
    <h1>上传组件</h1>
    <el-upload
        ref="upload"
        class="upload-demo"
        drag
        action="http://127.0.0.1:5000/api/upload">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped lang="less">

</style>