const app = getApp()
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var util = require('../../utils/util.js');

Page({
  data: {
    payMoney: 0,//支付金额
    clock: '',//剩余支付时间
    carts: [],        // 购物车列表
    hasList: false,     // 列表是否有数据
    totalPrice: 0,      // 总价，初始为0
    hasCoupon: '', //优惠券
    smsorderid: '',
    pay_money: '',//小计
    is_coupon_allowed: '',
    couponId: '',
    pay_amount: '',//应付
    total_micro_second: 300 * 1000,
    ishow:true,
    backState:true,//true返回主页
  },
  onLoad: function (options) {
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    var that = this;
    countdown(this);
    that.setData({
      payMoney: options.payMoney
    })
    wx.getStorage({
      key: 'smsorderid',
      success: function (res) {
        that.setData({
          smsorderid: res.data
        })
      }
    })

    var useCoupons = wx.getStorageSync('couponDetail').useCoupons ||0 //优惠券id  
    var sid = wx.getStorageSync('sid') //sid  
    var carts = wx.getStorageSync('carts') //carts  
    var smsorderid = wx.getStorageSync('smsorderid')//carts  

    var orderitems = []
    

    for (let i = 0; i < carts.length; i++) {
      var orderObj = new Object;
      orderObj.num = carts[i].quantity
      orderObj.pid = carts[i].id
      orderObj.type = 'sale'
      orderitems.push(orderObj)
    }
    //获得数据
    var bid = wx.getStorageSync('bid') || ''

    // console.log('orderitems' + orderitems)
    // console.log('smsorderid' + smsorderid)
    // console.log('uuid' + uuid)
    // console.log('useCoupons' + useCoupons)
    // console.log('sid' + sid)
    // console.log('bid' + bid)
    wx.request({
      url: textUrl + 'oms/addOmsOrder',
      data: {
        "orderitem": orderitems,
        "smsorderid": smsorderid,//下单活动id
        "uuid": uuid,
        "couponid": useCoupons,
        "sid": sid,
        "bid": bid
      },
      method: "post",
      header: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      complete: function (res) {
        //console.log(res)
      },
      success: function (res) {
         console.log(res)
        wx.setStorage({
          key: 'payData',
          data: res.data,
          success: function (res) {
            // wx.redirectTo({//跳转支付页面
            //   url: "/pages/orderPay/pay?pay_amount=" + pay_amount
            // })
          }
        })

      }
    })
  },
  onUnload:function (){//页面卸载
    if (this.data.backState){//返回主页
      // wx.navigateBack({
      //   delta: 0
      // })
      // wx.switchTab({//跳转首页
      //   url: '../index/index'
      // })
    }
    if (this.data.total_micro_second == 0){//倒计时结束
      wx.reLaunch({//跳转首页
        url: '../index/index'
      })
    }
  },
  toPay: function () {
    console.log('开始支付')
    var self = this
  //   var payData = {}
  //   payData = wx.getStorageSync('payData')
  //  console.log(payData)
    console.log('top1')
   // console.log(payData.data.paySign)
   wx.getStorage(
     {
       key: 'payData',//
       success: function (payData) {
         //调取支付接口
         //获取后台返回参数，传入后台获取参数，调取微信支付，成功后页面跳转
         var payData = payData.data
         console.log(payData)
         console.log('top2')
         wx.requestPayment(
           {
             'timeStamp': payData.timeStamp,
             'nonceStr': payData.nonce_str,
             'package': 'prepay_id=' + payData.prepay_id,
             'signType': 'MD5',
             'paySign': payData.paySign,
             'success': function (res) {
               //   console.log(res)
               //  console.log('支付正确')
               console.log('top3')
               self.setData({
                 backState: false
               })
               wx.redirectTo({//跳转支付成功页面
                 url: '/pages/orderPay/paySuc'
               })
             },
             'fail': function (res) {
               console.log('支付错误')
               self.setData({
                 backState: true
               })
               wx.redirectTo({//跳转首页
                 url: '../index/index'
               })
             },
             'complete': function (res) {//上线注释
               wx.removeStorage({
                 key: 'cartItems',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'amount',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'carts',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'pay_money',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'is_coupon_allowed',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'smsorderid',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'useCoupon',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'manAmount',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'sid',
                 success: function (res) {
                 }
               })
               wx.removeStorage({
                 key: 'couponTitle',
                 success: function (res) {
                 }
               })
               // self.setData({
               //   backState: false
               // })
               // wx.redirectTo({//跳转支付成功页面
               //   url: '/pages/orderPay/paySuc'
               // })
             }
           })
        }
     })      
   }
})

var total_micro_second = 300 * 1000;

/* 毫秒级倒计时 */
function countdown(that) {
  //var self =this
  // 渲染倒计时时钟
  that.setData({
    clock: dateformat(that.data.total_micro_second)
  });

  if (that.data.total_micro_second <= 0) {
    wx.redirectTo({
      url: "/submit"
    })
    that.setData({
      clock: "已经截止",
      ishow:false,
    });
      // wx.navigateTo({//跳转首页
      //   url: '../index/index'
      // })
    // timeout则跳出递归
    return;

  }

  setTimeout(function () {
    // 放在最后--
    that.data.total_micro_second -= 10;
    countdown(that);
  }
    , 10)
}

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = Math.floor((second - hr * 3600) / 60);
  // 秒位
  var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;
  // 毫秒位，保留2位
  var micro_sec = Math.floor((micro_second % 1000) / 10);
  return hr + ":" + min + ":" + sec + " ";
}


