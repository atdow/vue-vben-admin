import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
import { AxiosCanceler } from '/@/utils/http/axios/axiosCancel';
import { Modal, notification } from 'ant-design-vue';
import { warn } from '/@/utils/log';
import { unref } from 'vue';
import { setRouteChange } from '/@/logics/mitt/routeChange';
import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';
import nProgress from 'nprogress';
import projectSetting from '/@/settings/projectSetting';
import { createParamMenuGuard } from './paramMenuGuard';

// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createPageGuard(router); // 记录page是否已经loaded，同时暴露listenerRouteChange监听路由变化的函数
  createPageLoadingGuard(router); // 根据配置，选择是否维护PageLoading的状态
  createHttpGuard(router); // 根据配置，选择是否移除之前的所有请求
  createScrollGuard(router); // 每次路由变化时手动调用回到顶部
  createMessageGuard(router); // 根据配置，选择是否清除所有message通知(Modal、notification)
  createProgressGuard(router); // 根据配置，选择是否维护顶部顶部进度条状态
  createPermissionGuard(router);
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  createStateGuard(router);
}

/**
 * Hooks for handling page state
 */
function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>(); // 记录page是否已经loaded

  router.beforeEach(async (to) => {
    // The page has already been loaded, it will be faster to open it again, you don’t need to do loading and other processing
    to.meta.loaded = !!loadedPageMap.get(to.path);
    // Notify routing changes
    setRouteChange(to); // 通知route发生改变，里面暴露了listenerRouteChange监听路由变化的函数

    return true;
  });

  router.afterEach((to) => {
    loadedPageMap.set(to.path, true);
  });
}

// Used to handle page loading status
function createPageLoadingGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const appStore = useAppStoreWithOut();
  const { getOpenPageLoading } = useTransitionSetting(); // 获取是否打开页面的loading状态配置
  router.beforeEach(async (to) => {
    // 防止请求登录的时候也显示页面loading
    if (!userStore.getToken) {
      return true;
    }
    // 加载过了就不再显示页面loading
    if (to.meta.loaded) {
      return true;
    }

    if (unref(getOpenPageLoading)) {
      appStore.setPageLoadingAction(true);
      return true;
    }

    return true;
  });
  router.afterEach(async () => {
    if (unref(getOpenPageLoading)) {
      // TODO Looking for a better way
      // The timer simulates the loading time to prevent flashing too fast,
      setTimeout(() => {
        appStore.setPageLoading(false);
      }, 220);
    }
    return true;
  });
}

/**
 * The interface used to close the current page to complete the request when the route is switched
 * @param router
 */
function createHttpGuard(router: Router) {
  const { removeAllHttpPending } = projectSetting; // 获取是否移除所有pending状态配置
  let axiosCanceler: Nullable<AxiosCanceler>;
  if (removeAllHttpPending) {
    axiosCanceler = new AxiosCanceler();
  }
  router.beforeEach(async () => {
    // Switching the route will delete the previous request
    axiosCanceler?.removeAllPending();
    return true;
  });
}

// Routing switch back to the top
function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return /^#/.test(href);
  };

  const body = document.body;

  router.afterEach(async (to) => {
    // scroll top
    // hash的时候有缓存，只有hash的时候才需要手动去回到顶部
    isHash((to as RouteLocationNormalized & { href: string })?.href) && body.scrollTo(0, 0);
    return true;
  });
}

/**
 * Used to close the message instance when the route is switched
 * @param router
 */
export function createMessageGuard(router: Router) {
  const { closeMessageOnSwitch } = projectSetting; // 获取是否清除所有message通知配置

  router.beforeEach(async () => {
    // console.log(111);
    try {
      if (closeMessageOnSwitch) {
        Modal.destroyAll();
        notification.destroy();
      }
    } catch (error) {
      warn('message guard error:' + error);
    }
    return true;
  });
}

export function createProgressGuard(router: Router) {
  const { getOpenNProgress } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true;
    }
    unref(getOpenNProgress) && nProgress.start();
    return true;
  });

  router.afterEach(async () => {
    unref(getOpenNProgress) && nProgress.done();
    return true;
  });
}
