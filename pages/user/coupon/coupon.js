// pages/user/coupon/coupon.js
const app = getApp()
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var util = require('../../../utils/util.js');
//var uuid = '327f9390d11d4a3aa0ff712d656a7252'
Page({
  data: {
    pagenumber: 1,
    pagesize: 999,
    uuid: '',
    hasMoreData: true,
    contentlist: [],
    type:{},
  },
  getMoreInfo: function (message) {//从我的页面进入
    var that = this;
    var param = {
      "pagenumber": this.data.pagenumber,
      "pagesize": this.data.pagesize,
      "uuid": uuid
    }
    // 获取优惠券
    wx.request({
      url: textUrl + 'user/myCouponList',
      data: param,
      method: "post",
      header: {
        "Content-Type": "application/json;charset=UTF-8"  //post
      },
      complete: function (res) {
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        var datalist = res.data.datalist;
        console.log(datalist)
        var datalistNew = [];
        for (let i = 0; i < datalist.length; i++) {
          var data = new Object();
          data.amount = datalist[i].amount;
          data.title = datalist[i].title;
          data.id = datalist[i].id;
          data.buy_amount = datalist[i].buy_amount;
          data.type = datalist[i].type 
          data.discount = datalist[i].discount 
          if (datalist[i].type == "money"){//满减
            data.mjdesc = '满' + datalist[i].buy_amount + '减' + datalist[i].amount;
          } else if (datalist[i].type == "discount"){//打折
            data.mjdesc = '满' + datalist[i].buy_amount + '打' + datalist[i].discount*0.1 +'折';
          }
          
          data.time = datalist[i].apply_date +'&'+ datalist[i].invalid_date;

          if (datalist[i].ranges == null) {
            data.desc = '仅限无人货架使用';
          } else {
            data.desc = datalist[i].ranges;
          }
          if (datalist[i].is_expired == true) {
            data.use = '已失效'
            data.useStyle = false
          } else {
            if (datalist[i].is_used == true) {
              data.use = '已使用'
              data.useStyle = false
            } else {
              data.use = '立即使用'
              data.useStyle = true
            }
          }
          datalistNew.push(data)
          //console.log(datalistNew)
        }
        var contentlistTem = that.data.contentlist
        var contentlist = datalistNew;
        if (contentlist.length < that.data.pageSize) {
          that.setData({
            contentlist: contentlistTem.concat(contentlist),
            hasMoreData: false
          })
        } else {
          that.setData({
            contentlist: contentlistTem.concat(contentlist),
            hasMoreData: true,
            pagenumber: that.data.pagenumber + 1
          })
        }
      }
    })
  },
  onLoad: function (options) {
    var that = this
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    // var uuid = wx.getStorageSync('userarg') || ''
    // console.log(uuid)
    this.setData({                // 最后赋值到data中渲染到页面
      uuid: uuid
    });
    //console.log(options)
   
   
    // if (options.type=='available'){//订单页进入优惠券(读取本地存储可用优惠券)
    //   that.getLocalCoupon()
    // }else{
    //   this.setData({
    //     type: options.type,
    //   })
    //   var cartItems = wx.getStorageSync('cartItems')//所有商品缓存数据
    //   if (cartItems) {
    //     wx.removeStorage({
    //       key: 'cartItems',
    //       success: function (res) {
    //       }
    //     })
    //   }
    //   that.getMoreInfo('正在加载数据...')
    // }
    // this.setData({
    //   type: options.type,
    // })
    if (options.type == 'available') {//订单页进入优惠券(读取本地存储可用优惠券)
      this.setData({
        type: options.type,
      })
    }else{
      this.setData({
        type: null,
      })
    }
    console.log(this.data.type)
    
  },
  onShow: function () {
    var that = this
    var options= this.data.type
    if (options) {//订单页进入优惠券(读取本地存储可用优惠券)
      that.getLocalCoupon()
    } else {
      
      var cartItems = wx.getStorageSync('cartItems')//所有商品缓存数据
      if (cartItems) {
        util.clearStorageData()
        
      }
      that.getMoreInfo('正在加载数据...')
    }
    console.log(this.data.type)

  },
  getLocalCoupon:function (){//本地优惠券数据解析
    console.log('本地数据解析')
    var that = this
    var datalist = wx.getStorageSync('couponList')
    var datalistNew = [];
    for (let i = 0; i < datalist.length; i++) {
      var data = new Object();
      data.amount = datalist[i].amount;
      data.title = datalist[i].title;
      data.id = datalist[i].id;
      data.buy_amount = datalist[i].buy_amount;
      data.type = datalist[i].type
      data.discount = datalist[i].discount
      if (datalist[i].type == "money") {//满减
        data.mjdesc = '满' + datalist[i].buy_amount + '减' + datalist[i].amount;
      } else if (datalist[i].type == "discount") {//打折
        data.mjdesc = '满' + datalist[i].buy_amount + '打' + datalist[i].discount * 0.1 + '折';
      }

      data.time = datalist[i].apply_date + '&' + datalist[i].invalid_date;

      if (datalist[i].ranges == null) {
        data.desc = '仅限无人货架使用';
      } else {
        data.desc = datalist[i].ranges;
      }
      if (datalist[i].is_expired == true) {
        data.use = '已失效'
        data.useStyle = false
      } else {
        if (datalist[i].is_used == true) {
          data.use = '已使用'
          data.useStyle = false
        } else {
          data.use = '立即使用'
          data.useStyle = true
        }
      }
      datalistNew.push(data)
      //console.log(datalistNew)
    }
    var contentlistTem = that.data.contentlist
    var contentlist = datalistNew;
    if (contentlist.length < that.data.pageSize) {
      that.setData({
        contentlist: contentlistTem.concat(contentlist),
        hasMoreData: false
      })
    } else {
      that.setData({
        contentlist: contentlistTem.concat(contentlist),
        hasMoreData: true,
        pagenumber: that.data.pagenumber + 1
      })
    }



  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // if (this.data.hasMoreData) {
    //   this.getMoreInfo('加载更多数据')
    // } else {
    //   wx.showToast({
    //     title: '没有更多数据',
    //   })
    // }
  },
  toUse: function (e) {
    //本地没有商品存储，点击立即使用优惠券跳转首页
    //本地有商品存储，点击立即使用优惠券跳回购物车提交订单页
    console.log(e)
    //已使用  use
    
    if (e.currentTarget.dataset.item.use != "立即使用"){
      return false
    }
    var cartItems = wx.getStorageSync('cartItems') || ''

    if (cartItems == '') {
      // //调取扫一扫
      // wx.navigateTo({//测试用
      //   url: '../../scan/scan'
      // })
      //下方为正确扫码
      wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {
          var url = res.result
          if (url.indexOf("?") != -1) {
            var str = url.split("?");
            if (str[1].indexOf("=") != -1) {
              var Request = str[1].split("=");
              if (Request[0] == 'pid') {
                wx.navigateTo({
                  url: '../../scan/cart?typeCart=2&&pid='+Request[1]
                })
              } else if (Request[0] == 'sid') {
                wx.navigateTo({
                  url: '../../scan/shelf?sid='+Request[1]
                })
              }
            }
          }
        }
      })

    } else {
      console.log(e.currentTarget.dataset.item)
      var item = e.currentTarget.dataset.item
      console.log(e.currentTarget.dataset.item)
      var item = e.currentTarget.dataset.item
      if (item.useStyle) {//可以使用
        if (item.type == "money") {//满减

          // var couponDetail = {
          //   useCoupons: item.id,//油糊圈id
          //   manAmount: item.buy_amount,////达到钱数方可使用
          //   amount: item.amount,//减少的钱数
          //   title: item.title,//优惠券名
          // }
          wx.setStorage({//减几
            key: 'couponDetail',
            data: {
              type:item.type,//优惠券类型
              useCoupons: item.id,//油糊圈id
              manAmount: item.buy_amount,////达到钱数方可使用
              amount: item.amount,//减少的钱数
              title: item.title,//优惠券名
            },
            success: function (res) {
            }
          })
          
        } else if (item.type == 'discount') {//满打折
          wx.setStorage({//减几
            key: 'couponDetail',
            data: {
              type: item.type,//优惠券类型
              useCoupons: item.id,//油糊圈id
              // manAmount: item.buy_amount,////达到钱数方可使用
              amount: item.discount,//减少的钱数
              title: item.title,//优惠券名
            },
            success: function (res) {
            }
          })
        }
      }
      console.log(getCurrentPages())
     
      wx.navigateBack({
        delta: 1
      })
    }

  }
})