<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowDialog="isShowDialog"></CategorySelector>
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
              <HintButton icon="el-icon-edit" type="warning" title="修改" @click="showUpdateDiv(row)"></HintButton>
              <HintButton icon="el-icon-delete" type="danger" title="删除" @click="deleteAttr(row)"></HintButton>
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
              <el-input
                v-if="row.isEdit"
                :ref="$index"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display:inline-block;width:100%;height:100%;"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm
                :title="`你确定要删除${row.valueName}吗？`"
                @onConfirm="attrForm.attrValueList.splice($index,1)"
              >
                <HintButton icon="el-icon-delete" slot="reference" type="danger" title="删除"></HintButton>
              </el-popconfirm>
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
import cloneDeep from "lodash/cloneDeep";
import { attr } from "../../../api";
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
        // 修改时要传入的属性值
        isEdit: true,
      });
      // 让对应的input自动的获取到焦点,其实就是新添加的那一个属性值对应的input，永远在最后一个
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    //添加或修改属性值更新到页面
    async addValueName() {
      // 整理数据：1.当前属性值列表没有属性值对象，不发请求
      if (this.attrForm.attrValueList.length === 0) return;
      // 2.空串和后台不需要的数据（比如isEdit）过滤
      this.attrForm.attrValueList = this.attrForm.attrValueList.filter(
        (item) => {
          if (item.valueName.trim() !== "") {
            delete item.isEdit;
            return true;
          } else {
            this.$message.warning("属性值内容不得为空");
          }
        }
      );
      if (this.attrForm.attrValueList.length !== 0) {
        const result = await this.$API.attr.addOrUpdate(this.attrForm);
        if (result.code === 200) {
          this.$message.success("保存属性成功");
          this.getAttrList();
          this.isShowDialog = true;
        } else {
          this.$message.error("保存失败");
        }
      }
    },
    //修改
    showUpdateDiv(attr) {
      //this.attrForm = {...attr}  //浅拷贝只能搞定基本数据类型，但搞不定对象当中还是对象的数据类型（因为是地址，拷贝过去还是地址）
      // 这里我们需要使用深拷贝
      this.attrForm = cloneDeep(attr);
      this.isShowDialog = false;
      // 给修改的每个属性里面的每个属性值，添加编辑和查看的表示数据
      this.attrForm.attrValueList.forEach((item) => {
        // item.isEdit = false  //这里是有问题的,因为后添加的isEdit不是响应式数据，后期会导致页面不更新
        this.$set(item, "isEdit", false);
      });
    },
    // 点击某个属性值对应的span变为编辑模式
    toEdit(attrValue, index) {
      attrValue.isEdit = true;
      //让对应的input自动获取到焦点,必须在nextTick当中去做，原因是页面可能还没有更新完成
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 失去焦点和按下enter后又变为查看模式
    toLook(attrValue) {
      //输入的值有没有，没有不能变为查看模式
      if (!attrValue.valueName) return;
      //如果输入的值已存在(除去自身)，那么不能回到查看模式
      //some方法循环遍历 每一个项都要去执行一次回调函数,返回值是布尔值，只要有一个是真，那最终结果就是真
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        // 除去自身
        if (item !== attrValue) {
          return item.valueName === attrValue.valueName;
        }
      });
      if (isRepeat) {
        this.$message.warning("已经存在此属性值");
        return;
      }
      //如果上面所有条件都不符合，那么更改为查看模式
      attrValue.isEdit = false;
    },
    // 删除属性(需要发请求)
    deleteAttr(attr) {
      this.$API.attr
        .delete(attr.id)
        .then((result) => {
          if (result.code === 200) {
            this.$message.success("删除属性成功");
            this.getAttrList();
          } else {
            this.$message.info("删除属性失败");
          }
        })
        .catch((error) => {
          this.$message.error("请求失败");
        });
    },
  },
};
</script>
