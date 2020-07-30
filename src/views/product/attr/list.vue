<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="isShowDialog">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addValue"
        >添加属性</el-button>
        <el-table :data="attrList" border style="width: 100%;margin:20px 0">
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column prop="prop" label="属性值列表">
            <template slot-scope="{row,$index}">
              <el-tag
                :type="color[Math.floor(Math.random()*5)]"
                v-for="(attrValue,index) in row.attrValueList"
                :key="attrValue.id"
                style="margin:4px 5px;"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton icon="el-icon-edit" type="warning" title="修改"></HintButton>
              <HintButton icon="el-icon-delete" type="danger" title="删除"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowDialog">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrForm.attrName"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowDialog = true">取消</el-button>
        <el-table :data="attrForm.attrValueList" border style="width: 100%;margin:20px 0;">
          <el-table-column type="index" label="序号" width="80"></el-table-column>
          <el-table-column width="width" label="属性值名称">
            <template slot-scope="{row,$index}">
              <el-input v-model="row.valueName" placeholder="请输入属性值名称"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <HintButton icon="el-icon-delete" type="danger" title="删除"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" :disabled="!attrForm.attrName" @click="addValueName">保存</el-button>
        <el-button @click="isShowDialog = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AttrList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      color: ["info", "warning", "danger", "primary", "success"],
      isShowDialog: true,
      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
      },
    };
  },
  methods: {
    handlerCategory({ categoryId, level }) {
      if (level === 1) {
        //清空之前保留的2级及3级id以及之前请求的attrList
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        //如果选中了三级，父组件会接收到3级id，代表要发请求，拿属性列表数据
        //三级被传过来，证明12级已经被传过来存储了
        //此时请求最佳
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    // 发请求属性列表数据
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
    // 添加属性时，清空上一次的信息并显示添加属性页面
    addValue() {
      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
      this.isShowDialog = false;
    },
    // 添加属性名后，出现输入框
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: "",
      });
    },
    //添加属性值更新到页面
    async addValueName() {
      const result = await this.$API.attr.addOrUpdate(this.attrForm);
      if (result.code === 200) {
        this.$message.success("good");
        this.isShowDialog = true;
      }
    },
  },
};
</script>
