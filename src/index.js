const Crawler = require('crawler');
const { toExcel } = require('./excel');
let data = []
let shopNum = 0
let hasGetPageNum = false
function getCurPage(url) {
    if (!url) {
        return 0
    }
    var query = url.split('?')[1]
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == '_pgn') {
            return pair[1];
        }
    }
    return (false);
}
let query = 'pop it fidget toy'
query = query.split(' ').join('+')
const url = 'https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p2380057.m570.l1311&_nkw=' + query + '&_sacat=0'
const c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            if (!hasGetPageNum) {
                shopNum = $('.srp-controls__count-heading').find('span:first-child').text()
                shopNum = shopNum.split(',').join('')
                const pageNum = Math.ceil(parseInt(shopNum) / 50)
                hasGetPageNum = true
                for (let i = 2; i < pageNum; i++) {
                    c.queue([{
                        uri: 'https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p2380057.m570.l1311&_nkw=' + query + '&_sacat=0&_pgn=' + i,
                        page: i
                    }])
                }
                console.log('总共有'+pageNum+'页，共'+shopNum+'条数据')

            }
            const shopUrlDOM = $('.srp-river-results .s-item__link');
            console.log(`开始获取第${res.options.page}页商品，共${shopUrlDOM.length}条`)
            for (let i = 0; i < shopUrlDOM.length; i++) {
                const shopUrl = shopUrlDOM[i].attribs.href;
                c.queue([{
                    uri: shopUrl,
                    page: res.options.page,
                    shopIndex:i+1,
                    callback: (err, res, done) => {
                        const $ = res.$;
                        const userUrl = $('.mbg').find('a').attr('href');
                        console.log(`开始获取第${res.options.page}页第${res.options.shopIndex}条用户详情页`)
                        c.queue({
                            uri: userUrl,
                            page: res.options.page,
                            shopIndex: i+1,
                            callback: (err, res, done) => {
                                console.log('已爬取第' + res.options.page + '页，第', (res.options.shopIndex ) + '个商品的邮箱')
                                const $ = res.$;
                                const email = $('#email').next().text()
                                const bizName = $('#business_name').next().text()
                                const url = userUrl
                                data.push({
                                    email,
                                    bizName,
                                    url
                                })
                                done()
                            }
                        })
                        done()
                    }
                }])
            }
        }
        done();
    }
});
c.on('drain', () => {
    console.log('爬取完成,正在导出Excel...')
    toExcel(data)
})
c.queue([{
    uri: url,
    page: 1
}]);