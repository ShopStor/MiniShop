const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var smallImgUrl = app.globalData.smallImgUrl
var util = require('../../utils/util.js')
Page({
  data: {
    foodsData: '',//全部数据
    sid: '',//货架码
    cartMoney: '0.00',//购物车价钱
    cartNum: '0',//购物车数量
    screenSite: "",//货架地址
    currentTab: 0,  //对应样式变化
    scrollTop: 0,  //用作跳转后右侧视图回到顶部
    screenArray: [], //左侧导航栏内容
    screenId: "",  //后台查询需要的字段(点击左侧存的id)
    childrenArray: [], //右侧内容
    options:null,
    Cover:true,//遮罩层
  },
  onShow:function (){
    var options = this.data.options
    console.log('这是清除购物车')
    var cartItems = wx.getStorageSync('cartItems') || []
    var cartNum = 0;
    var total = 0;
    for (let i = 0; i < cartItems.length; i++) {
      cartNum = cartNum + cartItems[i].quantity
      total += cartItems[i].quantity * cartItems[i].price;
    }
    var that = this;
    // 获取货架码
    wx.showLoading({
      title: '加载中',
    })
    console.log(options.sid)
    that.setData({
      Cover:true,
      sid: Number(options.sid),
      cartNum: cartNum,
      cartMoney: total.toFixed(2)
    })
    // wx.setStorage({
    //   key: 'sid',
    //   data: Number(options.sid),
    //   success: function (res) {
    //   }
    // })
    wx.setStorageSync('sid', Number(options.sid))
    //获得数据
    wx.request({
      url: textUrl + 'pms/getByShelvesPorList',
      data: {
        sid: that.data.sid
      },
      method: "get",
      header: {
        "Content-Type": "application/json;charset=UTF-8"  //get
      },
      complete: function (res) {
        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        console.log(res)
        if(res.data.prolist.length==0){//货架无商品
           wx.redirectTo({//跳转主页
              url: '../index/index'
          })
           wx.showModal({
             title: '提示',
             content: '此货架码无商品',
           })
          return false
        }
        res.data.prolist.map((item) => {
          item.prolist.map((two) => {
            two.quantity = 0//选择的数量
          })
        })
        var foodsData = [];
        var foodsType = [];
        var foods = new Object();
        foodsData = res.data.prolist
        // console.log(foodsData)
        for (let i = 0; i < foodsData.length; i++) {
          let screenName = foodsData[i].name,
            screenId = foodsData[i].id,
            foods = { screenName, screenId }
          foodsType.push(foods);
        }
        var bid = res.data.prolist[0].prolist[0].bid
        console.log('bid='+bid)
        //wx.setStorage({ key: "bid", data: Number(bid) })
        wx.setStorageSync('bid',Number(bid))
        var prolists = res.data.prolist[0].prolist

        for (let i = 0; i < prolists.length; i++) {
          if (prolists[i].image == null) {
            prolists[i].image = '../../static/images/no_img.png'
          } else {
            prolists[i].image = util.getSmallImge(0, 300, "product_cover", prolists[i].image);
          }
          //购物车本地缓存与新数据匹配
          cartItems.map((item) => {
            // console.log(item.id)
            // console.log(prolists[i].id)
            if (item.id == prolists[i].id) {
             // console.log('有匹配')
              prolists[i].quantity = item.quantity
            }
          })

        }
        that.getPriceAndNum()
        that.setData({
          screenArray: foodsType,
          foodsData: res.data.prolist,
          childrenArray: prolists,
          screenSite: res.data.shname,
          screenId: res.data.prolist[0].id
        })
      }
    })

  },
  onLoad: function (options) {
    // wx.setStorage({//已选商品清空
    //   key: 'cartItems',
    //   data: [],
    // })
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      options: options,
    })

  },
  navbarTap: function (e) {
    //console.log(e)
    var that = this;

    this.setData({
      currentTab: e.currentTarget.id,   //按钮CSS变化
      screenId: e.currentTarget.dataset.screenid,
      scrollTop: 0,   //切换导航后，控制右侧滚动视图回到顶部
    })
    //刷新右侧内容的数据
    var screenId = this.data.screenId;
   // console.log(screenId);
   // console.log(that.data.foodsData);
    var cartItems = wx.getStorageSync('cartItems') || []
    for (let i = 0; i < that.data.foodsData.length; i++) {
      if (screenId == that.data.foodsData[i].id) {
       // console.log(that.data.foodsData[i].prolist)
        var prolist = that.data.foodsData[i].prolist
        for (let i = 0; i < prolist.length; i++) {
          if (prolist[i].image == null || prolist[i].image =='../../static/images/no_img.png') {
            prolist[i].image = '../../static/images/no_img.png'
          } else {
            //console.log(prolist[i].image)
            if (prolist[i].image.indexOf("https") <0){
              prolist[i].image = util.getSmallImge(0, 300, "product_cover", prolist[i].image);
            }
          }
          // //查询本地购物车数据并一直匹配
          //购物车本地缓存与新数据匹配
          cartItems.map((item) => {
            // console.log(item.id)
            // console.log(prolists[i].id)
            if (item.id == prolist[i].id) {
             // console.log('有匹配')
              prolist[i].quantity = item.quantity
            }
          })
        }
        //console.log(prolist)
        that.setData({
          childrenArray: prolist
        })
      }
    }
   
  },
  minusCount:function (e){//数量减少
   // console.log(e)
    var self = this
   // console.log(e.currentTarget.dataset.screenid)
    var cartItems = wx.getStorageSync('cartItems') || []
    var childrenArray = self.data.childrenArray
    //console.log(cartItems)
    cartItems.map((item,index) =>{
      if (item.id == e.currentTarget.dataset.screenid){
        var quantity =null
        if (item.quantity ==1){
          // delete cartItems[index]
         // cartItems.remove(index)
          quantity = 0
          cartItems.splice(cartItems.indexOf(item), 1);
          console.log(cartItems)
        }else{
          item.quantity = item.quantity-1
          quantity = item.quantity
        }
        // console.log(item.id)
        childrenArray.map((child) =>{
          if (child.id == item.id){
             child.quantity = quantity
          }
        })
        self.setData({
          childrenArray: childrenArray
        })
        wx.setStorageSync('cartItems', cartItems)
        self.getPriceAndNum()
        // wx.setStorage({
        //   key: 'cartItems',
        //   data: cartItems,
        //   success: function (res) {
        //     self.getPriceAndNum()
        //   }
        // })
      }
    })
  },
  addCount: function (e) {//数量增加
    var self =this
   // console.log(e.currentTarget)
   // console.log(self.data.childrenArray)
    var childrenArray= self.data.childrenArray
    childrenArray.map((item) =>{
      if (item.id == e.currentTarget.dataset.screenid){
        item.quantity = item.quantity+1
      }
    })
    self.setData({
      childrenArray: childrenArray
    })
    //console.log(childrenArray)
    // var foodsData = self.data.foodsData
    // console.log(self.data.foodsData)
    // console.log(self.data.screenId)
   
    var that = this;
    
    var index = parseInt(e.currentTarget.id)
    // 缓存
    var cartItems = wx.getStorageSync('cartItems') || []
    // console.log(cartItems)
    var screenId = e.currentTarget.dataset.screenid
    //判断购物车缓存中是否已存在该货品
    var exist = cartItems.find(function (ele) {
      // console.log(ele)
      return ele.id === that.data.childrenArray[index].id
    })
    // console.log(exist)
    if (exist) {
      //如果存在，则增加该货品的购买数量
      exist.quantity++
    } else {
      cartItems.push({
        id: that.data.childrenArray[index].id,
        quantity: 1,
        price: that.data.childrenArray[index].price,
        title: that.data.childrenArray[index].name,
        goodsPicsInfo: that.data.childrenArray[index].image,
        activity_price: that.data.childrenArray[index].activity_price
      })
    }
    //加入购物车数据，存入缓存
    wx.setStorage({
      key: 'cartItems',
      data: cartItems,
      success: function (res) {
        //重新计算钱数及数量
        self.getPriceAndNum()
        //添加购物车的消息提示框
        wx.showToast({
          title: "添加购物车",
          icon: "success",
          durantion: 2000
        })
      }
    })
   


  },
  getPriceAndNum(){//获取购物车数量和钱
    var self =this
    var cartItems = wx.getStorageSync('cartItems') || []
    var cartNum = 0;
    var total = 0;
    
    for (let i = 0; i < cartItems.length; i++) {
      cartNum = cartNum + cartItems[i].quantity
      if (cartItems[i].activity_price!=0){
        total += cartItems[i].quantity * cartItems[i].activity_price;
      }else{
        total += cartItems[i].quantity * cartItems[i].price;
      }
    }

    var that = this;
    // 获取货架码
    console.log(total)
    //total.toFixed(2)
    self.setData({
      cartNum: cartNum,
      cartMoney: util.toDecimal2(total)
    })
    wx.hideLoading()
    self.setData({
      Cover: false
    })
  },
  addGoods: function (e) {//此方法已弃用
    var that = this;
    var cartNum = that.data.cartNum
    var cartMoney = that.data.cartMoney
    cartNum++;
    var index = parseInt(e.currentTarget.id);
    cartMoney = (this.data.cartMoney * 100 + this.data.childrenArray[index].price * 100) / 100;
    //存储商品ID
    this.setData({
      cartNum: cartNum,
      cartMoney: cartMoney
    })

    // 缓存
    var cartItems = wx.getStorageSync('cartItems') || []
    // console.log(cartItems)
    var screenId = e.currentTarget.dataset.screenid
    //判断购物车缓存中是否已存在该货品
    var exist = cartItems.find(function (ele) {
      // console.log(ele)
      return ele.id === that.data.childrenArray[index].id
    })
    // console.log(exist)
    if (exist) {
      //如果存在，则增加该货品的购买数量
      exist.quantity++
    } else {
      cartItems.push({
        id: that.data.childrenArray[index].id,
        quantity: 1,
        price: that.data.childrenArray[index].price,
        title: that.data.childrenArray[index].name,
        goodsPicsInfo: that.data.childrenArray[index].image
      })
    }

    //加入购物车数据，存入缓存
    wx.setStorage({
      key: 'cartItems',
      data: cartItems,
      success: function (res) {
        //添加购物车的消息提示框
        wx.showToast({
          title: "添加购物车",
          icon: "success",
          durantion: 2000
        })
      }
    })
  },
  toSubmit: function () {
    var cartItems = wx.getStorageSync('cartItems') || []
    if (cartItems.length==0){
      wx.showToast({
        title: "请选择商品",
        image: "../../static/images/warn-icon.png",
        durantion: 2000
      })
    }else{
      wx.navigateTo({//跳转到购物车
        url: '/pages/scan/cart?typeCart=1'
      })
    }
    
  }
})