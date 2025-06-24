// src/utils/formatters.ts

/**
 * 格式化数字（添加千位分隔符）
 * @param num 要格式化的数字
 * @param decimals 保留小数位数（默认0）
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number | string, decimals: number = 0): string => {
    if (num === null || num === undefined) return '0';
    
    const number = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(number)) return '0';
    
    // 四舍五入到指定小数位
    const rounded = decimals > 0 
      ? Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
      : Math.round(number);
    
    // 添加千位分隔符
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  /**
   * 格式化货币
   * @param amount 金额
   * @param currency 货币符号（默认¥）
   * @param decimals 保留小数位数（默认2）
   * @returns 格式化后的货币字符串
   */
  export const formatCurrency = (amount: number | string, currency: string = '¥', decimals: number = 2): string => {
    return `${currency}${formatNumber(amount, decimals)}`;
  };
  
  /**
   * 格式化百分比
   * @param value 百分比值（0-100）
   * @param decimals 保留小数位数（默认1）
   * @returns 格式化后的百分比字符串
   */
  export const formatPercentage = (value: number | string, decimals: number = 1): string => {
    return `${formatNumber(value, decimals)}%`;
  };
  
  /**
   * 格式化日期
   * @param date 日期对象或字符串
   * @param format 格式（默认'YYYY-MM-DD'）
   * @returns 格式化后的日期字符串
   */
  export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  };
  
  /**
   * 格式化数据大小（B, KB, MB, GB）
   * @param bytes 字节数
   * @param decimals 保留小数位数（默认2）
   * @returns 格式化后的数据大小字符串
   */
  export const formatFileSize = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };