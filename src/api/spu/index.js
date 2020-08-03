import request from '@/utils/request'
const api_name = '/admin/product'
export default {
  //请求基本商品销售属性
  getBaseSaleAttrList() {
     return request({
      url:`${api_name}/baseSaleAttrList`,
      method:'get'
     })
  },
  //请求删除spu
  deleteSpu(spuId) {
    return request({
      url: `${api_name}/deleteSpu/${spuId}`,
      method:'delete'
    })
  },
  //请求获取spu基本信息
  getSpuById(spuId) {
    return request({
      url: `${api_name}/getSpuById/${spuId}`,
      method:'get'
    })
  },
  // //请求添加spu数据
  // getAddSpuInfo(data) {
  //   return request({
  //     url: `${api_name}/saveSpuInfo`,
  //     method: 'post',
  //     data
  //   })
  // },
  // //请求修改spu数据
  // updateSpuInfo(data) {
  //   return request({
  //     url: `${api_name}/updateSpuInfo`,
  //     method: 'post',
  //     data
  //   })
  // },
  addUpdate(spuInfo) {
    return request.post(`/admin/product/${spuInfo.id ? 'update' : 'save'}SpuInfo`, spuInfo)
  },
  //请求spu分页列表数据
  getSpuList(page,limit,category3Id) {
    return request({
      url: `${api_name}/${page}/${limit}?category3Id=${category3Id}`,
      method:'get'
    })
  }
}