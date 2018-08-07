// 存储服务
var AV = require('leancloud-storage');
var { Query, User } = AV;
var APP_ID = 'y2m45lUs9BdQiyg4Ca1N5rYe-gzGzoHsz';
var APP_KEY = 'x1iC7ULuEq9s83VnSat3GQIH';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

module.exports = AV;
