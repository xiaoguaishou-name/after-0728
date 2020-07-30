<template>
  <div>
    <el-form :inline="true" :model="cForm" class="demo-form-inline">
      <el-form-item label="一级分类">
        <el-select v-model="cForm.category1Id" placeholder="请选择一级分类" @change="handlerC1">
          <el-option 
          :label="c1.name" :value="c1.id" 
          v-for="(c1,index) in category1List" :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select v-model="cForm.category2Id" placeholder="请选择二级分类" @change="handlerC2">
          <el-option :label="c2.name" :value="c2.id" v-for="(c2,index) in category2List" :key="c2.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="cForm.category3Id" placeholder="请选择三级分类" @change="handlerC3">
          <el-option :label="c3.name" :value="c3.id" v-for="(c3,index) in category3List" :key="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelector",
  data(){
    return{
      cForm:{
        category1Id:'',
        category2Id:'',
        category3Id:''
      },
      category1List:[],
      category2List:[],
      category3List:[],
    }
  },
  mounted(){
    this.getCategory1List()
  },
  methods:{
    // 请求一级分类列表数据
     async getCategory1List(){
      const result = await this.$API.category.getCategorys1()
      if(result.code === 200){
        this.category1List = result.data
      }
    },
    // 点击一级列表下拉框后，请求二级分类列表数据
    async handlerC1(category1Id){
      // console.log('111')
      // 选中一级分类时，清空二三级分类列表
      this.cForm.category2Id = ''
      this.cForm.category3Id = ''
      // console.log(this.cForm.category3Id)
      this.category2List = []
      this.category3List = []
      //向父传递选中的1级分类id
      this.$emit('handlerCategory',{categoryId:category1Id,level:1})
      const result = await this.$API.category.getCategorys2(category1Id)
      if(result.code === 200){
        this.category2List = result.data
      }
    },
    //点击二级列表下拉框后，请求三级分类列表数据
    async handlerC2(category2Id){
      // 选中二级分类列表数据时，清空三级分类列表
      this.cForm.category3Id = ''
      this.category3List = []
      this.$emit('handlerCategory',{categoryId:category2Id,level:2})
      const result = await this.$API.category.getCategorys3(category2Id)
      if(result.code === 200){
        this.category3List = result.data
      }
    },
    // 点击三级列表时自定义事件通知父组件
    handlerC3(category3Id){
      this.$emit('handlerCategory',{categoryId:category3Id,level:3})  
    }
  }
 
};
</script>

<style>
</style>