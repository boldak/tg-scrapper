const { extend, differenceBy, last } = require("lodash")
let axios = require("axios")
let cheerio = require("cheerio")
let md5 = require("md5")

let getChannelMetadata = data => {
    $ = cheerio.load(data.update.html)
    
    let title = $('div.tgme_channel_info_header_title > span').text()
    let description = $('div.tgme_channel_info_description').html()
    let image = $('div.tgme_channel_info > div.tgme_channel_info_header > i > img').attr("src") 
    
    let lastMessages = []
    $('div.tgme_widget_message_bubble').each( (index, element) => {
        $(element).find("br").before("\n").remove()
        let text = $(element).find("div.tgme_widget_message_text").text().replace(/[\u2000-\uffff]+/g, " ")
        let html = $(element).find("div.tgme_widget_message_text").html()
        let createdAt = $(element).find("time").attr("datetime")
        
        lastMessages.push({
            source:"telegram",
            url:data.url,
            channel:`@${last(data.url.split("/"))}`,
            html,
            text,
            md5: md5(text),
            createdAt 
        })
    })

    return extend( data, {
        title,
        description,
        image,
        lastMessages
    })
}


let getMetadataDiff = (config, newConfig) => {
    
    if(config.update && (config.update.md5 == newConfig.update.md5) ) return null
    config.lastMessages  = config.lastMessages || []
    newConfig.lastMessages = newConfig.lastMessages || []

    return {
        messages: differenceBy(newConfig.lastMessages, config.lastMessages,"md5")
    }    
}


 async function getChannelInfo(config){
    return axios(
            {
                method:"GET",
                url: config.url.replace("https://t.me/", "https://t.me/s/")
            }
        ).then( response => {
            let newConfig = extend({url:config.url},{
                update:{
                        html:response.data,
                        updatedAt: new Date(),
                        md5: md5(response.data)
                    }
                }
            )
            newConfig = extend(newConfig, getChannelMetadata(newConfig))
            newConfig.diff = getMetadataDiff(config, newConfig)

            return newConfig    

        })
 }

module.exports = {
    run: getChannelInfo
}

