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
      <template v-if="column.key === 'orderId详情'">
        <a @click="() => showInfo(record.orderId)">{{ record.orderId }}</a>
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:visible="visible"
    width="1000px"
    title="Basic Modal"
    @ok="handleOk"
  >
    <a-table :columns="orderColumns" :data-source="orderData" bordered>
    </a-table>
  </a-modal>
  <a-modal
    v-model:visible="payVisible"
    width="400px"
    title="Basic Modal"
    @ok="handlePayOk"
  >
    <img
      src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/070523776d574d5f9493b662fe7c7221~tplv-k3u1fbpfcp-watermark.image?"
      alt=""
      :style="{ width: '300px', margin: '0 26px' }"
    />
  </a-modal>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, watchEffect } from "vue";
import { get } from "../utils/request";

const useShowModalEffect = () => {
  const visible = ref(false);
  const payVisible = ref(false);

  const showModal = () => {
    visible.value = true;
  };

  const showPayModal = () => {
    payVisible.value = true;
  };

  const handlePayOk = () => {
    payVisible.value = false;
  };

  const handleOk = (e) => {
    console.log(e);
    visible.value = false;
    showPayModal();
  };

  return {
    visible,
    showModal,
    handleOk,
    handlePayOk,
    payVisible,
  };
};

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    const { visible, showModal, handleOk, handlePayOk, payVisible } =
      useShowModalEffect();

    // 商品列表
    const data = ref([]);

    // 订单详情列表
    const orderData = ref([]);

    const pagination = reactive({
      defaultPageSize: 10,
      total: 0,
      onChange: async (page, pageSize) => {
        await getContentData(page, pageSize);
      },
    });

    const getContentData = async (pageNum = 1, pageSize = 10) => {
      const result = await get(
        "/mall/order",
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
        console.log(result.data.list);
      } else {
        message.error("商品加载失败");
      }
    };

    watchEffect(() => {
      getContentData();
    });

    const columns = [
      {
        title: "orderId",
        dataIndex: "orderId",
        key: "orderId",
      },
      {
        title: "orderSn",
        dataIndex: "orderSn",
        key: "orderSn",
      },
      {
        title: "shippingUser",
        dataIndex: "shippingUser",
        key: "shippingUser",
      },
      {
        title: "shippingAddress",
        dataIndex: "shippingAddress",
        key: "shippingAddress",
      },
      {
        title: "shippingPhone",
        dataIndex: "shippingPhone",
        key: "shippingPhone",
      },
      {
        title: "orderMoney",
        dataIndex: "orderMoney",
        key: "orderMoney",
      },
      {
        title: "createTime",
        dataIndex: "createTime",
        key: "createTime",
      },
      {
        title: "orderId详情",
        dataIndex: "orderId",
        key: "orderId详情",
      },
    ];

    const orderColumns = [
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
        title: "productAmount",
        dataIndex: "productAmount",
        key: "productAmount",
      },
      {
        title: "addTime",
        dataIndex: "addTime",
        key: "addTime",
      },
      {
        title: "orderCartId",
        dataIndex: "orderCartId",
        key: "orderCartId",
      },
    ];

    const showInfo = async (orderId) => {
      const result = await get(
        `mall/orderCart/${orderId}`,
        { orderId },
        {
          Authorization: localStorage.getItem("token"),
        }
      );
      if (result.code === 200) {
        message.success("信息查询成功");
        console.log(result);
        orderData.value = result.data;
        showModal();
      } else {
        message.error("信息查询失败");
      }
    };

    return {
      data,
      columns,
      pagination,
      showInfo,
      visible,
      handleOk,
      orderColumns,
      orderData,
      handlePayOk,
      payVisible,
    };
  },
});
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>