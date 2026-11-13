import { defineStore } from 'pinia';
import type { ComponentSize } from 'element-plus';
import type { MenuItem } from '@/types/upms/menu';
import { findItemFromList } from '@/common/utils';
import { ANY_OBJECT } from '@/types/generic';
import { processMenu, findMenuItem, findMenuItemById } from './utils';

export type TagItemType = {
  // 唯一id
  id: string;
  // 显示名称
  tagName: string;
  // 路由名称
  routerName?: string;
  // 组件名称
  compomentName?: string;
  // query参数
  query?: ANY_OBJECT;
  // 菜单项
  menuItem?: MenuItem;
  deleted?: boolean;
  // 组件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compoment?: any;
};

export type EditFormParams = {
  // 唯一id
  id: string;
  // 表单参数
  formParams: string;
  // 回调函数
  callback?: () => void;
};

let addTagTimeer: ReturnType<typeof setTimeout> | null = null;

export default defineStore('layout', {
  state: () => {
    return {
      // 首页路由名称
      indexName: 'welcome',
      // 侧边栏是否折叠
      collapsed: false,
      // 是否多栏目
      supportColumn: false,
      // 是否多标签
      supportTags: false,
      // 标签列表
      tagList: new Array<TagItemType>(),
      // 当前标签
      currentTagId: '',
      // 菜单列表
      menuList: new Array<MenuItem>(),
      // 页面缓存列表(已弃用)
      // cachePages: new Array<string>(),
      // 当前菜单
      currentMenu: {} as MenuItem,
      currentMenuId: 'WORKBENCH_MENU_ID',
      // 当前栏目
      currentColumn: {} as MenuItem,
      // 当前formSize
      defaultFormItemSize: 'default' as ComponentSize,
      documentClientHeight: 200,
      mainContextHeight: 200,
      editFormParams: new Array<EditFormParams>(),
    };
  },
  getters: {
    currentMenuPath(): Array<MenuItem> {
      const menuPath: Array<MenuItem> = [];
      this.menuList.forEach(menu => {
        findMenuItem(menu, this.currentMenu.menuId, menuPath);
      });
      return menuPath;
    },
    currentColumnId(): string {
      return this.currentColumn.menuId;
    },
    currentFormSize(): string {
      return this.defaultFormItemSize;
    },
    getMenuList(): Array<MenuItem> {
      return this.menuList;
    },
  },
  actions: {
    setCollapsed(val: boolean) {
      this.collapsed = val;
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setMenuList(menuList: Array<MenuItem>) {
      menuList.forEach(item => {
        processMenu(item);
      });
      this.menuList = menuList;
      if (this.supportColumn && menuList && menuList.length) {
        this.currentColumn = menuList[0];
      }
    },
    setCurrentMenu(menu?: MenuItem | null) {
      if (menu == null || menu.menuId == null) {
        this.currentMenu = {} as MenuItem;
        this.setCurrentTagId('');
      } else {
        this.currentMenu = menu;
        if (this.supportTags) {
          const tagItem = this.tagList.find(item => {
            return item.menuItem?.menuId === menu.menuId;
          });
          if (tagItem) this.setCurrentTagId(tagItem.id);
        }
        this.currentMenuId = menu.menuId;
      }
    },
    setCurrentMenuId(menuId: string) {
      this.currentMenuId = menuId;
    },
    removeTag(id: string) {
      const pos = this.tagList.findIndex(item => item.id === id);
      if (pos === -1) return;
      this.tagList[pos].deleted = true;

      const formParamIndex = this.editFormParams.findIndex(item => item.id === id);
      if (formParamIndex > -1) {
        this.editFormParams.splice(formParamIndex, 1);
      }

      if (id === this.currentTagId) {
        // 关闭当前标签页
        if (pos !== -1) {
          const menuItem = pos > 0 ? this.tagList[pos - 1].menuItem : null;
          this.setCurrentMenu(menuItem);
          setTimeout(() => {
            this.tagList.splice(pos, 1);
            this.currentTagId = pos > 0 ? this.tagList[pos - 1].id : '';
          }, 50);
        }
      } else {
        // 关闭非当前标签页
        this.tagList.splice(pos, 1);
      }
    },
    closeOtherTags(id: string) {
      // 关闭其它标签
      const pos = this.tagList.findIndex(item => item.id === id);
      const formParamIndex = this.editFormParams.findIndex(item => item.id === id);
      if (pos !== -1) {
        const menuItem = this.tagList[pos].menuItem;
        this.setCurrentMenu(menuItem);
        setTimeout(() => {
          this.tagList = [this.tagList[pos]];
          this.currentTagId = id;
          if (formParamIndex > -1) {
            this.editFormParams = [this.editFormParams[formParamIndex]];
          } else {
            this.editFormParams = [];
          }
        }, 50);
      }
    },
    clearAllTags() {
      // 关闭所有标签
      this.setCurrentMenu(null);
      setTimeout(() => {
        this.tagList = [];
        this.editFormParams = [];
        this.currentTagId = '';
      }, 50);
    },
    addTag(tag: TagItemType) {
      if (addTagTimeer != null) {
        clearTimeout(addTagTimeer);
        addTagTimeer = null;
      }
      addTagTimeer = setTimeout(() => {
        const item = findItemFromList(this.tagList, tag.id, 'id');
        if (item == null) {
          this.tagList.push(tag);
          this.currentTagId = tag.id;
        } else {
          item.compoment = tag.compoment;
        }
        addTagTimeer = null;
      }, 30);
    },
    setCurrentTagId(id: string) {
      this.currentTagId = id;
    },
    setCurrentColumn(column: MenuItem) {
      this.currentColumn = column;
    },
    removeCachePage(id: string) {
      this.removeTag(id);
    },
    setCurrentFormSize(size: ComponentSize) {
      this.defaultFormItemSize = size;
    },
    addEditFormParams(params: EditFormParams) {
      const existIndex = this.editFormParams.findIndex(item => item.id === params.id);
      if (existIndex === -1) {
        // 不存在则添加
        this.editFormParams.push(params);
      }
    },
  },
  persist: {
    // 开启持久存储
    enabled: true,
    // 指定哪些state的key需要进行持久存储
    // storage默认是 sessionStorage存储
    // paths需要持久存储的key
    strategies: [
      { key: 'tags', paths: ['tagList', 'currentTagId', 'currentMenuId', 'editFormParams'] },
      { key: 'menu', paths: ['currentColumn', 'currentMenu', 'menuList'] },
    ],
  },
});
