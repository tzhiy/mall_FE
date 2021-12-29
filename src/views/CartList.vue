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
              handlechangeAmount(record.orderCartId, record.productAmount, 1)
          "
          >{{ record.productAmount }}add</a
        >
        <a
          @click="
            () =>
              handlechangeAmount(record.orderCartId, record.productAmount, -1)
          "
          >{{ record.productAmount }}decrease</a
        >
      </template>
      <template v-if="column.key === 'orderCartId'">
        <a @click="() => deleteCartItem(record.orderCartId)">{{
          record.orderCartId
        }}</a>
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
        label="shippingUser"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.shipping.shippingUser" />
      </a-form-item>
      <a-form-item
        :name="['shipping', 'shippingPhone']"
        label="shippingPhone"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.shipping.shippingPhone" />
      </a-form-item>
      <a-form-item
        :name="['shipping', 'shippingAddress']"
        label="shippingAddress"
        :rules="[{ required: true }]"
      >
        <a-textarea v-model:value="formState.shipping.shippingAddress" />
      </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, toRefs, watchEffect } from "vue";
import { get, post, put, deleteMethod } from "../utils/request";

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
    required: "${label} is required!",
  };
  const formState = reactive({
    shipping: {
      shippingUser: "",
      shippingAddress: "",
      shippingPhone: "",
    },
  });

  const onFinish = async (values) => {
    console.log("Success:", values);
    const result = await post("/mall/order", formState.shipping, {
      Authorization: localStorage.getItem("token"),
    });
    console.log(result);
    if (result.code === 200) {
      message.success("提交成功");
      getContentData(1, 10);
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

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    // 商品列表
    const data = ref([]);
    const curPage = ref(1);
    const pagination = reactive({
      defaultPageSize: 10,
      total: 0,
      onChange: async (page, pageSize) => {
        curPage.value = page;
        await getContentData(page, pageSize);
      },
    });

    const getContentData = async (pageNum = 1, pageSize = 10) => {
      console.log(pageNum);
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
      console.log(result);
      if (result.code === 200) {
        message.success("商品加载成功");
        data.value = result.data.list;
        pagination.total = result.data.lastPage * 10;
      } else {
        message.error("商品加载失败");
      }
    };
    const { formState, onFinish, layout, validateMessages } =
      useSubmitEffect(getContentData);
    watchEffect(() => {
      getContentData();
      console.log(pagination);
    });

    const state = reactive({
      searchText: "",
      searchedColumn: "",
    });
    const searchInput = ref();
    const columns = [
      {
        title: "productName",
        dataIndex: "productName",
        key: "productName",
      },
      {
        title: "productPrice",
        dataIndex: "productPrice",
        key: "productPrice",
      },
      {
        title: "addTime",
        dataIndex: "addTime",
        key: "addTime",
      },
      {
        title: "productAmount",
        dataIndex: "productAmount",
        key: "productAmount",
      },
      {
        title: "changeAmount",
        dataIndex: "orderCartId",
        key: "changeAmount",
      },
      {
        title: "orderCartId",
        dataIndex: "orderCartId",
        key: "orderCartId",
      },
    ];

    const handlechangeAmount = async (orderCartId, productAmount, operate) => {
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
      console.log(result);
      if (result.code === 200) {
        message.success("更新成功");
        getContentData(curPage.value, 10);
        console.log(result);
      } else {
        message.error("更新失败");
      }
    };

    const deleteCartItem = async (orderCartId) => {
      console.log(orderCartId);
      const result = await deleteMethod(
        `mall/orderCart/${orderCartId}`,
        {
          Authorization: localStorage.getItem("token"),
        },
        {
          orderCartId,
        }
      );
      console.log(result);
      if (result.code === 200) {
        message.success("添加购物车成功");
        console.log(result);
        getContentData(curPage.value, 10);
      } else {
        message.error("商品加载失败");
      }
    };

    return {
      data,
      columns,
      searchInput,
      ...toRefs(state),
      pagination,
      deleteCartItem,
      handlechangeAmount,
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