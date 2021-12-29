<template>
  <a-table :data-source="data" :columns="columns" :pagination="pagination">
    <template
      #customFilterDropdown="{
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        column,
      }"
    >
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="
            (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
          "
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          <template #icon><SearchOutlined /></template>
          Search
        </a-button>
        <a-button
          size="small"
          style="width: 90px"
          @click="handleReset(clearFilters)"
        >
          Reset
        </a-button>
      </div>
    </template>
    <template #customFilterIcon="{ filtered }">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'changeAmount'">
        <a
          @click="
            () =>
              handleChangeAmount(record.orderCartId, record.productAmount, 1)
          "
          :style="{ 'margin-right': '16px' }"
          >增加</a
        >
        <a
          @click="
            () =>
              handleChangeAmount(record.orderCartId, record.productAmount, -1)
          "
          >减少</a
        >
      </template>
      <template v-if="column.key === 'orderCartId'">
        <a @click="() => deleteCartItem(record.orderCartId)">移除</a>
      </template>
    </template>
  </a-table>
  <div class="container">
    <a-form
      class="input"
      :model="formState"
      v-bind="layout"
      name="nest-messages"
      :validate-messages="validateMessages"
      @finish="onFinish"
    >
      <a-form-item
        :name="['shipping', 'shippingUser']"
        label="收货人"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.shipping.shippingUser" />
      </a-form-item>
      <a-form-item
        :name="['shipping', 'shippingPhone']"
        label="收货手机号"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.shipping.shippingPhone" />
      </a-form-item>
      <a-form-item
        :name="['shipping', 'shippingAddress']"
        label="收货地址"
        :rules="[{ required: true }]"
      >
        <a-textarea v-model:value="formState.shipping.shippingAddress" />
      </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button type="primary" html-type="submit">提交订单</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, watchEffect } from "vue";
import { get, post, put, deleteMethod } from "../utils/request";

// 提交订单功能
const useSubmitEffect = (getContentData) => {
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
  const validateMessages = {
    required: "请输入${label}信息！",
  };
  const formState = reactive({
    shipping: {
      shippingUser: "",
      shippingAddress: "",
      shippingPhone: "",
    },
  });

  const onFinish = async () => {
    const result = await post("/mall/order", formState.shipping, {
      Authorization: localStorage.getItem("token"),
    });
    if (result.code === 200) {
      message.success("提交成功");
      getContentData(1, 10);
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("提交失败");
    }
  };

  return {
    formState,
    onFinish,
    layout,
    validateMessages,
  };
};

// 获取表格信息功能
const useGetTableInfoEffect = () => {
  // 商品列表
  const data = ref([]);
  // 当前页面号
  const curPage = ref(1);
  // 分页信息
  const pagination = reactive({
    defaultPageSize: 10,
    total: 0,
    onChange: async (page, pageSize) => {
      curPage.value = page;
      await getContentData(page, pageSize);
    },
  });
  const getContentData = async (pageNum = 1, pageSize = 10) => {
    const result = await get(
      "/mall/orderCart",
      {
        pageNum,
        pageSize,
      },
      {
        Authorization: localStorage.getItem("token"),
      }
    );
    if (result.code === 200) {
      data.value = result.data.list;
      pagination.total = result.data.lastPage * 10;
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("商品加载失败");
    }
  };
  return { getContentData, data, pagination, curPage };
};

// 表格构建功能
const useConstrctTableEffect = () => {
  const columns = [
    {
      title: "商品名称",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "单价",
      dataIndex: "productPrice",
      key: "productPrice",
    },
    {
      title: "添加时间",
      dataIndex: "addTime",
      key: "addTime",
    },
    {
      title: "购买数量",
      dataIndex: "productAmount",
      key: "productAmount",
    },
    {
      title: "修改数量",
      dataIndex: "orderCartId",
      key: "changeAmount",
    },
    {
      title: "移除商品",
      dataIndex: "orderCartId",
      key: "orderCartId",
    },
  ];
  return { columns };
};

// 修改购物车商品功能
const useChangeCartProductEffect = (curPage, getContentData) => {
  const handleChangeAmount = async (orderCartId, productAmount, operate) => {
    if (productAmount + operate <= 0) {
      message.warning("不能再少了");
      return;
    }
    const result = await put(
      `/mall/orderCart`,
      {
        orderCartId,
        productAmount: productAmount + operate,
      },
      {
        Authorization: localStorage.getItem("token"),
      }
    );
    if (result.code === 200) {
      message.success("更新成功");
      getContentData(curPage.value, 10);
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("更新失败");
    }
  };

  const deleteCartItem = async (orderCartId) => {
    const result = await deleteMethod(
      `mall/orderCart/${orderCartId}`,
      {
        Authorization: localStorage.getItem("token"),
      },
      {
        orderCartId,
      }
    );
    if (result.code === 200) {
      message.success("移除成功");
      getContentData(curPage.value, 10);
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("移除失败");
    }
  };
  return {
    handleChangeAmount,
    deleteCartItem,
  };
};

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    const { columns } = useConstrctTableEffect();
    const { getContentData, data, pagination, curPage } =
      useGetTableInfoEffect();
    const { handleChangeAmount, deleteCartItem } = useChangeCartProductEffect(
      curPage,
      getContentData
    );
    const { formState, onFinish, layout, validateMessages } =
      useSubmitEffect(getContentData);

    watchEffect(() => {
      getContentData();
    });

    return {
      data,
      columns,
      pagination,
      deleteCartItem,
      handleChangeAmount,
      formState,
      onFinish,
      layout,
      validateMessages,
    };
  },
});
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}

.container {
  display: flex;
  justify-content: center;
  align-content: center;
}

.input {
  width: 600px;
}
</style>