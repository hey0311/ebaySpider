const fs = require('fs')
const xlsx = require('node-xlsx')
const nodeExcel = require('excel-export')

// 读取Excel
// let exceldata = xlsx.parse('./' + 'xxx.xlsx')
// let exportData = []
// for (let rowId in exceldata[0]['data']) {
//     let row = exceldata[0]['data'][rowId]
//     exportData.push(row[0])
// }


exports.toExcel = function (rawdata) {
    // 去重
    console.log('共'+rawdata.length+'条数据')
    data = rawdata.filter(item=>item.email)
    console.log('过滤空邮箱数据，剩余'+(data.length)+'条')
    let dataMap ={}
    for(let i = 0;i<data.length;i++){
        dataMap[data[i].email]=data[i]
    }
    console.log('过滤重复邮箱数据，剩余'+(Object.keys(dataMap).length)+'条')
    // 导出Excel
    let conf = {} // excel配置
    conf.name = 'sheet' //表格名
    // 列名和类型
    conf.cols = [
        {
            caption: 'bisiness Name',
            type: 'string',
        },
        {
            caption: 'email',
            type: 'string',
        },
        {
            caption: 'url',
            type: 'string',
        },
    ]

    let excelData = new Array()
    const dataMapKeys = Object.keys(dataMap);
    for (var i = 0; i < dataMapKeys.length; i++) {
        const item = dataMap[dataMapKeys[i]]
        let arr = new Array()
        arr.push(item.bizName)
        arr.push(item.email)
        arr.push(item.url)
        excelData.push(arr)
    }
    conf.rows = excelData
    const date = new Date()
    let result = nodeExcel.execute(conf)
    let path = `${__dirname}/email_${date.toLocaleString()}.xlsx`
    fs.writeFile(path, result, 'binary', (err) => {
        err ? console.log(err) :console.log('已成功导出到email_'+date.toLocaleString()+'.xlsx')
    })
}