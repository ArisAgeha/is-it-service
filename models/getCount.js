let AV = require('./lc.js');
function getCountFromPointer(options) {
    // parentID, parentClassName: 父类名、父类的对象ID
    // childClassName: 要计数的子类名
    // dependent: 父类在子类中的pointer名

    let {parentID, parentClassName, childClassName, dependent} = options;
    let parentClass = AV.Object.createWithoutData(parentClassName, parentID);
    let query = new AV.Query(childClassName);
    query.equalTo(dependent, parentClass);
    return query.count();
}

function  getCountFromMap(options) {
    // queryClass: 用于要关联数据的类
    // mapName: 保存关联信息的中间表
    // dependent: 要关联的数据的类在中间表中的pointer名

    let {queryClassName, queryClassID, mapName, dependent} = options;
    let queryClass = AV.Object.createWithoutData(queryClassName, queryClassID);
    let query = new AV.Query(mapName);
    query.equalTo(dependent, queryClass);
    return query.count();
}

module.exports = {getCountFromPointer, getCountFromMap};
