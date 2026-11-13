<template>
  <div class="opertion-foot">
    <div class="opertion-content">
        <slot></slot>
      </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.opertion-foot {
/*  width: auto !important;
  text-align: center;
  background: rgba(243, 245, 247, 1);
  z-index: 9;
  box-shadow: 0px -3px 10px 0px rgba(0, 0, 0, 0.1);*/

  width: auto !important;
  text-align: center;
  background: white;
  z-index: 9;
  /* box-shadow: 0px -3px 10px 0px rgba(0, 0, 0, 0.1); */
  padding: 10px 0;
  .el-card {
    margin-bottom: 0;
  }

  .el-card__body {
    padding: 16px;
  }

  .opertion-content {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  :deep(.el-button) {
    display: inline-block;
    width: 180px;
    text-align: center;
    border: 1px solid #0084d0;
    background: #fff;
    border-radius: 3px;
    font-size: 14px;

    &:hover {
      background: #e6f4ff;
      border-color: #0084d0;
      color: #0084d0;
    }

    &.el-button--primary {
      background: #0084d0;
      border-color: #0084d0;
      color: #fff;

      &:hover {
        background: #3399cc;
        border-color: #3399cc;
      }
    }

    &.el-button--danger {
      background: #fff;
      border-color: #f56c6c;
      color: #f56c6c;

      &:hover {
        background: #fef0f0;
        border-color: #f56c6c;
        color: #f56c6c;
      }
    }

    &.el-button--warning {
      background: #fff;
      border-color: #e6a23c;
      color: #e6a23c;

      &:hover {
        background: #fdf6ec;
        border-color: #e6a23c;
        color: #e6a23c;
      }
    }
  }
}
</style>
