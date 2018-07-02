const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var imgUrl = app.globalData.imgUrl
var smallImgUrl = app.globalData.smallImgUrl

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//去左右空格;
function trim(s) {
  return s.replace(/(^\s*)|(\s*$)/g, "");
}
// 压缩图片方法

function getSmallImge(width, height, dir, name) {
  //console.log(width)
  return smallImgUrl + width + "_" + height + "/" + dir + "/" + name.split(".")[0] + "_" + name.split(".")[1];
}
function clearStorageData(){//清除存储数据
  // 下方为进入首页有缓存清空
  var cartItems = wx.getStorageSync('cartItems')//所有商品缓存数据
  if (cartItems) {
    wx.removeStorage({
      key: 'cartItems',
      success: function (res) {
      }
    })
  }

  var carts = wx.getStorageSync('carts')//传给后台  生成的订单
  if (carts) {
    wx.removeStorage({
      key: 'carts',
      success: function (res) {
      }
    })
  }
  var carts = wx.getStorageSync('couponList')//购物车 存储可用优惠券列表
  if (carts) {
    wx.removeStorage({
      key: 'couponList',
      success: function (res) {
      }
    })
  }

  var amount = wx.getStorageSync('pay_amount')//总钱  小计
  if (amount) {
    wx.removeStorage({
      key: 'pay_amount',
      success: function (res) {
      }
    })
  }
  var pay_money = wx.getStorageSync('pay_money')//满减后金额
  if (pay_money) {
    wx.removeStorage({
      key: 'pay_money',
      success: function (res) {
      }
    })
  }
  //var is_coupon_allowed = wx.getStorageSync('is_coupon_allowed')//是否使用优惠券 允许使用优惠券 true允许,在购物车提交时获取
  // if (is_coupon_allowed) {
  wx.removeStorage({
    key: 'is_coupon_allowed',
    success: function (res) {
    }
  })
  //}

  // var smsorderid = wx.getStorageSync('smsorderid')//活动id
  // if (smsorderid) {
    wx.removeStorage({
      key: 'smsorderid',
      success: function (res) {
      }
    })
 // }
  //

  var couponDetail = wx.getStorageSync('couponDetail')//整个优惠券
  if (couponDetail) {
    wx.removeStorage({
      key: 'couponDetail',
      success: function (res) {
      }
    })
  }


  // var useCoupon = wx.getStorageSync('useCoupon')//优惠券id
  // if (useCoupon) {
  //   wx.removeStorage({
  //     key: 'useCoupon',
  //     success: function (res) {
  //     }
  //   })
  // }
  // var couponTitle = wx.getStorageSync('couponTitle')//优惠券名  (选择后的)
  // if (couponTitle) {
  //   wx.removeStorage({
  //     key: 'couponTitle',
  //     success: function (res) {
  //     }
  //   })
  // }
  // var manAmount = wx.getStorageSync('manAmount')//优惠券 例:满10减3   ,此处代表10
  // if (manAmount) {
  //   wx.removeStorage({
  //     key: 'manAmount',
  //     success: function (res) {
  //     }
  //   })
  // }
  // var pay_money = wx.getStorageSync('amount')//优惠券 满减  的金额  //例:满10减3   ,此处代表3
  // if (pay_money) {
  //   wx.removeStorage({
  //     key: 'amount',
  //     success: function (res) {
  //     }
  //   })
  // }


  var sid = wx.getStorageSync('sid')
  if (sid) {
    wx.removeStorage({
      key: 'sid',
      success: function (res) {
      }
    })
  }
  var bid = wx.getStorageSync('bid')
  if (bid) {
    wx.removeStorage({
      key: 'bid',
      success: function (res) {
      }
    })
  }
  var payData = wx.getStorageSync('payData')//后台返回的支付信息
  if (payData) {
    wx.removeStorage({
      key: 'payData',
      success: function (res) {
      }
    })
  }

}
//强制保留两位小数
function toDecimal2(x) {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + 2) {
    s += '0';
  }
  return s;
}


module.exports = {
  formatTime: formatTime,
  getSmallImge: getSmallImge,
  trim: trim,
  clearStorageData: clearStorageData,
  toDecimal2: toDecimal2
}
