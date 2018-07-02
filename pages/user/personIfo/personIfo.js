const app = getApp()
var uuid = app.globalData.uuid
var textUrl = app.globalData.textUrl
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    birthday:'1990-01-01',
    ifo:{

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!uuid) {
      uuid = wx.getStorageSync('userarg')
    }
    this.requestPersonIfo()
  },
  bindBirthdayChange: function (e) {
    this.setData({
      'ifo.birth': e.detail.value
    })
  },
  saveBtn: function() {//保存按钮
    var self = this
    //var DATA = {"uuid":"41e88a10eb324a84aa14094255b4fbd6","birth":"1990-01-01"}
    wx.request({
      url: 'https://minisuperuat.shinshop.com/web/user/updateUserinfo?uuid=' + uuid+'&birth=' + this.data.ifo.birth,
      method: "post",
      header: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      success: function (res) {
        console.log(res)
        if (res.data.type =='success'){//修改成功
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
        }else{
          wx.showToast({
            title: '保存失败',
            image: '/static/images/error-icon.png',
            duration: 2000
          })
        }
      },
      fail: function (res){
       
      }
    })
  },
  requestPersonIfo: function (){//获取个人信息数据
    var self = this;
    var url = textUrl+'user/getUserinfo?uuid='+uuid
    wx.request({//
      url: url,
      method: "get",
      header: {
        "Content-Type": "application/text"
      },
      success: function (res) {
        var userInfo = JSON.parse(wx.getStorageSync('userInfo'))
        console.log(userInfo)
        //若接口无数据调用微信数据
        console.log(res)

        // if (userInfo.image == '') {
        //   userInfo.avataimagerUrl = '/static/images/user-photo.gif'
        // }
        if (!res.data.image){//头像
          res.data.image = '/static/images/user-photo.gif'
        }
        if (res.data.birth == null) {//生日
          res.data.birth = '请选择'
        }
        if (!res.data.gender){
          res.data.gender = userInfo.gender
        }
        if (!res.data.name) {
          res.data.name = userInfo.nickName
        }
        //手机号格式设置
        res.data.phone = res.data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        self.setData({
          ifo:res.data
        })
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
        wx.showToast({
          title: '请求数据失败',
          image: '/static/images/error-icon.png',
          duration: 2000
        })
      }
    }) 
  }

 
})