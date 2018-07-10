const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var util = require('../../utils/util.js');

Page({
  data: {
    carts: [],        // 购物车列表
    hasList: false,     // 列表是否有数据
    totalPrice: 0,      // 总价，初始为0
    hasCoupon: '', //优惠券
    smsorderid: '',
    pay_money: '',//小计
    is_coupon_allowed: '',
    couponId: '',
    pay_amount: '',//应付
    cheackCoupon:false,//为选择优惠券
  },
  onShow() {
    var that = this;
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    wx.getStorage({
      key: 'smsorderid',
      success: function (res) {
        that.setData({
          smsorderid: res.data
        })
      }
    })

    var that = this;
    var cartItems = wx.getStorageSync('cartItems')//商品列表
    var pay_money = Number(wx.getStorageSync('pay_money')) //后台返回要支付价钱


    var pay_amount = wx.getStorageSync('pay_amount')//应付
    var is_coupon_allowed = wx.getStorageSync('is_coupon_allowed') || ''//是否可用优惠券
    var amount = wx.getStorageSync('couponDetail').amount//优惠限额
    var manAmount = wx.getStorageSync('couponDetail').manAmount//优惠限额
    var couponTitle = wx.getStorageSync('couponDetail').title || ''//优惠券标题
    var useCoupons = wx.getStorageSync('couponDetail').useCoupons || ''//优惠券id  
    var type = wx.getStorageSync('couponDetail').type //优惠券类型
    if (useCoupons){
      that.setData({
        cheackCoupon:true
      })
    }


    this.setData({//后台返回的金额
      pay_money: pay_money,//应付
      pay_amount: pay_amount//小计
    });

    //var pay_amount = that.data.pay_amount
    if (is_coupon_allowed) {//如果允许使用优惠券
      if (couponTitle) {//用户点击优惠券，赋值
        console.log(couponTitle)
        this.setData({
          hasCoupon: couponTitle
        });

        if (type == 'money') {//满减 券
          if (pay_money >= manAmount) {
            //pay_money = ((pay_money * 100 - amount * 100) / 100).toFixed(2)
            this.setData({
              pay_money: util.toDecimal2(pay_money - amount)
            });
          }
        } else {

         // pay_money = Math.round(pay_money * amount * 0.01);
          
          this.setData({
            pay_money: util.toDecimal2(pay_money * amount * 0.01)
          });
        }
        // if (pay_amount >= manAmount) {
        //   pay_amount = (pay_amount * 10 - manAmount * 10) / 10
        //   this.setData({
        //     pay_amount: pay_amount
        //   });
        // } else {
        //   wx.showToast({
        //     title: '此优惠券不符合',
        //     icon: 'succes',
        //     duration: 1000,
        //     mask: true,
        //     success: function () {
        //       wx.setStorage({
        //         key: 'couponTitle',
        //         data: '',
        //       })
        //       that.setData({
        //         hasCoupon: ''
        //       });
        //     }
        //   })
        //   wx.removeStorage({
        //     key: 'useCoupons',
        //     success: function (res) {
        //     }
        //   })
        // }
      } else {
        this.setData({
          hasCoupon: '请选择优惠券'
        });
      }
      this.setData({
        carts: cartItems,
        is_coupon_allowed: is_coupon_allowed
      });

    } else {

      this.setData({
        hasCoupon: '优惠券不可用',
        carts: cartItems,
        pay_amount: pay_amount,
        is_coupon_allowed: is_coupon_allowed
      });
    }
  },
  toCoupon: function () {
    if (this.data.is_coupon_allowed) {//允许使用
      wx.navigateTo({
        url: '../user/coupon/coupon?type=available'
      })
    } else {//不允许使用
    }
  },
  cancelCoupon(){//取消使用
    var self =this
    wx.removeStorage({
      key: 'couponDetail',
      success: function (res) {
        self.setData({
          hasCoupon:'请选择优惠券',
          cheackCoupon:false,
          pay_money: Number(wx.getStorageSync('pay_money'))
        });
      }
    })
  },
  onLoad: function (option) {
    var couponDetail = wx.getStorageSync('couponDetail')//整个优惠券
    if (couponDetail) {
      wx.removeStorage({
        key: 'couponDetail',
        success: function (res) {
        }
      })
    }
   
    // console.log(this.data.pay_amount)
    // console.log(this.data.pay_money)
  },
  toSubmit: function () {
    var that = this;
    console.log(that.data.carts)
    var that = this
    wx.setStorage({
      key: 'carts',
      data: that.data.carts,
      success: function (res) {
      }
    })
    var pay_money = that.data.pay_money
    wx.navigateTo({//跳转支付页面
      url: "/pages/orderPay/pay?payMoney=" + pay_money
    })
  }
})