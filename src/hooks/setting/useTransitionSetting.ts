/*
 * @Author: atdow
 * @Date: 2022-10-01 16:25:07
 * @LastEditors: null
 * @LastEditTime: 2023-02-17 23:42:19
 * @Description: file description
 */
import type { TransitionSetting } from '/#/config';

import { computed } from 'vue';

import { useAppStore } from '/@/store/modules/app';

export function useTransitionSetting() {
  const appStore = useAppStore();

  const getEnableTransition = computed(() => appStore.getTransitionSetting?.enable);

  const getOpenNProgress = computed(() => appStore.getTransitionSetting?.openNProgress);

  // 暴露出去的是响应式的
  const getOpenPageLoading = computed((): boolean => {
    return !!appStore.getTransitionSetting?.openPageLoading;
  });

  const getBasicTransition = computed(() => appStore.getTransitionSetting?.basicTransition);

  function setTransitionSetting(transitionSetting: Partial<TransitionSetting>) {
    appStore.setProjectConfig({ transitionSetting });
  }
  return {
    setTransitionSetting,

    getEnableTransition,
    getOpenNProgress,
    getOpenPageLoading,
    getBasicTransition,
  };
}
