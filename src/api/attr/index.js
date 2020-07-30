import request from '@/utils/request'
const api_name = '/admin/product'
export default {
  // GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  // 请求全部商品属性数据
  getList(category1Id,category2Id,category3Id) {
    return request({
      url: `${api_name}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
      method:'get'
    })
  },
  // 请求添加或修改商品属性数据
  // POST /admin/product/saveAttrInfo
  addOrUpdate(data) {
    return request({
      url: `${api_name}/saveAttrInfo`,
      method: 'post',
      data
    })
  },
  // 请求删除商品属性
  // DELETE /admin/product/deleteAttr/{attrId}
  getDelete(attrId) {
    return request({
      url: `${api_name}/deleteAttr/${attrId}`,
      method:'delete'
    })
  }
}