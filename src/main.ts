import { OceanEngineBusiness } from "./ocean-engine";


const userInfo = {
  account: process.env.ACCOUNT, //|| `1300546909@qq.com`,
  password: process.env.PW, // `Ocean123`,
}
if(!userInfo.account || !userInfo.password) {
  throw new Error('not valid account/password')
}

const main = async ()=>{
  
    try {
      const oceanEngineBusiness = new OceanEngineBusiness(userInfo.account!, userInfo.password!);
      const page = await oceanEngineBusiness.run();
  
  
      await oceanEngineBusiness.close();
    } catch (error) {
      console.error(error);
    }
  
}

main()




// fetch("https://business.oceanengine.com/nbs/api/bm/operate/live_summary/room_data_overview_total?group_id=1758636493483080&start_time=2023-02-23&end_time=2023-02-23&_signature=BPftDgAAAAC-3flq4JpQCwT37RAAGcG", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en,zh-CN;q=0.9,zh;q=0.8,zh-TW;q=0.7,ja;q=0.6,ru;q=0.5",
//     "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-csrftoken": "0w0IW4AdxbnVY1pgRpcPoC1w",
//     "x-sessionid": "20956e7e-20e4-48c8-8436-7b65cc4bd51b"
//   },
//   "referrer": "https://business.oceanengine.com/site/operate/bp/live?cc_id=1758636493483080",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "include"
// });