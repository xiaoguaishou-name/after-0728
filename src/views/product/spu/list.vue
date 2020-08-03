<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowDialog="isShowDialog"></CategorySelector>
    </el-card>

    <el-card style="margin:20px 0;">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button type="primary" icon="el-icon-plus" @click="showSpuForm">添加SPU</el-button>
        <el-table :data="spuList" border stripe style="width: 100%;margin:20px 0;">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width"></el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width"></el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-button type="primary" title="添加SKU" icon="el-icon-plus" @click="showSkuForm"></el-button>
              <el-button type="primary" title="修改SPU" icon="el-icon-edit" @click="showUpdateSpuForm(row.id)"></el-button>
              <el-button type="info" title="查看所有SKU" icon="el-icon-info"></el-button>
              <el-button type="danger" title="删除SPU" icon="el-icon-delete"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align:center"
          background
          :current-page="page"
          :page-sizes="[3,5,7]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="getSpuList"
        ></el-pagination>
      </div>
      <div>
        <SpuForm v-show="isShowSpuForm" 
        :visible.sync="isShowSpuForm" 
        ref="spu" @saveSuccess="saveSuccess"
        @cancel="cancel"></SpuForm>
      </div>
      <div>
        <SkuForm v-show="isShowSkuForm"></SkuForm>
      </div>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "@/views/product/components/SpuForm";
import SkuForm from "@/views/product/components/SkuForm";
export default {
  name: "SpuList",
  data() {
    return {
      isShowDialog: true,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 3,
      total: 3,
      isShowSkuForm:false,
      isShowSpuForm:false
    };
  },
  methods: {
    cancel(){
      // 点击返回列表返回
      this.$refs.spu.resetData()
      this.skuId = null  //需要再次清空标识
    },
   
    saveSuccess(){
      // 从哪返回来的
      if(this.skuId){
        // 修改
        this.getSpuList(this.page)
        // 清空当前spu组件的所有数据
      }else{
        // 添加
        this.getSpuList()
        // 清空当前spu组件的所有数据
      }
      this.$refs.spu.resetData()
      this.skuId = null
    },
    handlerCategory({ categoryId, level }) {
      if (level === 1) {
        //清空之前保留的2级及3级id以及之前请求的attrList
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.spuList = [];
        this.category2Id = categoryId;
      } else {
        //如果选中了三级，父组件会接收到3级id，代表要发请求，拿属性列表数据
        //三级被传过来，证明12级已经被传过来存储了
        //此时请求最佳
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    // 发请求属性列表数据
    async getSpuList(page = 1) {
      this.page = page;
      const result = await this.$API.spu.getSpuList(
        this.page,
        this.limit,
        this.category3Id
      );
      if (result.code === 200) {
        let { records, total } = result.data;
        this.spuList = records;
        this.total = total;
      }
    },
    showSkuForm(){
      this.isShowSkuForm = true
    },
    // 添加
    showSpuForm(){
      this.isShowSpuForm = true
      this.$refs.spu.initShowSpuForm(this.category3Id)
    },
    // 修改
    showUpdateSpuForm(spuId){
      this.isShowSpuForm = true
      this.spuId = spuId  //标识，区分是从添加还是修改跳转过去的
      // 在父组件中找到子组件对象，调用子组件的方法，去发送请求获取初始展示数据
      //为什么要这样做？我们需要把点击的这个spu的id传递过去
      this.$refs.spu.initUpdateSpuForm(spuId,this.category3Id)
    }
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>
