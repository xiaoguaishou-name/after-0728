<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
    <el-table :data="trademarkList" border stripe style="width: 100%;margin:20px 0">
      <el-table-column align="center" label="序号" type="index" width="80"></el-table-column>
      <el-table-column label="品牌名称" prop="tmName" width="width"></el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <!-- table的每一列都是暗含了遍历我们的trademarkList，
        默认情况下你只要给这个列要显示的对象的对应属性，
        就会展示对应这个属性的属性值 。但是如果你要修改这个数据的结构
        那么必须使用作用域插槽的用法-->
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" style="width:100px;height:60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template slot-scope="{row,$index}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
          >删除</el-button>
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
      @current-change="getTrademarkList"
    ></el-pagination>
    <!-- 添加和修改使用的dialog -->
    <el-dialog :title="`${form.id?'修改':'添加'}`" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%" :rules="rules" ref="form">
        <el-form-item label="品牌名称" :label-width="formLabelWidth" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth" prop="logoUrl">
          <!-- 上传图片接口地址，需要通过转发去到真实的接口地址 -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      isShowDialog: false,
      formLabelWidth: "100px",
      form: {
        tmName: "",
        logoUrl: "", //上传成功手机返回的图片路径
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        logoUrl: [{ required: true, message: "请上传图片", trigger: "change" }],
      },
    };
  },
  // 测试
  // mounted(){
  //   this.$API.trademark.getPageList(1,3)
  // }
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    showAddDialog() {
      //每次点开dialog就把form清空,保证每次弹出来都是新的form
      this.form = {
        tmName: "",
        logoUrl: "",
      };
      this.isShowDialog = true;
    },
    // 点击修改
    showUpdateDialog(trademark) {
      // this.form = trademark   //添加的时候弹出dialog需要全部清空，但是修改的时候是修改哪一条，form就是谁
      this.form = { ...trademark }; //浅拷贝
      this.isShowDialog = true;
    },
    //点击删除
    deleteTrademark(trademark) {
      this.$confirm(`你想删除${trademark.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const result = await this.$API.trademark.delete(trademark.id);
          if (result.code === 200) {
            this.$message.success("删除品牌成功!"),
              this.getTrademarkList(
                this.trademarkList.length > 1 ? this.page : this.page - 1
              );
          } else {
            this.$message.error("删除品牌失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //上传成功调用
    handleLogoSuccess(res, file) {
      // this.form.logoUrl = URL.createObjectURL(file.raw); //其实本质还是拿的本地的文件路径，我们不要这个
      this.form.logoUrl = res.data; //这个存储的就是上传成功，服务器返回的真实线上路径
      console.log(this.form.logoUrl);
    },
    // 上传之前调用，一般是在上传前对文件做限制用的
    beforeLogoUpload(file) {
      const TypeArr = ["image/jpeg", "image/png"];
      const isJPGOrPNG = TypeArr.indexOf(file.type) !== -1;
      const isLt500k = file.size / 1024 < 500;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG或PNG 格式!");
      }
      if (!isLt500k) {
        this.$message.error("上传头像图片大小不能超过 500k!");
      }
      return isJPGOrPNG && isLt500k; //返回布尔值，为真上传，为假则报错
    },
    addOrUpdateTradeMark() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          // 1.收集参数
          let trademark = this.form;
          // 2.发请求
          const result = await this.$API.trademark.addOrUpdate(trademark);
          if (result.code === 200) {
            this.$message.success(`${trademark.id ? "修改" : "添加"}品牌成功`);
            this.getTrademarkList(trademark.id ? this.page : 1); //重新加载数据，默认添加的品牌在最后,回到第一页；如果是修改就停留在当前页
            this.isShowDialog = false;
          } else {
            this.$message.info(`${trademark.id ? "修改" : "添加"}品牌失败`);
          }
        } else {
          alert("验证失败");
          return false;
        }
      });
    },
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>