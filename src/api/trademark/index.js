import request from '@/utils/request'

const api_name = '/admin/product/baseTrademark'

export default {
  /*
  获取品牌分页列表
  */
  getPageList(page, limit) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
    })
  },
  //增加或者修改品牌
  addOrUpdate(trademark) {
    if (trademark.id) {
      return request({
        url: `${api_name}/update`,
        method: 'put',
        data: trademark
      })
    } else {
      return request({
        url: `${api_name}/save`,
        method: 'post',
        data: trademark
      })
    }
  },
  //删除品牌
  delete(id) {
    return request({
      url: `${api_name}/remove/${id}`,
      method: 'delete'
    })
  }
}