<template>
  <a-table :data-source="data" :columns="columns" :pagination="pagination">
    <!-- <template #headerCell="{ column }"> </template> -->
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
      <template v-if="column.key === 'orderCartId'">
        <a @click="() => addTOCart(record.orderCartId)">{{
          record.orderCartId
        }}</a>
      </template>
    </template>
  </a-table>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, toRefs, watchEffect } from "vue";
import { get, post } from "../utils/request";

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    // 商品列表
    const data = ref([]);
    const pagination = reactive({
      defaultPageSize: 10,
      total: 0,
      onChange: async (page, pageSize) => {
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
        title: "productAmount",
        dataIndex: "productAmount",
        key: "productAmount",
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
        title: "orderCartId",
        dataIndex: "orderCartId",
        key: "orderCartId",
      },
    ];

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = (clearFilters) => {
      clearFilters();
      state.searchText = "";
    };

    const addTOCart = async (productId) => {
      console.log(productId);
      const result = await post(
        `mall/orderCart/${productId}`,
        {},
        {
          Authorization: localStorage.getItem("token"),
        },
        {
          productId,
        }
      );
      console.log(result);
      if (result.code === 200) {
        message.success("添加购物车成功");
        console.log(result);
      } else {
        message.error("商品加载失败");
      }
    };

    return {
      data,
      columns,
      handleSearch,
      handleReset,
      searchInput,
      ...toRefs(state),
      pagination,
      addTOCart,
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