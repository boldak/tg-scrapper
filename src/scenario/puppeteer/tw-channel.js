const browser = require('./lib/browser');
const { extend } = require("lodash");
const _md5 = require("md5")





const selector = {
    // awaitPageRendered:'#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-1gm7m50.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(3) > section',
    awaitPageRendered:'div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-dnmrzs > div',
    title:'div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-dnmrzs > div',
    description:'body > div.tgme_page_wrap > div.tgme_page.tgme_page_post > div.tgme_page_action.tgme_page_context_action > div > a',
    image: 'div.tgme_channel_info',
    messages: 'div.tgme_channel_info_header_title > span',  
}


async function fetchData(browser, config){
    let page = await browser.newPage();
    page.goto('https://twitter.com/search?f=tweets&vertical=default&q=GoogleAI&src=typd')//config.url)

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        console.log(request)
        request.continue();
        
        // if (request.resourceType() === 'document') {
        //     request.continue();
        // } else {
        //     request.abort();
        // }
    });
    
    try {
        console.log(config)
        //set viewport for the autoscroll function
        // await page.setViewport({
        //     width: 1200,
        //     height: 800
        // });

        //scroll until twitter is done lazy loading
        // await autoScroll(page);

        await page.waitForSelector('.js-stream-tweet');
        let html = page.content()
        // let html = page.$eval('.js-stream-tweet',element => element.innerHTML)
        let md5 = _md5(html)
        // let title = await page.$eval(selector.title, element => element.innerHTML)
        // let image = await page.$eval(selector.image, element => element.src)
        // let description = await page.$eval(selector.description, element => element.innerHTML)
        // console.log(title)
        return {
            html,
            // title,
            // description,
            // image,
            md5
        }
            
    } catch (e){
        console.log(e.toString())
        return {
            error: e.toString()
        }
    }    
        
}




async function getChannelInfo(config){
    console.log(config)
    browserInstance = await browser.startBrowser();
    let newConfig = await fetchData(browserInstance, config) 
    newConfig = extend ({url: config.url}, newConfig)
    await browser.close()
    return newConfig
}


module.exports = {
    run: getChannelInfo
}

