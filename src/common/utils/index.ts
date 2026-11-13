import { JSEncrypt } from 'jsencrypt';
import dayjs from 'dayjs';
import { ANY_OBJECT } from '@/types/generic';
import { EnumFileType } from '@/common/staticDict/index';
import {useLoginStore} from "@/store";
import {SysUserController} from "@/api/generated";
import { BaseController } from '@/api/BaseController';
import router from '@/router'
import { API_CONTEXT } from '@/api/config';
import { closeToast, showLoadingToast } from 'vant';
// import { ElMessage } from 'element-plus';

/**
 * 列表数据转换树形数据
 * @param {Array} data 要转换的列表
 * @param {String} id 主键字段字段名
 * @param {String} pid 父字段字段名
 * @returns {Array} 转换后的树数据
 */
export function treeDataTranslate<D>(data: Array<D>, id = 'id', pid = 'parentId'): D[] {
  const res: D[] = [];
  const temp: ANY_OBJECT = {};
  const dataList: ANY_OBJECT[] = data.map(item => {
    return { ...item } as ANY_OBJECT;
  });
  for (let i = 0; i < dataList.length; i++) {
    const d = dataList[i];
    if (d) {
      temp[d[id]] = dataList[i];
    }
  }
  for (let k = 0; k < dataList.length; k++) {
    const d = dataList[k];
    if (d) {
      if (temp[d[pid]] && d[id] !== d[pid]) {
        if (!temp[d[pid]]['children']) {
          temp[d[pid]]['children'] = [];
        }
        if (!temp[d[pid]]['_level']) {
          temp[d[pid]]['_level'] = 1;
        }
        d['_level'] = temp[d[pid]]._level + 1;
        d['_parent'] = d[pid];
        temp[d[pid]]['children'].push(d);
      } else {
        res.push(d as D);
      }
    }
  }

  return res;
}
/**
 * 获取字符串字节长度（中文算2个字符）
 * @param {String} str 要获取长度的字符串
 */
export function getStringLength(str: string) {
  return str.replace(/[\u4e00-\u9fa5\uff00-\uffff]/g, '**').length;
}
/**
 * 获取uuid
 */
export function getUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const random: number = Math.random() * 16;
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function stringCase(str: string, type: number) {
  if (str == null || str === '') return str;
  if (type === 0) {
    // 首字母小写
    return str.slice(0, 1).toLowerCase() + str.slice(1);
  } else {
    // 首字母大写
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  }
}

/**
 * 大小驼峰变换函数
 * @param name 要转换的字符串
 * @param type 转换的类型0：转换成小驼峰，1：转换成大驼峰
 */
export function nameTranslate(name: string, type: 0 | 1) {
  name = name.toLowerCase();
  let nameArray = name.split('_');
  nameArray.forEach((item, index) => {
    if (index === 0) {
      name = type === 1 ? item.slice(0, 1).toUpperCase() + item.slice(1) : item;
    } else {
      name = name + item.slice(0, 1).toUpperCase() + item.slice(1);
    }
  });

  nameArray = name.split('-');
  nameArray.forEach((item, index) => {
    if (index === 0) {
      name = type === 1 ? item.slice(0, 1).toUpperCase() + item.slice(1) : item;
    } else {
      name = name + item.slice(0, 1).toUpperCase() + item.slice(1);
    }
  });
  return name;
}
/**
 * 通过id从树中获取指定的节点
 * @param {Object} node 根节点
 * @param {String|Nubmer} id 键值
 * @param {Array} list 保存查询路径
 * @param {String} idKey 主键字段名
 * @param {String} childKey 子节点字段名
 */
function findNode(
  node: ANY_OBJECT,
  id: string | number | undefined,
  list?: Array<ANY_OBJECT> | undefined,
  idKey = 'id',
  childKey = 'children',
): ANY_OBJECT | undefined {
  if (Array.isArray(list)) list.push(node);
  if (node[idKey] === id) {
    return node;
  }

  if (node[childKey] != null && Array.isArray(node[childKey])) {
    for (let i = 0; i < node[childKey].length; i++) {
      const tempNode: ANY_OBJECT | undefined = findNode(
        node[childKey][i],
        id,
        list,
        idKey,
        childKey,
      );
      if (tempNode) return tempNode;
    }
  }

  if (Array.isArray(list)) list.pop();
}
/**
 * 通过id返回从根节点到指定节点的路径
 * @param {Array} treeRoot 树根节点数组
 * @param {*} id 要查询的节点的id
 * @param {*} idKey 主键字段名
 * @param {*} childKey 子节点字段名
 */
export function findTreeNodeObjectPath(
  treeRoot: ANY_OBJECT,
  id: string | number | undefined,
  idKey = 'id',
  childKey = 'children',
) {
  const tempList: ANY_OBJECT[] = [];
  for (let i = 0; i < treeRoot.length; i++) {
    if (findNode(treeRoot[i], id, tempList, idKey, childKey)) {
      return tempList;
    }
  }

  return [];
}

export function findTreeNodePath<D>(
  treeRoot: Array<D>,
  id: string | number | undefined,
  idKey = 'id',
  childKey = 'children',
): Array<string | number> {
  return (findTreeNodeObjectPath(treeRoot, id, idKey, childKey) || []).map(item => item[idKey]);
}

export function findTreeNodeImpl(node, call, list, childKey = 'children') {
  if (Array.isArray(list)) list.push(node);
  if (call(node)) {
    return node;
  }

  if (node[childKey] != null && Array.isArray(node[childKey])) {
    for (let i = 0; i < node[childKey].length; i++) {
      const tempNode = findTreeNodeImpl(node[childKey][i], call, list, childKey);
      if (tempNode) return tempNode;
    }
  }

  if (Array.isArray(list)) list.pop();
}

/**
 * 通过id从树中查找节点
 * @param {Array} treeRoot 根节点数组
 * @param {*} id 要查找的节点的id
 * @param {*} idKey 主键字段名
 * @param {*} childKey 子节点字段名
 */
export function findTreeNode(
  treeRoot: ANY_OBJECT,
  id: string,
  idKey = 'id',
  childKey = 'children',
) {
  for (let i = 0; i < treeRoot.length; i++) {
    const tempNode = findNode(treeRoot[i], id, undefined, idKey, childKey);
    if (tempNode) return tempNode;
  }
}

export function traverseTree(
  root: ANY_OBJECT,
  callback: (node: ANY_OBJECT, path: ANY_OBJECT[]) => boolean,
  childKey = 'children',
) {
  const path: ANY_OBJECT[] = [];
  function traverseNode(node: ANY_OBJECT) {
    path.push(node);
    if (typeof callback === 'function') {
      if (callback(node, path)) return;
    }
    if (Array.isArray(node[childKey])) {
      node[childKey].forEach((suNode: ANY_OBJECT) => {
        traverseNode(suNode);
      });
    }
    path.pop();
  }
  if (Array.isArray(root)) {
    root.forEach(node => {
      traverseNode(node);
    });
  }
}

/**
 * 把Object转换成query字符串
 * @param {Object} params 要转换的Object
 */
export function objectToQueryString(params: ANY_OBJECT | null) {
  if (params == null) {
    return null;
  } else {
    return Object.keys(params)
      .map(key => {
        if (params[key] !== undefined) {
          return `${key}=${params[key]}`;
        } else {
          return undefined;
        }
      })
      .filter(item => item != null)
      .join('&');
  }
}
/**
 * 从数组中查找某一项
 * @param {Array} list 要查找的数组
 * @param {String} id 要查找的节点id
 * @param {String} idKey 主键字段名（如果为null则直接比较）
 * @param {Boolean} removeItem 是否从数组中移除查找到的节点
 * @returns {Object} 找到返回节点，没找到返回undefined
 */
export function findItemFromList(
  list: ANY_OBJECT[],
  id: string | number | undefined | null,
  idKey: string | null = 'id',
  removeItem = false,
) {
  if (Array.isArray(list) && list.length > 0 && id != null) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (
        ((idKey == null || idKey === '') && item.toString() === id) ||
        (idKey != null && item[idKey] === id)
      ) {
        if (removeItem) list.splice(i, 1);
        return item;
      }
    }
  }
  return null;
}
/**
 * 将数据保存到sessionStorage
 * @param {*} key sessionStorage的键值
 * @param {*} value 要保存的数据
 */
export function setObjectToSessionStorage(key: string, value: ANY_OBJECT) {
  if (key == null || key === '') return false;
  if (value == null) {
    window.sessionStorage.removeItem(key);
    return true;
  } else {
    const jsonObj = {
      data: value,
    };
    window.sessionStorage.setItem(key, JSON.stringify(jsonObj));
    return true;
  }
}
/**
 * 从sessionStorage里面获取数据
 * @param {String} key 键值
 * @param {*} defaultValue 默认值
 */
export function getObjectFromSessionStorage(key: string, defaultValue: ANY_OBJECT): ANY_OBJECT {
  let jsonObj: ANY_OBJECT;
  try {
    const val: string | null = sessionStorage.getItem(key);
    if (val == null) return defaultValue;
    jsonObj = JSON.parse(val);
    jsonObj = (jsonObj || {}).data;
  } catch (e) {
    jsonObj = defaultValue;
  }
  return jsonObj != null ? jsonObj : defaultValue;
}
/**
 * 判读字符串是否一个数字
 * @param {String} str 要判断的字符串
 */
export function isNumber(str: string) {
  const num = Number.parseFloat(str);
  if (Number.isNaN(num)) return false;
  return num.toString() === str;
}
/**
 * 生成随机数
 * @param {Integer} min 随机数最小值
 * @param {Integer} max 随机数最大值
 */
export function random(min: number, max: number) {
  const base = Math.random();
  return min + base * (max - min);
}
/**
 * 加密
 * @param {*} value 要加密的字符串
 */
const str1 = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpC4QMnbTrQOFriJJCCFFWhlruBJThAEBfRk7pRx1j'
const str2 = 'sAhyNVL3CqJb0tRvpnbCnJhrRAEPdgFHXv5A0RrvFp+5Cw7QoFH6O9rKB8+0H7+aVQeKI'
const publicKey = str1 + str2 + 'TMUHf/XMXioymw6Iq4QfWd8RhdtM1KM6eGTy8aU7SO2s69Mc1LXefg/x3yw6wIDAQAB';
export function encrypt(value: string): string | null {
  if (value == null || value === '') return null;
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encodeURIComponent(encrypt.encrypt(value));
}

export function getToken() {
  return sessionStorage.getItem('token');
}

export function setToken(token: string | null | undefined) {
  if (token == null || token === '') {
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
  }
}

export function getAppId() {
  const appId = sessionStorage.getItem('appId');
  return appId != null ? appId : undefined;
}

export function setAppId(appId: string | null | undefined) {
  if (appId == null || appId === '') {
    sessionStorage.removeItem('appId');
  } else {
    sessionStorage.setItem('appId', appId);
  }
}

export function traversalTree(
  treeNode: ANY_OBJECT,
  callback: (treeNode: ANY_OBJECT) => void,
  childrenKey = 'children',
) {
  if (
    treeNode != null &&
    Array.isArray(treeNode[childrenKey]) &&
    treeNode[childrenKey].length > 0
  ) {
    treeNode[childrenKey].forEach((childNode: ANY_OBJECT) => {
      traversalTree(childNode, callback, childrenKey);
    });
  }
  return typeof callback === 'function' ? callback(treeNode) : undefined;
}

export class TreeTableImpl {
  private options;
  private dataList;
  private dataMap;
  private checkedRows: Map<string, ANY_OBJECT> | undefined;

  constructor(
    dataList: Array<ANY_OBJECT>,
    options: {
      idKey: string;
      nameKey: string;
      parentIdKey: string;
      isLefeCallback: (item: ANY_OBJECT) => boolean | undefined;
      checkStrictly: boolean;
    },
  ) {
    this.options = {
      idKey: options ? options.idKey : 'id',
      nameKey: options ? options.nameKey : 'name',
      parentIdKey: options ? options.parentIdKey : 'parentId',
      isLefeCallback: options ? options.isLefeCallback : undefined,
      checkStrictly: options ? options.checkStrictly : false,
    };

    this.dataList = Array.isArray(dataList) ? dataList : [];
    this.dataMap = new Map();
    this.dataList.forEach(item => {
      this.dataMap.set(item[this.options.idKey], item);
    });
    // 表格选中行
    this.checkedRows = undefined;
    this.onCheckedRowChange = this.onCheckedRowChange.bind(this);
  }

  /**
   * 过滤表格数据
   * @param {string} filterString 过滤条件字符串
   * @param {boolean} onlyChecked 是否只显示选中节点
   * @returns {array} 过滤后的表格数据列表
   */
  getFilterTableData(filterString: string | null, onlyChecked = false) {
    const { idKey, nameKey, parentIdKey, isLefeCallback } = this.options;
    const tempMap = new Map();
    const parentIdList: ANY_OBJECT[] = [];
    this.dataList.forEach(item => {
      if (
        (filterString == null ||
          filterString === '' ||
          item[nameKey].indexOf(filterString) !== -1) &&
        (!onlyChecked || (this.checkedRows != null && this.checkedRows.get(item[idKey])))
      ) {
        if (!isLefeCallback || !isLefeCallback(item)) {
          parentIdList.push(item[idKey]);
        }
        // 将命中节点以及它的父节点都设置为命中
        let tempItem = item;
        do {
          tempMap.set(tempItem[idKey], tempItem);
          tempItem = this.dataMap.get(tempItem[parentIdKey]);
        } while (tempItem != null);
      }
    });

    return this.dataList.map(item => {
      let disabled = true;

      if (parentIdList.indexOf(item[parentIdKey]) !== -1 || tempMap.get(item[idKey]) != null) {
        if (
          parentIdList.indexOf(item[parentIdKey]) !== -1 &&
          (isLefeCallback == null || !isLefeCallback(item))
        ) {
          parentIdList.push(item[idKey]);
        }
        disabled = false;
      }

      return {
        ...item,
        __disabled: disabled,
      };
    });
  }

  /**
   * 获取表格树数据，计算选中状态
   * @param {array} dataList 表格列表数据
   */
  getTableTreeData(dataList: ANY_OBJECT[], checkedRows: Map<string, ANY_OBJECT>) {
    const { idKey, parentIdKey, checkStrictly } = this.options;
    let treeData: ANY_OBJECT[] = [];
    function calcPermCodeTreeAttribute(treeNode: ANY_OBJECT, checkedRows: Map<string, ANY_OBJECT>) {
      const checkedItem = checkedRows == null ? null : checkedRows.get(treeNode[idKey]);
      treeNode.__checked = checkedItem != null;
      // 是否所有子权限字都被选中
      let allChildChecked = true;
      // 是否任意子权限字被选中
      let hasChildChecked = false;
      // 如果存在子权限字
      if (Array.isArray(treeNode.children) && treeNode.children.length > 0) {
        treeNode.children.forEach((item: ANY_OBJECT) => {
          const isChecked = calcPermCodeTreeAttribute(item, checkedRows);
          hasChildChecked = hasChildChecked || isChecked;
          allChildChecked = allChildChecked && isChecked;
        });
      } else {
        allChildChecked = false;
      }
      treeNode.__indeterminate = !checkStrictly && hasChildChecked && !allChildChecked;
      treeNode.__checked = treeNode.__checked || (allChildChecked && !checkStrictly);
      return treeNode.__checked || treeNode.__indeterminate;
    }

    if (Array.isArray(dataList)) {
      treeData = treeDataTranslate(
        dataList.map(item => {
          return { ...item };
        }),
        idKey,
        parentIdKey,
      );
      treeData.forEach(item => {
        calcPermCodeTreeAttribute(item, checkedRows);
      });
    }

    return treeData;
  }

  /**
   * 树表格行选中状态改变
   * @param {object} row 选中状态改变行数据
   */
  onCheckedRowChange(row: ANY_OBJECT) {
    if (this.checkedRows == null) {
      this.checkedRows = new Map();
    } else {
      const temp = new Map();
      this.checkedRows.forEach((item, key) => {
        temp.set(key, item);
      });
      this.checkedRows = temp;
    }
    const { idKey } = this.options;
    if (!row.__checked || row.__indeterminate) {
      // 节点之前未被选中或者之前为半选状态，修改当前节点以及子节点为选中状态
      this.checkedRows.set(row[idKey], row);
      if (Array.isArray(row.children) && !this.options.checkStrictly) {
        row.children.forEach((childNode: ANY_OBJECT) => {
          traversalTree(childNode, node => {
            this.checkedRows?.set(node[idKey], node);
          });
        });
      }
    } else {
      // 节点之前为选中状态，修改节点以及子节点为未选中状态
      this.checkedRows.delete(row[idKey]);
      if (Array.isArray(row.children) && !this.options.checkStrictly) {
        row.children.forEach((childNode: ANY_OBJECT) => {
          traversalTree(childNode, node => {
            this.checkedRows?.delete(node[idKey]);
          });
        });
      }
    }
  }

  /**
   * 获取所有选中的权限字节点
   * @param {array} treeData 树数据
   * @param {boolean} includeHalfChecked 是否包含半选节点，默认为false
   * @returns {array} 选中节点列表
   */
  getCheckedRows(treeData: ANY_OBJECT, includeHalfChecked = false) {
    const checkedRows: ANY_OBJECT[] = [];

    function traversalCallback(node: ANY_OBJECT) {
      if (node == null) return;
      if (node.__checked || (includeHalfChecked && node.__indeterminate)) {
        checkedRows.push(node);
      }
    }

    if (Array.isArray(treeData) && treeData.length > 0) {
      treeData.forEach(permCode => {
        traversalTree(permCode, traversalCallback, 'children');
      });
    }

    return checkedRows;
  }

  /**
   * 设置选中节点
   * @param {array} checkedRows
   */
  setCheckedRows(checkedRows: ANY_OBJECT[]) {
    this.checkedRows = new Map();
    if (Array.isArray(checkedRows)) {
      checkedRows.forEach(item => {
        const node = this.dataMap.get(item[this.options.idKey]);
        if (node != null) {
          this.checkedRows?.set(node[this.options.idKey], node);
        }
      });
    }
  }
  /**
   * 根据id获取表格行
   * @param {*} id
   */
  getTableRow(id: string) {
    return this.dataMap.get(id);
  }
}

export function formatDate(
  date: string | number | Date | dayjs.Dayjs | null | undefined,
  formatString: string | undefined,
) {
  return dayjs(date).format(formatString);
}

export function parseDate(date: string | number | Date, formatString: string | undefined) {
  return dayjs(date, formatString);
}

export function fileToBase64(file: File) {
  return new Promise<string | undefined>((resolve, reject) => {
    if (file == null) return reject();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      resolve(e.target?.result as string);
    };
    reader.onerror = e => {
      reject(e);
    };
  });
}

export function getObjectValue(data: ANY_OBJECT, fieldName: string, firstColumnField?: string) {
  if (data == null) return '';
  if (data.isAggregate && data.groupField != null) {
    if (firstColumnField !== fieldName) return '';
    const childrenList = data._X_ROW_CHILD_LIST as ANY_OBJECT[];
    if (Array.isArray(childrenList) && childrenList.length > 0) {
      const subData = childrenList[0];
      let temp = '';
      if (subData[data.groupField + 'DictMap'] != null) {
        temp = subData[data.groupField + 'DictMap'].name;
      } else if (subData[data.groupField + 'DictMapList'] != null) {
        temp = subData[data.groupField + 'DictMapList'].map(item => item.name).join(',');
      } else {
        temp = subData[data.groupField];
      }
      return `${temp}【${childrenList.length}】`;
    }
  }
  if (fieldName == null || fieldName === '') return data;
  const fieldPath = fieldName.split('.');
  let tempValue = data;
  if (Array.isArray(fieldPath)) {
    fieldPath.forEach(key => {
      if (tempValue != null) {
        tempValue = tempValue[key];
      }
    });
  }

  return tempValue;
}

// 判断输入值是否一个Object
export function isObject(obj: ANY_OBJECT) {
  return obj != null && typeof obj === 'object' && obj.toString() === '[object Object]';
}

function copyObject(obj: ANY_OBJECT): ANY_OBJECT {
  if (obj == null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function deepMerge(obj1: ANY_OBJECT, obj2: ANY_OBJECT) {
  const tempObj = copyObject(obj1);
  if (obj2 != null) {
    Object.keys(obj2).forEach(key => {
      const val2 = obj2[key];
      const val1 = tempObj[key];
      if (isObject(val2)) {
        // 如果两个值都是对象，则递归合并
        if (isObject(val1)) {
          tempObj[key] = deepMerge(val1, val2);
        } else {
          tempObj[key] = copyObject(val2);
        }
      } else if (Array.isArray(val2)) {
        // 如果两个值都是数组，则合并数组
        if (Array.isArray(val1)) {
          tempObj[key] = val2.map((arrVal2, index) => {
            const arrVal1 = val1[index];
            if (isObject(arrVal1)) {
              return deepMerge(arrVal1, arrVal2);
            } else {
              return arrVal2;
            }
          });
        } else {
          tempObj[key] = copyObject(val2);
        }
      } else {
        // 直接覆盖
        tempObj[key] = val2;
      }
    });
  }
  return tempObj;
}

export function getFileType(fileName) {
  if (fileName == null || fileName === '') return EnumFileType.OTHER;
  const index = fileName.lastIndexOf('.');
  if (index === -1) return EnumFileType.OTHER;
  const temp = fileName.slice(index + 1);
  switch (temp) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return EnumFileType.IMAGE;
    case 'pdf':
      return EnumFileType.PDF;
    case 'doc':
    case 'docx':
      return EnumFileType.WORD;
    case 'xls':
    case 'xlsx':
      return EnumFileType.EXCEL;
    case 'mp4':
    case 'ogg':
    case 'webm':
      return EnumFileType.VIDEO;
    default:
      return EnumFileType.OTHER;
  }
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

export function downloadFile(fieldName: string, filename: string) {
  const token = getToken();
  const url = `${API_CONTEXT}/manage/file/download?fieldName=${encodeURIComponent(
    fieldName,
  )}&filename=${encodeURIComponent(filename)}&asImage=false&Authorization=${encodeURIComponent(
    token || '',
  )}`;
  window.open(url, '_blank');
}

export function downloadOnlineFormFile(datasource: string, fieldName: string, filename: string, originalName: string, datasourceId: string) {
  const url = `${API_CONTEXT}/online/onlineOperation/downloadDatasource1/${datasource}?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(filename)}&datasourceId=${datasourceId}&asImage=false`;
  BaseController.download(url, {}, originalName || filename, 'get')
}

export function getApproverList(deptId: string) {
  const loginStore = useLoginStore();
  const userInfo = (loginStore.userInfo as any) || {};
  // 获取当前节点 (不同节点 要调的接口 和 用于查询的roleId 不同)
  const routeName = router.currentRoute.value.name as string;
  if (['pickSchemeFileApproval', 'pickDecisionKeepApply'].includes(routeName)) {
    let roleId = ''
    if(userInfo.area == 1){
      roleId = '2032682458356387840'  // 省
    }
    if(userInfo.area == 2){
      roleId = '2032682496843321344'  // 市
    }
    if(userInfo.area == 3){
      roleId = '2032682535397363712'  // 区
    }
    // 甄选文件采购部门审批 单独调 listUserByRoleAndDeptFlag 接口
    return SysUserController.listUserByRoleAndDeptFlag({
      deptFlag: 'current',
      roleId: roleId,
      deptId: deptId
    })
      .then(res => {
        return res.data || [];
      })
      .catch(e => {
        // ElMessage.error('加载审批人列表失败');
        console.error(e);
        return [];
      });
  } else {
    // 其他节点调统一查询接口
    // 当前用户
    const loginStore = useLoginStore();
    const userInfo = (loginStore.userInfo as any) || {};

    // 当前用户角色ID列表
    const currRoleIds = userInfo.roleIdList;
    // 角色ID映射
    const roleIdMap = {
      // 需求发起
      pickDemandAdd: {
        '2032681689108451328': '2032682535397363712', // 区县
        '2032681633655558144': '2032682496843321344', // 地市
        '2032681580387897344': '2032682458356387840', // 省公司
      },
      // 需求发起New
      pickDemandNewAdd: {
        '2032681689108451328': '2032682535397363712', // 区县
        '2032681633655558144': '2032682496843321344', // 地市
        '2032681580387897344': '2032682458356387840', // 省公司
      },
      // 需求三级经理审批
      pickDemandFlowApply: {
        '2032682535397363712': '2032682417046687744',
        '2032682496843321344': '2032682417046687744',
        '2032682458356387840': '2032682362805948416',
      },
      // 甄选方案编制
      pickSchemeAdd: {
        '2032682417046687744': '2032682496843321344',
        '2032682362805948416': '2032682458356387840',
      },
      // 甄选文件管理员审批
      pickSchemeFileUpload: {
        '2032682417046687744': '2038877155080802304',
        '2032682362805948416': '2038876836762488832',
      },
      // 需求编制
      pickDemandEdit: {
        '2032681689108451328': '2032682535397363712',
        '2032681633655558144': '2032682496843321344',
        '2032681580387897344': '2032682458356387840',
      },
      // 甄选归档发起
      pickArchiveLaunch: {
        '2032681689108451328': '2039528517258973184',
        '2032681633655558144': '2039528606555705344',
        '2032681580387897344': '2039528664487432192',
      },
      // 专家库新增提交
      expertDatabaseAdd: {
        '2039529159461441536': '2039529199709982720',
      },
      // 专家库退库提交
      sendBack: {
        '2039529159461441536': '2039529199709982720',
      },
      // 专家导入提交
      expertDatabaseList: {
        '2039529159461441536': '2039529199709982720',
      },
      // 代理商考核评分任务
      taskDeal: {
        default: '2039634948129820672',
      },
      // 代理商考核评分任务
      taskLevel3Approver: {
        default: '2036281370577211393',
      },
        // 公司业务运营管理人员
      taskOtherApproverFlow: {
        default: '2039635169333219328',
      },


         // 甄选方案--资料补传
      pickSchemeDocComplete: {
        '2032681689108451328': '2032682417046687744', // 区县
        '2032681633655558144': '2032682417046687744', // 地市
        '2032681580387897344': '2032682362805948416', // 省公司
      },
         // 甄选方案--资料补传
      solutionApprove: {
        '2032681689108451328': '2032682417046687744', // 区县
        '2032681633655558144': '2032682417046687744', // 地市
        '2032681580387897344': '2032682362805948416', // 省公司
      },
          // 甄选需求--资料补传
      pickDocCompleteAdd: {
        '2032681689108451328': '2032682417046687744', // 区县
        '2032681633655558144': '2032682417046687744', // 地市
        '2032681580387897344': '2032682362805948416', // 省公司
      },
          // 甄选结果决策信息--资料补传
      dataCompletion: {
        '2032681689108451328': '2032682417046687744', // 区县
        '2032681633655558144': '2032682417046687744', // 地市
        '2032681580387897344': '2032682362805948416', // 省公司
      },
      decisionApprove: {
        '2032681689108451328': '2032682417046687744', // 区县
        '2032681633655558144': '2032682417046687744', // 地市
        '2032681580387897344': '2032682362805948416', // 省公司
      },
    };
    // 先用节点路由匹配 角色id映射关系
    const targetMap = roleIdMap?.[routeName];
    // 循环用户的roleIdList 找到第一个匹配上的roleId 并拿到它对应的值
    const roleId = targetMap
      ? targetMap[currRoleIds.find(key => key in targetMap)] || targetMap['default']
      : undefined;
    if (!roleId) {
      console.log('当前用户');
      console.log(userInfo);
      console.log('当前节点的角色ID映射');
      console.log(targetMap);
      console.error('未匹配到 当前账号角色 对应的 下一步审核人的roleId');
      return Promise.resolve([]);
    }
    // 查询下一步审批人
    let obj = {
      roleId: roleId,
    } as any
    let url = SysUserController.getSysUserListByRoleId as any
    if(routeName === 'pickDemandNewAdd' || routeName === 'pickSchemeAdd' || routeName === 'pickDemandAdd' || routeName === 'pickDemandEdit'){
      url = SysUserController.listUserByRoleAndDeptFlag
      obj.deptFlag = 'current'
    }
    return url( obj )
      .then(res => {
        return res.data || [];
      })
      .catch(e => {
        // ElMessage.error('加载审批人列表失败');
        console.error(e);
        return [];
      });
  }
}


export function savePortalParams() {
  const searchParams = new URLSearchParams(window.location.search)
  console.log(searchParams, 'window.location.search--', window.location.search)
  const hash = window.location.hash
  console.log('hash--', hash)

  const hashQueryString = hash.includes('?') ? hash.split('?')[1] : ''
  const hashParams = new URLSearchParams(hashQueryString)

  const flushPortalUrl = searchParams.get('flushPortalUrl') || hashParams.get('flushPortalUrl')
  const uniqueId = searchParams.get('uniqueId') || hashParams.get('uniqueId')
  const itemId = searchParams.get('itemId') || hashParams.get('itemId')

  console.log('url.flushPortalUrl', flushPortalUrl,'uniqueId', uniqueId,'itemId',itemId)
  if (flushPortalUrl)
    localStorage.setItem('flushPortalUrl', flushPortalUrl)
  if (uniqueId)
    localStorage.setItem('uniqueId', uniqueId)
  if (itemId)
    localStorage.setItem('itemId', itemId)
}

export function appBack() {
  
  console.log('appBack----', import.meta.env.VITE_API_PREFIX)
  if (import.meta.env.VITE_API_PREFIX) {
    showLoadingToast({
      message: '返回中...',
      forbidClick: true,
      duration: 0,
    })
    setTimeout(() => {
      closeToast()
      moaBridge.closeDoc({
        reload: true,
      })
      console.log('2秒----')
    }, 2000)
  } else {
    window.history.back()
  }
}
export function downloadAppFile(name: string,fieldName: string, fileName: string) {
  
  console.log('appBack----', import.meta.env.VITE_API_PREFIX)
  const token = getToken()
  if (import.meta.env.VITE_API_PREFIX) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0,
    })
    const url =`https://zj.moazq.chinamobile.com/YnMoa/ynzqgztmoa/gov/admin/manage/file/download?fieldName=${encodeURIComponent(fieldName)}&filename=${encodeURIComponent(fileName)}&asImage=false&Authorization=${encodeURIComponent(token || '')}`
    setTimeout(() => {
      console.log(url,'----downloadFile');
      closeToast()
      moaBridge.download({
        fileName: name,
        url: url,
        enableUploadToKnowledgeBase: false,
      })
    }, 2000)
  }else{
    console.log('非app环境----')
    downloadFile(fieldName,fileName)
  }
}
