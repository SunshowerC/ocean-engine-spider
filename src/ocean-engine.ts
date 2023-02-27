
import puppeteer, { Page, Browser } from 'puppeteer'
import cookieList from './cookie.json'
import { dateFormat, wait } from './utils'
import fs from 'fs'

export class OceanEngineBusiness {
  constructor(public username: string, public password: string) {
    // this.username = username;
    // this.password = password;
  }
  
  page!: Page
  browser!: Browser

  pageMap = {
    login: `https://business.oceanengine.com/login?appKey=51`,
    dashboard: `https://business.oceanengine.com/site/dashboard`,
    liveData: `https://business.oceanengine.com/site/operate/bp/live`
  }

  private async init() {
    if(!this.page) {
      this.browser = await puppeteer.launch({
        headless: process.env.NODE_ENV !== 'development', // dev debug
        defaultViewport: {
          width: 1292,
          height: 886
        }, 
      });
      this.page = await this.browser.newPage();

      await this.setCookies()
    }
  }

  async run() {
    await this.init()
    if(process.env.NEW_ACC) {
      await this.logout()
      await wait(2000)
    }
    await this.toLiveDataPage()

    const data = await this.parseData()
    await this.storeData(data)

  }

  /**
   * 前往数据分析页
   * @returns 
   */
  async toLiveDataPage() {
    await this.page.goto(this.pageMap.liveData, {
      // waitUntil: 'networkidle2'
    })
    console.log('wait live page...')
    // 未登录情况下，会重定向到登录页，重新登录
    const navigateResult = await this.page.waitForNavigation({
      // waitUntil: 'networkidle2',
      timeout: 5000
    }).catch(_=> null)

    const isRedirectToLogin = !!navigateResult
    const cookies = await this.page.cookies()

    
    if(isRedirectToLogin) {
      await this.login()
      await this.toLiveDataPage()
      return
    } else {
      fs.writeFileSync('./src/cookie.json', JSON.stringify(cookies), 'utf8' )
    }
  }


  /**
   * 设置登录状态信息，伪装正常用户，绕过验证码机制（验证码会在初次登录，或者缺失某些关键 cookie 时触发）
   */
  async setCookies() {
    const initCookiesList = cookieList.filter(item => item.name)
    await this.page.setCookie(...cookieList as any)
  }
  
  /**
   * 登录操作
   * @returns 
   */
  private async login() {
    
    const selector = {
      email: 'input[name="email"]',
      password: 'input[name="password"]',
      check: '#account-sdk > section > div.account-center-input-agreement  div.account-center-agreement-check:not(.checked)',
      submit: '#account-sdk > section > div.account-center-submit > button',
      captcha: "#account-sdk-slide-container > div.captcha_verify_container"
    }

    try {
      // 导航到登录页
      await this.page.goto(this.pageMap.login, {
        waitUntil: 'networkidle2'
      });



      
      await this.page.waitForSelector(selector.email)
      // 登录填写表单
      await this.page.type(selector.email, this.username);
      await this.page.type(selector.password, this.password);
      await this.page.click(selector.check);

      // 确定登陆
      await this.page.click(selector.submit);



      


      console.log('wait login redirect...')
      await this.page.waitForNavigation().catch(e=>{
        console.error('存在验证码，请手动通过验证')
      });

      // 检查是否存在滑块验证码
      // const hasCaptcha = await this.page.$(selector.captcha)
      // if(hasCaptcha) {
      //   console.log('存在验证码，请手动通过验证')
      // }

      const url = await this.page.url();
      const isLoginSuc = url.includes(this.pageMap.dashboard)
      if (!isLoginSuc) {
        throw new Error('Login failed.');
      }


      


      return this.page;
    } catch (error) {

      await this.browser.close();
      throw error;
    }
  }

  private async logout() {
    const url = `https://business.oceanengine.com/account/api/access/logout?next=`

    await this.page.goto(url)
    console.log('wait logout navigate')
    // await this.page.waitForNavigation()
  }


  /**
   * 解析数据
   */
  async parseData() {
    const urlObj = new URL(this.page.url()) 
    const ccId = urlObj.searchParams.get('cc_id')
    const curDateStr = dateFormat(Date.now(), 'YYYY-MM-DD')
    const dataApi = `https://business.oceanengine.com/nbs/api/bm/operate/live_summary/room_data_overview_total?group_id=${ccId}&start_time=${curDateStr}&end_time=${curDateStr}`
    await this.page.goto(dataApi)
    const dataContent = await this.page.content()
    const jsonStr = dataContent.match(/>({.*})</)?.[1] 
    const jsonResp = JSON.parse(jsonStr || '{}')

    return jsonResp?.data?.overview
  }

  /**
   * 数据存储
   */
  storeData(data: {
    // 平均观看次数
    avg_views_count: number
    // 累计观看次数
    cumulative_views_count: number
    // 在线数量
    line_online_count: number 
    // 推广中的账号数量
    promotion_count: number
  }) {

    console.log(`当前直播数据汇总：
    平均观看次数：${data?.avg_views_count},
    累计观看次数：${data?.cumulative_views_count},
    在线数量：${data?.line_online_count},
    推广中的账号数量：${data?.promotion_count}
    `)

  }


  /**
   * 关闭页面窗口
   */
  async close() {
    await this.page.browser().close();
  }
}



