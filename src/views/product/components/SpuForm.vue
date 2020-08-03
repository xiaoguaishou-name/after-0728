<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm,index) in trademarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input type="textarea" placeholder="SPU描述" rows="4" v-model="spuInfo.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU照片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handlerUploadSuccess"
          :file-list="spuImageList"
        >
          <!-- file-list用来指定要展示图片强所有文件列表 -->
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select 
        :placeholder="unusedBaseSaleAttrList.length > 0?`还有${unusedBaseSaleAttrList.length}个没使用`:'没有啦！！！'" 
        v-model="unusedBaseSaleAttrIdAndName">
          <el-option :label="unusedBaseSaleAttr.name" 
          :value="unusedBaseSaleAttr.id +':' + unusedBaseSaleAttr.name" 
          v-for="(unusedBaseSaleAttr,index) in unusedBaseSaleAttrList" 
          :key="unusedBaseSaleAttr.id"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>
        <el-table border style="width: 100%;margin:20px 0;" :data="spuInfo.spuSaleAttrList">
          <el-table-column type="index" label="序号" align="center" width="80"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150"></el-table-column>
          <el-table-column label="属性值名称列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue,index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false" 
                @close="row.spuSaleAttrValueList.splice(index,1)" 
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>
              <!-- 上述事件删除属性值 -->
              <el-input
                style="width:150px;"
                placeholder="请输入要增加的属性值"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handlerInputConfirm(row)"
                @blur="handlerInputConfirm(row)"
              ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 添加属性值</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{row,$index}">
              <!-- 删除属性 -->
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="spuInfo.spuSaleAttrList.splice($index,1)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSpu">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      category3Id:'',
      dialogImageUrl: "",
      dialogVisible: false,
      unusedBaseSaleAttrIdAndName: "",
      spuInfo: {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList:[]  //spu的销售属性，后期用来收集数据
      },
      spuImageList: [],
      trademarkList: [],
      baseSaleAttrList: [],
    };
  },
  methods: {
    back(){
      this.$emit('update:visible',false)
      this.$emit('cancel')
    },
     // 清空spu当前所有数据
    resetData(){
      this.category3Id = ''
      this.dialogImageUrl = ""
      this.dialogVisible = false
      this.unusedBaseSaleAttrIdAndName = ""
      this.spuInfo = {
        spuName :"",
        description : "",
        tmId : "",
        spuSaleAttrList : []  //spu的销售属性，后期用来收集数据
      },
      this.spuImageList = []
      this.trademarkList = []
      this.baseSaleAttrList = []
    },
    // 保存Spu
    async saveSpu(){
      //获取参数数据
      let {spuInfo,spuImageList,category3Id} = this
      //整合参数数据category3Id和图片
      //添加category3Id
      spuInfo.category3Id = category3Id
      // 图片的整合  图片可能是原来有的或者是自己上传的(自己上传没有，需要整理)
      spuImageList = spuImageList.map(item =>({
        imageName:item.name,
        imgUrl:item.response ? item.response.data : item.imgUrl
      }))
      spuInfo.spuImageList = spuImageList
      // 整合销售属性内部多余的数据  isEdit和saleAttrValueName
      spuInfo.spuSaleAttrList.forEach(item =>{
        delete item.isEdit
        delete item.saleAttrValueName
      })
      //发送请求
      const result = await this.$API.spu.addUpdate(spuInfo)
      if(result.code === 200){
        this.$message.success('保存成功')
        this.$emit('update:visible',false)//修改隐藏和显示的数据
        this.$emit('saveSuccess') //触发父组件保存成功返回的回调
      }else{
        this.$message.error('保存失败')
      }
    },
    // 回车或失去焦点后
    handlerInputConfirm(row){
      let {saleAttrValueName,baseSaleAttrId} = row
      // 判断不能为空
      if(!saleAttrValueName) return
      // 重复的属性不能再添加
      let isRepeat = row.spuSaleAttrValueList.some(item => {
        item.saleAttrValueName === saleAttrValueName
      })
      if(isRepeat){
        this.$message.warning('属性值不能重复')
        return
      }
      row.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      })
      row.isEdit = false
      row.saleAttrValueName = ''
    },
    // 点击添加属性值的按钮切换为编辑模式   输入框
    showInput(row){
      // 设置响应式属性数据
      this.$set(row,'isEdit',true)
      // 自动获取焦点
      this.$nextTick(()=>{
        this.$refs.saveTagInput.focus()
      })  
    },
    // 添加销售属性
    addSaleAttr(){
      let [baseSaleAttrId,saleAttrName] = this.unusedBaseSaleAttrIdAndName.split(':')
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList:[]
      })
      this.unusedBaseSaleAttrIdAndName = ''   //清空select选中项
    },
    async initUpdateSpuForm(spuId,category3Id) {
      this.category3Id = category3Id
      //发送四个请求获取初始化数据
      //1.获取对应的spu详情信息
      const spuinfoResult = await this.$API.spu.getSpuById(spuId);
      if (spuinfoResult.code === 200) {
        this.spuInfo = spuinfoResult.data;
      }
      //2.获取对应的spu图片列表(sku里写api请求)
      const imageResult = await this.$API.sku.getSpuImageList(spuId);
      if (imageResult.code === 200) {
        let spuImageList = imageResult.data;
        spuImageList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageList;
      }
      //3.所有品牌信息
      const trademarkResult = await this.$API.trademark.getAll();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }
      //4.所有spu基础销售属性
      const spubaseSaleResult = await this.$API.spu.getBaseSaleAttrList();
      if (spubaseSaleResult.code === 200) {
        this.baseSaleAttrList = spubaseSaleResult.data;
      }
    },
    async initShowSpuForm(category3Id) {
      this.category3Id = category3Id
      //1.所有品牌信息
      const trademarkResult = await this.$API.trademark.getAll();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }
      //2.所有spu基础销售属性
      const spubaseSaleResult = await this.$API.spu.getBaseSaleAttrList();
      if (spubaseSaleResult.code === 200) {
        this.baseSaleAttrList = spubaseSaleResult.data;
      }
    },
    //删除图片的回调
    handleRemove(file, fileList) {
      //file 被删除的那一张图片信息
      //fileList 删除过后剩余的图片列表
      // console.log(file, fileList);
      this.spuImageList = fileList
    },
    // 放大图片的回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 上传成功的回调
    handlerUploadSuccess(response,file,fileList){
      this.spuImageList = fileList
    }
  },
  computed:{
    //计算未使用的基础销售属性列表
    //根据俩个数组计算，一个是所有的基础销售属性数组baseSaleAttrList，另一个是spu的销售属性数组spuInfo.spuSaleAttrList
    unusedBaseSaleAttrList(){
      return this.baseSaleAttrList.filter(baseSaleAttr =>this.spuInfo.spuSaleAttrList.every(spuSaleAttr =>spuSaleAttr.saleAttrName !== baseSaleAttr.name))
    }
  }
};
</script>

<style lang="less" scoped>
</style>