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
      <template v-if="column.key === 'showDetail'">
        <a @click="() => showInfo(record.orderId)">查看</a>
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:visible="visible"
    width="1000px"
    title="订单详情"
    @ok="handleOk"
    okText="去付款"
    cancelText="取消"
  >
    <a-table :columns="orderColumns" :data-source="orderData" bordered>
    </a-table>
  </a-modal>
  <a-modal
    v-model:visible="payVisible"
    width="400px"
    title="付款"
    @ok="handlePayOk"
    okText="完成付款"
    cancelText="等会再付"
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

// 显示弹窗信息功能
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

  const handleOk = () => {
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

// 表格构建功能
const useConstrctTableEffect = () => {
  const columns = [
    {
      title: "订单号",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "订单Sn",
      dataIndex: "orderSn",
      key: "orderSn",
    },
    {
      title: "收货人",
      dataIndex: "shippingUser",
      key: "shippingUser",
    },
    {
      title: "收货手机号",
      dataIndex: "shippingPhone",
      key: "shippingPhone",
    },
    {
      title: "收货地址",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
    },

    {
      title: "订单总价",
      dataIndex: "orderMoney",
      key: "orderMoney",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "查看详情",
      dataIndex: "orderId",
      key: "showDetail",
    },
  ];
  const orderColumns = [
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
      title: "购买数量",
      dataIndex: "productAmount",
      key: "productAmount",
    },
    {
      title: "添加时间",
      dataIndex: "addTime",
      key: "addTime",
    },
    {
      title: "购买编号",
      dataIndex: "orderCartId",
      key: "orderCartId",
    },
  ];
  return { columns, orderColumns };
};

// 获取表格信息功能
const useGetTableInfoEffect = () => {
  // 商品列表
  const data = ref([]);
  // 分页信息
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
    if (result.code === 200) {
      message.success("商品加载成功");
      data.value = result.data.list;
      pagination.total = result.data.lastPage * 10;
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("商品加载失败");
    }
  };

  return { getContentData, data, pagination };
};

// 订单详情信息功能
const useOrderDetailEffect = (showModal) => {
  // 订单详情列表
  const orderData = ref([]);
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
      orderData.value = result.data;
      showModal();
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("信息查询失败");
    }
  };
  return { orderData, showInfo };
};

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    const { visible, showModal, handleOk, handlePayOk, payVisible } =
      useShowModalEffect();
    const { columns, orderColumns } = useConstrctTableEffect();
    const { getContentData, data, pagination } = useGetTableInfoEffect();
    const { orderData, showInfo } = useOrderDetailEffect(showModal);
    watchEffect(() => {
      getContentData();
    });

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