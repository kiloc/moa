<template>
  <div class="list-user-select">
    <van-field
      v-model="selectedName"
      is-link
      readonly
      label="下一步审批人"
      placeholder="请选择下一步审批人"
      required
      @click="showPicker = true"
    />
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        :columns="pickerColumns"
        @confirm="onPickerConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
    <div class="footer-section">
      <van-button block type="primary" @click="onConfirm">确定</van-button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListUser',
};
</script>

<script setup lang="ts">
import { showToast } from 'vant';
import { SysUserController } from '@/api/generated';
import { ANY_OBJECT } from '@/types/generic';

const props = withDefaults(
  defineProps<{
    dialog?: ANY_OBJECT;
    url?: ANY_OBJECT;
    params?: ANY_OBJECT;
  }>(),
  {
    dialog: undefined,
    url: '',
    params: '',
  },
);

const appointedAssignee = ref('');
const selectedName = ref('');
const userList = ref<ANY_OBJECT[]>([]);
const showPicker = ref(false);

const pickerColumns = computed(() =>
  userList.value.map(item => ({
    text: item.showName,
    value: item.loginName,
  })),
);

const onPickerConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0];
  if (selected) {
    appointedAssignee.value = selected.value;
    selectedName.value = selected.text;
  }
  showPicker.value = false;
};

const onConfirm = () => {
  if (!appointedAssignee.value) {
    showToast('请选择下一步审批人');
    return;
  }
  props.dialog?.submit(appointedAssignee.value);
};

const getUserList = () => {
  const url = props.url || SysUserController.listUserByRoleAndDeptFlag;
  url(props.params)
    .then((res: ANY_OBJECT) => {
      if (res.data) {
        userList.value = Array.isArray(res.data) ? res.data : res.data.dataList;
      }
    })
    .catch(() => {});
};

onMounted(() => {
  appointedAssignee.value = '';
  selectedName.value = '';
  userList.value = [];
  getUserList();
});
</script>

<style scoped>
.list-user-select {
  padding: 16px;
}

.footer-section {
  margin-top: 24px;
}
</style>
