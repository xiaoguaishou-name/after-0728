import request from '@/utils/request'

const api_name = '/admin/product'

export default {
  // GET / admin / product / spuImageList / {
  //   spuId
  // }
  //获取spu图片列表
  getSpuImageList(spuId) {
    return request({
      url: `${api_name}/spuImageList/${spuId}`,
      method:'get'
    })
  },
}

