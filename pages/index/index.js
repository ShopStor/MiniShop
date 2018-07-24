//index.js
//获取应用实例
const app = getApp()    // 加这句就可以使用app.js里的内容
var textUrl = app.globalData.textUrl
var imgUrl = app.globalData.imgUrl
var util = require('../../utils/util.js');
 //var clearStorageData = app.globalData.clearStorageData
Page({
  data: {
    imgUrlsBanner: [],
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 1000,
    circular: true,
    imgUrlsAct: [], //活动图片数组
    motto: '我要去我的页面',
    userInfo: {},
    hasUserInfo: false,
    isCover: false,//遮罩层
    userTel: true,
    nocancel: false,
    latitude: '',
    longitude: '',
    userCode: '',//用户验证码
    backuserCode:'',//接口返回的验证码
    userNumber: '',//用户手机号
    sendCodeMsg: '发送验证码',//发送验证码
    currentTime: 60,
    disabled: false,//可点击
    code: '',
    uuid: '',
    valueinput: '',
    imageUser: '',
    disabled: false,
    intervalTime: '',
  },
  goToRecharge: function () {//点击充值有礼
    wx.showToast({
      title: '功能正在建设中',
      image: '/static/images/prompt.png',
      duration: 1000,
      mask: true
    })
  },
  goToShop: function () {//点击去购物
   // console.log('123')
    wx.navigateTo({
      url: '../index/webView?url=' + 'https://m.shinshop.com/'
    })
  },
  goToFeedback: function () {//点击意见反馈
    wx.showToast({
      title: '功能正在建设中',
      image: '/static/images/prompt.png',
      duration: 1000,
      mask: true
    })
  },
  toast: function () { //点击我的跳转
    wx.navigateTo({
      url: '../user/user'
    })
  },
  isPhoneNo: function (phone){//验证手机号
    var pattern = /^1[34578]\d{9}$/;
    return pattern.test(phone); 
  },
  sendCode: function (e) {//发送验证码
    var that = this;
    var phone = this.isPhoneNo(that.data.userNumber)
    //console.log(phone)
    if (!phone) {
      wx.showToast({
        title: '请输入正确手机号',
        image: '/static/images/error-icon.png',
        duration: 1000,
        mask: true
      })
      return false
    } else {
      that.setData({
        sendCodeMsg: 60 + '秒',
        disabled: true
      })
      // 点击之后倒数验证码
      var currentTime = that.data.currentTime
      var intervalTime = setInterval(function () {
        currentTime--;
        that.setData({
          sendCodeMsg: currentTime + '秒',
          disabled: true,
          intervalTime: intervalTime
        })
        if (currentTime <= 0) {
          clearInterval(intervalTime)
          that.setData({
            sendCodeMsg: '发送验证码',
            currentTime: 60,
            disabled: false,
            intervalTime: intervalTime
          })
        }
      }, 1000)
      // 获取验证码接口，传手机号给后台，发送短信，自动赋值给input；
      wx.request({
        url: textUrl + 'user/registerCode',
        data: {
          phone: that.data.userNumber
        },
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"  //post
        },
        complete: function (res) {
          if (res == null || res.data == null) {
            reject(new Error('网络请求失败'))
          }
        },
        success: function (res) {
          if (res.data.code == 0) {
            resolve(res)
          }
          console.log(res.data.arg)
          that.setData({
            // userCode: res.data.arg,//上线注释
            backuserCode: res.data.arg
          })
        }
      })

    }
  },
  close: function () {//注册关闭
    // wx.navigateBack({
    //   delta: 0
    // })
    wx.redirectTo({//跳转到授权页面
      url: '/pages/toLogin/toLogin'
    })
  },
  makeSure: function () {//注册确认
    var that = this
     //console.log(wx.getStorageSync('userInfo'))
    var phone = that.isPhoneNo(that.data.userNumber)
    if (!phone) {//手机号
      wx.showToast({
        title: '请输入手机号',
        image: '/static/images/error-icon.png',
        duration: 1000,
        mask: true
      })
      return false
    }
    if (that.data.userCode == '') {//验证码为空
      wx.showToast({
        title: '请输入验证码',
        image: '/static/images/error-icon.png',
        duration: 1000,
        mask: true
      })
      return false
    }
    if (that.data.backuserCode != that.data.userCode) {//输入验证码错误
      wx.showToast({
        title: '请输入正确验证码',
        image: '/static/images/error-icon.png',
        duration: 1000,
        mask: true
      })
      return false
    }
    //this.getCode()
    console.log('开始调登录接口')

    wx.login({
      success: function (res) {
        if (res.code) {
          wx.setStorageSync('code', res.code)
          that.setData({//本地存储给data赋值
            code: res.code,
          })
          wx.getUserInfo({
            success: function (info) {
              console.log(info)
              console.log('phone=' + that.data.userNumber)
              console.log('code=' + res.code)
              console.log('encryptedData=' + info.encryptedData)
              console.log('iv=' + info.iv)
              console.log('incode=' + that.data.userCode)
              wx.request({
                url: textUrl + 'user/register',
                data: {
                  phone: that.data.userNumber,
                  code: res.code,//wx.getStorageSync('code')
                  encryptedData: info.encryptedData,
                  iv: info.iv,
                  // openid: ' ',
                  incode: that.data.userCode
                },
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"  //post
                },
                complete: function (res) {
                  if (res == null || res.data == null) {
                    reject(new Error('网络请求失败'))
                  }
                },
                success: function (res) {
                  console.log(res)
                  if (res.data.arg == null) {
                    var intervalTime = that.data.intervalTime
                    clearInterval(intervalTime)
                    that.setData({
                      userTel: false,
                      isCover: true,
                      valueinput: '',
                      sendCodeMsg: '发送验证码',
                      currentTime: 60,
                      disabled: false,
                      userNumber: ''
                    })
                    //res.data.content
                    wx.showModal({
                      title: '提示',
                      content: res.data.content,
                    })
                    console.log(res.data.content)
                  } else {
                    wx.setStorage({ key: "userTel", data: that.data.userNumber }) //信息存本地
                    wx.setStorage({ key: "userarg", data: res.data.arg }) //信息存本地
                    app.globalData.uuid = res.data.arg;
                    that.setData({
                      userTel: true,
                      isCover: false
                    })
                    var options = wx.getStorageSync('options')
                    if (options) {
                      that.jump(options)
                    }

                  }
                },
                fail: function (res) {
                }
              })
            }
          })
          
         
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });    
  }, //用户名和密码输入框事件
  userNumberInput: function (e) {
    this.setData({
      userNumber: e.detail.value
    })
  },
  userCodeInput: function (e) {
    this.setData({
      userCode: e.detail.value
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  toAdsense: function (e) {
    var item = e.currentTarget.dataset.url;
    // console.log(e)
    console.log(item)
    if (item){
      wx.navigateTo({
        url: '../index/webView?url=' + item
      })
    }
    
  },
  indexScan: function () {//扫一扫
    // wx.navigateTo({//测试用
    //   url: '../scan/scan'
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
                url: '../scan/cart?typeCart=2&&pid='+Request[1]
              })
            } else if (Request[0] == 'sid') {
              wx.navigateTo({
                url: '../scan/shelf?sid='+Request[1]
              })
            }
          }
        }
      }
    })
  },
  clearData:function (){//清除数据
    util.clearStorageData()
  },
  inntInfo:function (){//用户信息更新
    var userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    var uuid = wx.getStorageSync('userarg')
    //console.log(userInfo)
    var self =this
    wx.request({
      url: textUrl + 'user/inntInfo',
      data: {
        city: userInfo.city,
        country: userInfo.country,
        headimgurl: userInfo.avatarUrl,
        language: userInfo.language,
        nickname: userInfo.nickName,
        province: userInfo.province,
        sex: userInfo.gender,
        uuid: uuid
      },
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(res)
        // wx.showToast({
        //   title: '用户信息更新',
        //   duration: 1000,
        // })

      }
    })
  },
  getCode:function (){//获取code(弃用)
    var self = this
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.setStorageSync('code', res.code)
          self.setData({//本地存储给data赋值
            code: res.code,
          })
          console.log(res)
        } else {
          // console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },
  onLoad: function (options) {
    var that = this;
    this.clearData()
    // 登录
    if (options.q) {//通过微信扫码进入
      wx.setStorage({
        key: 'options',
        data: options,
        success: function (res) {
        }
      })
    }

    wx.getStorage(
      {
        key: 'userInfo',//判断是否授权
        success: function (res) {
          if (res.data) {
            var imageUrlJson = JSON.parse(res.data)
            if (imageUrlJson.avatarUrl == '') {
              imageUrlJson.avatarUrl = '/static/images/user-photo.gif'
            }
            that.setData({//本地存储给data赋值
              imageUser: imageUrlJson.avatarUrl,
            })
            //通过微信直接扫码(商品码huo货架吗)
            
          }
        },
        fail: function (res) {
          wx.redirectTo({//跳转到授权页面
            url: '/pages/toLogin/toLogin'
          })
        },
        complete: function (res) { }
      })
    // wx.getStorage(
    //   {
    //     key: 'code',//
    //     success: function (res) {
    //       if (res.data) {
    //         that.setData({//本地存储给data赋值
    //           code: res.data,
    //         })
    //       }
    //     }
    //   })
      wx.getStorage(
        {
          key: 'userTel',//判断是否登录
          success: function (res) {
            if (res.data) {
              that.setData({//本地存储给data赋值
                userTel: res.data,//res.data
                isCover: false
              })
              //that.upInfomation()//更新用户信息  自动获取优惠券
              that.jump(options)
            }
          },
          fail: function (res) {
            that.setData({//本地存储给data赋值
              userTel: false,
              isCover: true
            })
          },
          complete: function (res) { }
        })
      
    var uuid = wx.getStorageSync('userarg') || ''
    that.setData({//本地存储给data赋值
      uuid: uuid
    })
   
    
  },
  jump: function (options) { //通过微信直接扫码(商品码huo货架吗)
    //console.log(options)
    if (options.q) {//通过微信扫码进入
      var arr = decodeURIComponent(options.q).split('?')[1].split('=')
      console.log(arr)
      if (arr[0] == 'sid') {//货架
        wx.navigateTo({
          url: '../scan/shelf?sid=' + arr[1]
        })
      } else if (arr[0] == 'pid') {//商品码
        wx.navigateTo({
          url: '../scan/cart?typeCart=2&&pid=' + arr[1]
        })
      }
    }
  },
  onShow: function () {
    // 获取广告
    //  位置参数 foot为支付后轮播图，banner为首页轮播图，indexfoot为首页底部广告
    //  请求上部轮播图
    this.clearData()
    var uuid = wx.getStorageSync('userarg')
    if(uuid){
      console.log(uuid)
      console.log('更新信息')
      this.inntInfo()//获取用户信息
    }
    var that = this;
    wx.request({//获取轮播图
      url: textUrl + 'sms/getAdsenseList',
      data: {
        position: 'banner'
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
          imgUrlsBanner: arrImg
        });
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
    // 请求下部广告
    wx.request({//获取轮播图
      url: textUrl + 'sms/getAdsenseList',
      data: {
        position: 'indexfoot'
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

        if (res == null || res.data == null) {
          reject(new Error('网络请求失败'))
        }
      },
      success: function (res) {
        console.log(res)
        if (res.data.code == 0) {
          resolve(res)
        }
      }
    })
  }
})
