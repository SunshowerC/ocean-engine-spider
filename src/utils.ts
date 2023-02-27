export const dateFormat = (dateInput: any, format = 'yyyy-MM-dd HH:mm:ss') => {
  const dateObj = new Date(dateInput)

  if (!dateObj.getFullYear()) {
    console.error(dateInput, dateObj)
    return dateInput
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  const [year, month, date, hour, minute, second] = [
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    dateObj.getHours(),
    dateObj.getMinutes(),
    dateObj.getSeconds()
  ]

  const dateMap:Record<string,any> = {
    yyyy: year, // 年份
    YYYY: year, // 年份

    eM: months[month], // 英语月份
    MM: (month + 1 + '').padStart(2, '0'), // 月份，两位数加0
    M: month + 1, // 月份，不加0

    DD: (date + '').padStart(2, '0'), // 日期，两位数加0
    dd: (date + '').padStart(2, '0'), // 日期，两位数加0
    d: date, // 日期，不加0

    HH: (hour + '').padStart(2, '0'), // 24小时进制，两位数加0
    H: hour,
    hh: (hour % 12 + '').padStart(2, '0'), // 12小时进制
    h: hour % 12,
    mer: hour > 12 ? 'pm' : 'am', // 上午还是下午

    mm: (minute + '').padStart(2, '0'), // 分钟
    m: minute,

    ss: (second + '').padStart(2, '0'), // 秒
    s: second
  }

  const reg = /eM|mer|yyyy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s/g

  return format.replace(reg, (match) => dateMap[match])
}


export const wait = (delay: number)=>{
  return new Promise<void>((resolve)=>{
    setTimeout(resolve, delay)
  })
}
