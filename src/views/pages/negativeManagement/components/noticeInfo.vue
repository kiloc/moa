<template>
  <div class="announcement-content-form">
    <van-cell-group class="card-section" inset>
      <div class="card-section__title">公告信息内容</div>

      <!-- 公告标题 -->
      <template v-if="currentType !== 'auth' && currentType !== 'info'">
        <div class="title-row">
          <span class="title-prefix">关于</span>
          <van-field
            v-model="formData.subject"
            placeholder="请输入公告主题"
            class="title-field"
            maxlength="200"
            required
            :rules="[{ required: true, message: '请输入公告主题' }]"
          />
          <span class="title-suffix">负面行为处理结果的公告</span>
        </div>

        <!-- 公告正文开头 -->
        <div class="content-intro">
          <span class="intro-prefix">鉴于</span>
          <van-field
            v-model="formData.party"
            placeholder="请输入主体名称"
            class="intro-field"
            required
            :rules="[{ required: true, message: '请输入主体名称' }]"
          />
          <span class="intro-text">在</span>
          <van-field
            v-model="formData.event"
            placeholder="请输入事件场景"
            class="intro-field"
            required
            :rules="[{ required: true, message: '请输入事件场景' }]"
          />
          <span class="intro-text">时存在违反</span>
          <van-field
            v-model="formData.violation"
            placeholder="请输入违规内容"
            class="intro-field"
            required
            :rules="[{ required: true, message: '请输入违规内容' }]"
          />
          <span class="intro-text">的情况,</span>
        </div>
        <div class="content-intro">
          <span class="intro-prefix">根据</span>
          <van-field
            v-model="formData.regulation"
            placeholder="请输入依据文件"
            class="intro-field intro-field--full"
            required
            :rules="[{ required: true, message: '请输入依据文件' }]"
          />
          <span class="intro-text">的相关规定做出如下处理:</span>
        </div>
        <!-- 处理内容 -->
        <van-field
          v-model="formData.processingContent"
          label="处理结果"
          type="textarea"
          rows="8"
          maxlength="2000"
          show-word-limit
          placeholder="请详细说明处理结果..."
          required
          :rules="[{ required: true, message: '请详细说明处理结果' }]"
        />
      </template>

      <!-- 不可编辑 -->
      <template v-else>
        <div class="readonly-title">关于{{ formData.subject }}负面行为处理结果的公告</div>
        <div class="readonly-content">
          <p>鉴于{{ formData.party }}在{{ formData.event }}时存在违反{{ formData.violation }}的情况, 根据{{ formData.regulation }}的相关规定做出如下处理:</p>
          <div class="processing-content">{{ formData.processingContent }}</div>
        </div>
      </template>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useLoginStore, useDictMapStore } from '@/store';

const loginStore = useLoginStore();
const dictMapStore = useDictMapStore();
const currentType = ref('add');

// 表单数据
const formData = reactive({
  subject: '',
  party: '',
  event: '',
  violation: '',
  regulation: '',
  processingContent: '',
});

// 计算公告正文总字数的函数
const validateContentLength = () => {
  const fixedText = '鉴于在时存在违反的情况,根据的相关规定做出如下处理:';
  const totalLength =
    fixedText.length +
    (formData.party || '').length +
    (formData.event || '').length +
    (formData.violation || '').length +
    (formData.regulation || '').length +
    (formData.processingContent || '').length;
  return totalLength <= 2000;
};

const showData = (data: any, type: string) => {
  try {
    currentType.value = type;

    if (data.announcementTitle) {
      const titleMatch = data.announcementTitle.match(/关于(.*?)负面行为处理结果的公告/);
      if (titleMatch && titleMatch[1]) {
        formData.subject = titleMatch[1];
      } else {
        formData.subject = '';
      }
    }

    if (data.announcementContent) {
      const partyMatch = data.announcementContent.match(/鉴于(.*?)在/);
      if (partyMatch && partyMatch[1]) {
        formData.party = partyMatch[1];
      } else {
        formData.party = '';
      }

      const eventMatch = data.announcementContent.match(/在(.*?)时存在违反/);
      if (eventMatch && eventMatch[1]) {
        formData.event = eventMatch[1];
      } else {
        formData.event = '';
      }

      const violationMatch = data.announcementContent.match(/时存在违反(.*?)的情况/);
      if (violationMatch && violationMatch[1]) {
        formData.violation = violationMatch[1];
      } else {
        formData.violation = '';
      }

      const regulationMatch = data.announcementContent.match(/根据(.*?)的相关规定做出如下处理/);
      if (regulationMatch && regulationMatch[1]) {
        formData.regulation = regulationMatch[1];
      } else {
        formData.regulation = '';
      }

      const processingContentSplit = data.announcementContent.split('的相关规定做出如下处理:');
      if (processingContentSplit && processingContentSplit[1]) {
        formData.processingContent = processingContentSplit[1];
      } else {
        formData.processingContent = '';
      }
    }
  } catch (error) {
    console.error('Error in noticeInfo showData:', error);
  }
};

// 表单提交
const handleSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!formData.subject) {
      reject();
      return;
    }
    if (!formData.party || !formData.event || !formData.violation || !formData.regulation || !formData.processingContent) {
      reject();
      return;
    }
    if (!validateContentLength()) {
      reject();
      return;
    }

    const params = {
      announcementTitle: `关于${formData.subject}负面行为处理结果的公告`,
      announcementContent: `鉴于${formData.party}在${formData.event}时存在违反${formData.violation}的情况,根据${formData.regulation}的相关规定做出如下处理:${formData.processingContent}`,
    };
    resolve(params);
  });
};

defineExpose({
  handleSubmit,
  showData,
});

onMounted(() => {});
</script>

<style lang="scss" scoped>
.announcement-content-form {
  padding-bottom: 12px;

  .card-section {
    margin: 12px;

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
      padding: 12px 16px 8px;
    }
  }

  // 标题行
  .title-row {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    font-size: 15px;
    font-weight: 600;

    .title-prefix,
    .title-suffix {
      color: #323233;
      white-space: nowrap;
    }

    .title-field {
      flex: 1;
      min-width: 0;
    }
  }

  // 正文开头
  .content-intro {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 16px;
    font-size: 14px;
    color: #323233;

    .intro-prefix {
      min-width: 30px;
      margin: 8px 0;
    }

    .intro-text {
      white-space: nowrap;
      margin: 8px 0;
    }

    .intro-field {
      flex: 1;
      min-width: 80px;
      max-width: 200px;

      &--full {
        max-width: none;
      }
    }
  }

  // 只读模式
  .readonly-title {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    padding: 12px 16px;
    text-align: center;
  }

  .readonly-content {
    padding: 8px 16px 12px;
    font-size: 14px;
    color: #323233;
    line-height: 1.6;

    p {
      margin: 0 0 8px;
    }
  }

  .processing-content {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 10px 12px;
    margin-top: 8px;
    line-height: 1.6;
    word-break: break-all;
  }
}
</style>
