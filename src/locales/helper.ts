/*
 * @Author: atdow
 * @Date: 2023-02-15 10:38:44
 * @LastEditors: null
 * @LastEditTime: 2023-05-29 18:28:42
 * @Description: file description
 */
import type { LocaleType } from '/#/config';

import { set } from 'lodash-es';

export const loadLocalePool: LocaleType[] = [];

export function setHtmlPageLang(locale: LocaleType) {
  document.querySelector('html')?.setAttribute('lang', locale);
}

export function setLoadLocalePool(cb: (loadLocalePool: LocaleType[]) => void) {
  cb(loadLocalePool);
}

// 将文件映射转为标准object对象映射
export function genMessage(langs: Record<string, Record<string, any>>, prefix = 'lang') {
  const obj: Recordable = {};
  // console.log('langs:', langs);
  Object.keys(langs).forEach((key) => {
    const langFileModule = langs[key].default;
    let fileName = key.replace(`./${prefix}/`, '').replace(/^\.\//, '');
    const lastIndex = fileName.lastIndexOf('.');
    fileName = fileName.substring(0, lastIndex);
    const keyList = fileName.split('/');
    const moduleName = keyList.shift();
    const objKey = keyList.join('.');

    if (moduleName) {
      if (objKey) {
        set(obj, moduleName, obj[moduleName] || {});
        set(obj[moduleName], objKey, langFileModule);
      } else {
        set(obj, moduleName, langFileModule || {});
      }
    }
  });
  // console.log('obj:', obj);
  return obj;
}
