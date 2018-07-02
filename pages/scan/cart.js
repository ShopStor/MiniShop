const app = getApp()
var textUrl = app.globalData.textUrl
var uuid = app.globalData.uuid
var smallImgUrl = app.globalData.smallImgUrl
var util = require('../../utils/util.js')
Page({
  data: {
    uuid: '',//用户id
    carts: '',        // 购物车列表
    totalPrice: 0,      // 总价
    selectAllStatus: true,  // 全选状态，默认全选
    typeCart: 2,//二维码类型1为货架码，2为商品码
    sid: '',//货架id
    pid: '',//商品id
    smsOrder: '活动敬请期待中',//活动信息展示
    headHide: false,//头部活动是否隐藏
    smsorderid: '',//活动id
    smsOrderText: '',//去凑单名称
    backState:true,
  },
  //---------------onLoad
  // navigateBack:function (objc){
  //     console.log(objc)
  //     wx.redirectTo({//跳转首页
  //       url: '../index/index'
  //     })
  // },
  onLoad: function (options) {
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    console.log(options)
    if (options.typeCart) {//如果存在扫码类型为打开小程序扫一扫进入
      //console.log('哈哈哈')
      this.setData({
        typeCart: Number(options.typeCart),
        pid: Number(options.pid)
      })
    } else {//未打开小程序  现已弃用(扫码直接跳转到首页)
      //扫描二维码直接进入页面
      //https://minisuperuat.shinshop.com/web/list.html?pid=137319(例)
      var userTel =  wx.getStorageSync('userTel')
      if (!userTel){
        wx.reLaunch({//跳转首页
          url: '../index/index'
        })
      }
      var src = decodeURIComponent(options.q)
      //console.log(src)
      this.setData({
        typeCart: 2,
        pid: Number(src.split('=')[1])
      })
     // console.log(this.data.pid)
    }
    this.getgoodsIfon()
  },
  //---------------onShow
  onShow(options) {
    //清除
    var pay_money = wx.getStorageSync('pay_money')//满减后金额
    if (pay_money) {
      wx.removeStorage({
        key: 'pay_money',
        success: function (res) {
        }
      })
    }
    var is_coupon_allowed = wx.getStorageSync('is_coupon_allowed')//是否使用优惠券
    if (is_coupon_allowed) {
      wx.removeStorage({
        key: 'is_coupon_allowed',
        success: function (res) {
        }
      })
    }
    // this.setData({
    //   typeCart: Number(options.typeCart),
    //   pid: Number(options.pid)
    // })

   
  },
  onUnload(){
    // if (this.data.backState){//返回
    //   console.log('返回')
    //   if (this.data.typeCart == 1) {//货架
    //     wx.navigateTo({//货架  ../scan/shelf?sid=
    //       url: '../scan/shelf?sid=' + this.data.sid
    //     })
    //   } else {//2商品
    //     wx.navigateTo({//跳转首页
    //       url: '../index/index'
    //     })
    //   }
    // }
    
  },
  getgoodsIfon(){//根据页面链接带有信息 进行数据整理
    //console.log('onshow')
    var that = this;
    var cartItems = wx.getStorageSync('cartItems') || []
    //console.log(cartItems)
   // console.log(this.data.typeCart)
    if (this.data.typeCart == 1) {//是货架过来的
      var sid = wx.getStorageSync('sid')
      //var cartItems = wx.getStorage('cartItems')
      for (let i = 0; i < cartItems.length; i++) {
        cartItems[i].selected = true;
      }
      wx.setStorage({
        key: "cartItems",
        data: cartItems
      })
      this.setData({
        sid: sid
      }),
        this.setData({
          carts: cartItems
        }),
        //this.getTotalPrice();
      this.getSmsOrder();
    } else if (this.data.typeCart == 2) {//是商品过来的
      //  获取商品id调取商品详情
      //console.log(that.data.pid)
      wx.request({//根据商品的pid 1. 获取此商品的货架码sid(用于获取优惠情况)2.bid用于提交时
        url: textUrl + 'pms/getProductLocal',
        data: {
          pid: that.data.pid
        },
        method: "get",
        header: {
          "Content-Type": "application/json;charset=UTF-8"  //get
        },
        complete: function (res) {
        },
        success: function (res) {
          console.log(res)
          if (res.data.is_marketable){

            wx.setStorage({
              key: 'bid',
              data: Number(res.data.bid),
              success: function (res) {
              }
            })
            //console.log(cartItems)
            // 缓存
            //var cartItems = wx.getStorageSync('cartItems') || []
            var pid = res.data.id
            if (res.data.image == null) {
              res.data.image = '../../static/images/no_img.png'
            } else {
              res.data.image = util.getSmallImge(0, 300, "product_cover", res.data.image);
            }
            if (cartItems.length == 0) {
              cartItems.push({
                id: res.data.id,
                quantity: 1,
                price: res.data.price,
                title: res.data.name,
                goodsPicsInfo: res.data.image,
                selected: true
              })
            } else {
              //判断购物车缓存中是否已存在该货品
              var cunt = 0
              cartItems.map((item) => {
                if (pid == item.id) {
                  item.quantity = item.quantity + 1
                } else {//(当cunt值等于cartItems长度时,说明扫描的商品为新的商品)
                  cunt++
                  console.log(cartItems.length)
                  if (cunt == cartItems.length) {

                    cartItems.push({
                      id: res.data.id,
                      quantity: 1,
                      price: res.data.price,
                      title: res.data.name,
                      goodsPicsInfo: res.data.image,
                      selected: true,
                    })
                  }
                }
              })
            }
            var sid = res.data.wms_shelves
            that.setData({
              carts: cartItems,
              sid: res.data.wms_shelves
            })
            //console.log(res.data.wms_shelves)
            //加入购物车数据，存入缓存
            wx.setStorage({
              key: 'cartItems',
              data: cartItems,
              success: function (res) {
              }
            })
            wx.setStorage({
              key: 'sid',
              data: res.data.wms_shelves,
              success: function (res) {
              }
            })
            // let carts = cartItems;         // 获取购物车列表
            // let total = 0;
            // for (let i = 0; i < carts.length; i++) {     // 循环列表得到每个数据
            //   if (carts[i].selected) {          // 判断选中才会计算价格
            //     total += carts[i].quantity * carts[i].price;   // 所有价格加起来
            //   }
            // }
            // that.setData({                // 最后赋值到data中渲染到页面
            //   totalPrice: total.toFixed(2)
            // });
            that.getSmsOrder();
          }else{
            wx.showToast({
              title: '商品已下架',
              image: '/static/images/prompt.png',
              duration: 2000
            })

          }
        }
      })
    }
  },
  getSmsOrder() {
    var that = this;
    var smsOrder = '活动敬请期待中'
    var smsorderid = 0
    var smsOrderText = ''
    var cartItems = wx.getStorageSync('cartItems')
    let carts = cartItems;         // 获取购物车列表
    let total = 0;
    console.log(cartItems)
    for (let i = 0; i < carts.length; i++) {     // 循环列表得到每个数据
      console.log(carts[i])
      if (carts[i].selected) {          // 判断选中才会计算价格
        total = total+ carts[i].quantity * carts[i].price;   // 所有价格加起来
       
      }
    }
    //this.getTotalPrice()
    var totalPrice = total
    console.log(totalPrice)
    //var totalPrice = this.data.totalPrice
    // 获取是否含有下单活动信息
    //console.log(that.data.sid)
    wx.request({
      url: textUrl + 'sms/getSmsOrderList',
      data: {
        uuid: uuid,
        sid: that.data.sid
      },
      method: "get",
      header: {
        "Content-Type": "application/json;charset=UTF-8"  //get
      },
      complete: function (res) {
      },
      success: function (res) {
        // console.log('sid'+that.data.sid)
        // console.log('uuid'+uuid)
         console.log(res)
        // wx.showModal({
        //   title: '提示',
        //   content: res.data.type+'1',
        //   success: function (res) {

        //   }
        // })
        if(res.data){
          if (res.data.type == 'money') {//满减活动
            if (totalPrice >= res.data.limit_amount) {
              smsOrder = "活动商品满" + res.data.limit_amount + "元减" + res.data.amount + "元"
              smsorderid = res.data.id
              smsOrderText = ' 参加活动成功'
            } else {
              smsOrder = "活动商品满" + res.data.limit_amount + "元减" + res.data.amount + "元"
              smsorderid = res.data.id
              smsOrderText = '去凑单' 
            }  
          } else if (res.data.type == 'discount') {//满折活动
            // console.log(totalPrice)
            // console.log(res.data.limit_amount)
            if (totalPrice >= res.data.limit_amount) {

              smsOrder = "活动商品满" + res.data.limit_amount + "元" + res.data.discount * 0.1 + "折"
              smsorderid = res.data.id
              smsOrderText = ' 参加活动成功'
             
            } else {
              smsOrder = "活动商品满" + res.data.limit_amount + "元" + res.data.discount * 0.1 + "折"
              smsorderid = res.data.id
              smsOrderText = '去凑单'
            }
          }
          
        } else {
          //console.log('无smsorderid')
          smsOrder = '活动敬请期待中'
         // smsorderid = res.data.id
          smsorderid = 0
          smsOrderText = ' '
          //console.log(smsOrder)
        }
        that.setData({
          smsOrder: smsOrder,
          smsorderid: smsorderid,
          smsOrderText: smsOrderText
        })
        //console.log(smsorderid)
        wx.setStorage({
          key: "smsorderid",
          data: smsorderid
        })
        // wx.showModal({
        //   title: '提示',
        //   content: smsorderid+'活动id',
        //   success: function (res) {

        //   }
        // })
        // wx.setStorage({//不通过 此接口判断是否可使用优惠券,转移到subBalance 接口判断uulist(为空无可使用优惠券)
        //   key: "is_coupon_allowed",
        //   data: res.data.is_coupon_allowed
        // })
        that.getTotalPrice()
       
      }
    })
  },
  getTotalPrice() {//求总价
    // let carts = this.data.carts;         // 获取购物车列表
    // let total = 0;
    // for (let i = 0; i < carts.length; i++) {     // 循环列表得到每个数据
    //   if (carts[i].selected) {          // 判断选中才会计算价格
    //     total += carts[i].quantity * carts[i].price;   // 所有价格加起来
    //   }
    // }
    // if (this.data.discount){
    //   total = total * this.data.discount
    // }
    // //console.log(this.data.discount)
    // this.setData({                // 最后赋值到data中渲染到页面
    //   totalPrice: total.toFixed(2)
    // });

    //接口计算价格
    var that = this
    var orderitems = []
    var orderObj = new Object;
    var carts = this.data.carts;
    for (let i = 0; i < carts.length; i++) {
      let num = carts[i].quantity
      let pid = carts[i].id
      orderObj = { num, pid }
      orderitems.push(orderObj)
    }
    var bid = wx.getStorageSync('bid') || ''
    if(carts.length==0){
      wx.setStorage({
        key: 'pay_amount',
        data: 0,
        success: function (res) {
        }
      })
      // total.toFixed(2)
      wx.setStorage({
        key: 'pay_money',
        data: 0,
        success: function (res) {
        }
      })
      that.setData({                // 最后赋值到data中渲染到页面
        totalPrice: 0
      });
      return false
    }
    wx.request({
      url: textUrl + 'oms/subBalance',
      data: {
        "orderitem": orderitems,
        "smsorderid": that.data.smsorderid,//下单活动id
        "uuid": uuid,
        "sid": that.data.sid,
        "bid": bid
      },
      method: "post",
      header: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      complete: function (res) {
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        //console.log(res)
        wx.setStorage({
          key: 'pay_amount',
          data: util.toDecimal2(res.data.amount),
          success: function (res) {
          }
        })
        // res.data.pay_amount.toFixed(2)
        wx.setStorage({
          key: 'pay_money',
          data: util.toDecimal2(res.data.pay_amount),
          success: function (res) {
          }
        })
        that.setData({                // 最后赋值到data中渲染到页面
          totalPrice: res.data.pay_amount.toFixed(2)
        });

        //加入购物车数据，存入缓存
        wx.setStorage({
          key: 'cartItems',
          data: that.data.carts,
          success: function (res) {
          }
        })
      }
    }) 



  },
  selectList(e) {
    var self = this
    const index = e.currentTarget.dataset.index;  // 获取data- 传进来的index
    let carts = this.data.carts;          // 获取购物车列表
    const selected = carts[index].selected;     // 获取当前商品的选中状态
    carts[index].selected = !selected;       // 改变状态
    this.setData({
      carts: carts
    });
    //  this.getTotalPrice();              // 重新获取总价
    // this.getSmsOrder()
    wx.setStorage({
      key: 'cartItems',
      data: carts,
      success: function (res) {
        self.getTotalPrice();//获取头部状态
        self.getSmsOrder()
      }
    })
    
  },
  selectAll(e) {
    var self = this
    let selectAllStatus = this.data.selectAllStatus;  // 是否全选状态
    selectAllStatus = !selectAllStatus;
    let carts = this.data.carts;
    for (let i = 0; i < carts.length; i++) {
      carts[i].selected = selectAllStatus;      // 改变所有商品状态
    }
    this.setData({
      selectAllStatus: selectAllStatus,
      carts: carts
    });
    wx.setStorage({
      key: 'cartItems',
      data: this.data.carts,
      success: function (res) {
        self.getTotalPrice();//获取头部状态
        self.getSmsOrder()
      }
    })
    
  },// 增加数量
  addCount(e) {
    // console.log(this.data.carts)
    var self =this
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    let quantity = carts[index].quantity;
    quantity = quantity + 1;
    carts[index].quantity = quantity;
    this.setData({
      carts: carts
    });
    
    //加入购物车数据，存入缓存
    wx.setStorage({
      key: 'cartItems',
      data: this.data.carts,
      success: function (res) {
        self.getTotalPrice();
        self.getSmsOrder()
      }
    })
  },
  // 减少数量
  minusCount(e) {
    var self = this
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    let quantity = carts[index].quantity;
    if (quantity <= 1) {
      return false;
    }
    quantity = quantity - 1;
    carts[index].quantity = quantity;
    this.setData({
      carts: carts
    });
    
    //加入购物车数据，存入缓存
    wx.setStorage({
      key: 'cartItems',
      data: this.data.carts,
      success: function (res) {
        self.getTotalPrice();
        self.getSmsOrder()
      }
    })
  },
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    carts.splice(index, 1);       // 删除购物车列表里这个商品
    this.setData({
      carts: carts
    });
    wx.setStorage({
      key: 'cartItems',
      data: this.data.carts,
      success: function (res) {
      }
    })
    this.getTotalPrice();
    if (!carts.length) {         // 如果购物车为空
      this.setData({
        hasList: false       // 修改标识为false，显示购物车为空页面
      });
    } else {               // 如果不为空
      this.getTotalPrice();      // 重新计算总价格
      this.getSmsOrder()
    }
  },
  toSubmit: function () {
    var self =this
    if (this.data.totalPrice == 0 || this.data.totalPrice == 'NaN') {
      wx.showToast({
        title: '请选择商品',
        icon: 'succes',
        duration: 1000,
        mask: true
      })

    } else {
      var that = this;
      console.log(that.data.smsorderid)
        var orderitems = []
        var orderObj = new Object;
        var carts = this.data.carts;
        for (let i = 0; i < carts.length; i++) {
          let num = carts[i].quantity
          let pid = carts[i].id
          orderObj = { num, pid }
          orderitems.push(orderObj)
        }
        //获得数据
        var bid = wx.getStorageSync('bid') || ''
        wx.request({
          url: textUrl + 'oms/subBalance',
          data: {
            "orderitem": orderitems,
            "smsorderid": that.data.smsorderid,//下单活动id
            "uuid": uuid,
            "sid": that.data.sid,
            "bid": bid
          },
          method: "post",
          header: {
            "Content-Type": "application/json;charset=UTF-8"
          },
          complete: function (res) {
            if (res == null || res.data == null) {
              reject(new Error('网络请求失败'))
            }
          },
          success: function (res) {
            console.log(orderitems)
            console.log(that.data.smsorderid)
            console.log(uuid)
            console.log(that.data.sid)
            console.log(bid)

            console.log(res)
            wx.setStorage({
              key: 'pay_amount',
              data: res.data.amount,
              success: function (res) {
              }
            })
            // total.toFixed(2)
            wx.setStorage({
              key: 'pay_money',
              data: res.data.pay_amount.toFixed(2),
              success: function (res) {
              }
            })
            //存储可用优惠券列表
            var is_coupon_allowed = null
            console.log('uulist')
            console.log(res.data.uuList)
            if (res.data.uuList && res.data.uuList.length>0){
              is_coupon_allowed = true
              wx.setStorage({
                key: 'couponList',
                data: res.data.uuList,
                success: function (res) {
                }
              })
            }else{
              is_coupon_allowed = false
            }
            wx.setStorage({//判断是否可使用优惠券
              key: "is_coupon_allowed",
              data: is_coupon_allowed
            })
            //加入购物车数据，存入缓存
            wx.setStorage({
              key: 'cartItems',
              data: self.data.carts,
              success: function (res) {
              }
            })
            that.setData({
              backState: false
            })
            wx.navigateTo({//跳转到提交订单页面
              url: '/pages/orderPay/submit'
            })
          }
        }) 
    }
  },
  toAdd: function () {
    var sid = wx.getStorageSync('sid')
    if (this.data.typeCart == 1) {
      console.log(sid)
      this.setData({
        backState: false
      })
      wx.navigateTo({
        url: '/pages/scan/shelf?sid=' + sid
      })
    } else {
      this.toScan();
    }
  },
  toScan: function () {//扫一扫
    var self =this
    this.setData({
      backState: false
    })
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)


        var url = res.result
        if (url.indexOf("?") != -1) {
          var str = url.split("?");
          if (str[1].indexOf("=") != -1) {
            var Request = str[1].split("=");
            if (Request[0] == 'pid') {//停留在本页(商品码)
              console.log(Request[1])
                self.setData({
                  typeCart: 2,
                  pid: Request[1]
                })
                self.getgoodsIfon()
              // wx.navigateTo({
              //   url: '../scan/cart?typeCart=2&&pid='+Request[1]
              // })
            } else if (Request[0] == 'sid') {
              var cartItems = wx.getStorageSync('cartItems')//所有商品缓存数据
              if (cartItems) {
                wx.removeStorage({
                  key: 'cartItems',
                  success: function (res) {
                  }
                })
              }
              wx.navigateTo({//跳转到货架吗页
                url: '../scan/shelf?sid='+Request[1]
              })
            }
          }
        }
      }
    })
  },


})
