/*
 * @Author: atdow
 * @Date: 2022-10-01 16:25:07
 * @LastEditors: null
 * @LastEditTime: 2023-02-17 23:28:27
 * @Description: file description
 */
/**
 * Used to monitor routing changes to change the status of menus and tabs. There is no need to monitor the route, because the route status change is affected by the page rendering time, which will be slow
 */

import mitt from '/@/utils/mitt';
import type { RouteLocationNormalized } from 'vue-router';
import { getRawRoute } from '/@/utils';

const emitter = mitt();

const key = Symbol();

let lastChangeTab: RouteLocationNormalized; // 提取共享

export function setRouteChange(lastChangeRoute: RouteLocationNormalized) {
  const r = getRawRoute(lastChangeRoute); // 重写route的matched属性，简化属性
  // console.log('key:', key);
  emitter.emit(key, r);
  lastChangeTab = r;
}

export function listenerRouteChange(
  callback: (route: RouteLocationNormalized) => void,
  immediate = true,
) {
  emitter.on(key, callback);
  immediate && lastChangeTab && callback(lastChangeTab);
}

export function removeTabChangeListener() {
  emitter.clear();
}
