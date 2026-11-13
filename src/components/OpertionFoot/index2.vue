<template>
    <div class="opertion-foot">
        <el-card>
            <mo-close-button @click="handleCloseBtnClick('close')">关闭</mo-close-button>

            <template v-if="!isDone">
                <mo-button type="primary">同意</mo-button>
                <mo-button type="danger" plain >
                    不同意
                </mo-button>
            </template>

        </el-card>
    </div>
</template>
<style scoped lang="scss">
.opertion-foot {
    width: auto !important;
    text-align: center;
    background: rgba(243, 245, 247, 1);
    position: fixed;
    bottom: 0;
    right: 24px;
    left: 264px;
    z-index: 9;
    box-shadow: 0px -3px 10px 0px rgba(0, 0, 0, 0.1);

    .el-card {
        margin-bottom: 0;
    }

    .el-card__body {
        padding: 16px;
    }
}

&.from_syoa {
    .opertion-foot {
        left: 24px;
    }
}
</style>