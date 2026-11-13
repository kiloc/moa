import { DictData } from '@/common/staticDict/types';

interface FlowProjectVariableRecord {
  // 项目流程变量记录标识
  projectNodeVariableRecordId?: number | undefined;
  // 项目标识
  projectId?: string | undefined;
  // 流程实例标识
  procInstId?: string | undefined;
  // 业务数据
  businessData?: string | undefined;
  // 备注信息
  remark?: string | undefined;
  // 创建人
  createUserId?: number | undefined;
  // 创建时间
  createTime?: string | undefined;
  // 更新人
  updateUserId?: number | undefined;
  // 更新时间
  updateTime?: string | undefined;
}

export default FlowProjectVariableRecord;
