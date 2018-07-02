const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var imgUrl = app.globalData.imgUrl
var uuid = app.globalData.uuid
Page({
  data: {
    modalHidden: false,
    nocancel: false,
    cover: true,
    imgUrlsAct: '',
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    circular: true,
    orderCouponList: [],
    num: '',
    backState:true,//返回主页
    payment:null,//无优惠券时 显示广告
  },
  cancel: function () {
    this.setData({
      cover: false
    });
  },
  toAdsense: function (e) {
    var item = e.currentTarget.dataset.url;
    //console.log(item)
    this.setData({
      backState: false
    })
    wx.navigateTo({
      url: '../index/webView?url=' + item
    })
  },
  toSee: function () {
    this.setData({
      backState:false
    })
    
    if (this.data.payment){//跳转到广告宣传页
      var url = this.data.payment.url
     // console.log(url)
      wx.navigateTo({
        url: '../index/webView?url=' + url
      })
    }else{
      wx.navigateTo({
        url: '../user/coupon/coupon'
      })
    }
    
  },
  toSeecoupon:function (){//跳转到优惠券
    wx.navigateTo({
      url: '../user/coupon/coupon'
    })
  },
  onLoad: function () {
    var that = this;
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    // 请求下部广告
    wx.request({//获取轮播图
      url: textUrl + 'sms/getAdsenseList',
      data: {
        position: 'foot'
      },
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      complete: function (res) {
        var arrImg = res.data;
        for (let i = 0; i < arrImg.length; i++) {
          arrImg[i].image = imgUrl + arrImg[i].image
        }
        that.setData({
          imgUrlsAct: arrImg
        });
        //console.log(res)
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        if (res.data.code == 0) {
          resolve(res)
        }
      }
    })
  },
  onShow() {
    this.setData({
      backState: true
    })
    var that = this;
    //请求支付返回优惠券
    var payData = {}
    payData = wx.getStorageSync('payData')
    //获得数据
    wx.request({
      url: textUrl + 'user/getOrderCouponList',
      data: {
        "orderno": payData.ordersn,//payData.orderno
         //"orderno": 'DO100031052',
        "uuid": uuid
      },
      method: "get",
      header: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      complete: function (res) {

      },
      success: function (res) {
        console.log(payData.ordersn)
        console.log(res)
        console.log(res.data.length)
        var num = res.data.length;
        that.setData({
          orderCouponList: res.data,
          num: num
        })
        if (num==0){
          that.getPaymentList()
        }
      }
    })
  },
  getPaymentList(){
    var self =this
    wx.request({//获取轮播图
      url: textUrl + 'sms/getAdsenseList',
      data: {
        position: 'payment'
      },
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
     
      success: function (res) {
        // var arrImg = res.data;
        // for (let i = 0; i < arrImg.length; i++) {
        //   arrImg[i].image = imgUrl + arrImg[i].image
        // }
        // that.setData({
        //   imgUrlsAct: arrImg
        // });
        self.setData({
          payment:res.data[0]
        })
        //console.log(res)
        
      }
    })

  },
  onUnload:function(){
    if (this.data.backState){
      wx.reLaunch({//跳转支付成功页面
        url: '../index/index'
      })
    }
  }
})