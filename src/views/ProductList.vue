<template>
  <div class="search">
    <span class="item">
      <span> 商品信息：</span>
      <a-input
        class="input"
        v-model:value="inputs.pDesc"
        placeholder="Basic usage"
      />
    </span>
    <span class="item">
      <span> 供应商信息：</span>
      <a-input
        class="input"
        v-model:value="inputs.sDesc"
        placeholder="Basic usage"
      />
    </span>
    <span class="item">
      <span>标签信息：</span>
      <a-input
        class="input"
        v-model:value="inputs.tDesc"
        placeholder="Basic usage"
      />
    </span>
    <span class="item">
      <span> 最小价格：</span>
      <a-input
        class="input"
        v-model:value="inputs.min"
        placeholder="Basic usage"
      />
    </span>
    <span class="item">
      <span> 最大价格：</span>
      <a-input
        class="input"
        v-model:value="inputs.max"
        placeholder="Basic usage"
      />
    </span>
    <a-button type="primary" @click="handleSubmit">Primary Button</a-button>
  </div>
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
      <template v-if="column.key === 'pid'">
        <a @click="() => addTOCart(record.pid)">{{ record.pid }}</a>
      </template>
    </template>
  </a-table>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, toRefs, watchEffect } from "vue";
import { post } from "../utils/request";

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    // 商品列表
    const data = ref([]);

    const inputValue = reactive({
      inputs: {
        pDesc: null,
        sDesc: null,
        tDesc: null,
        min: null,
        max: null,
      },
    });
    const pagination = reactive({
      defaultPageSize: 10,
      total: 0,
      onChange: async (page, pageSize) => {
        await getContentData(page, pageSize);
      },
    });

    const getContentData = async (pageNum = 1, pageSize = 10, body = {}) => {
      const result = await post(
        "/mall/product",
        {
          ...body,
        },
        {
          Authorization: localStorage.getItem("token"),
        },
        {
          pageNum,
          pageSize,
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
    });

    const state = reactive({
      searchText: "",
      searchedColumn: "",
    });
    const searchInput = ref();
    const columns = [
      {
        title: "pDescription",
        dataIndex: "pDescription",
        key: "pDescription",
      },
      {
        title: "pName",
        dataIndex: "pName",
        key: "pName",
      },
      {
        title: "price",
        dataIndex: "price",
        key: "price",
      },
      {
        title: "stock",
        dataIndex: "stock",
        key: "stock",
      },
      {
        title: "tName",
        dataIndex: "tName",
        key: "tName",
      },
      {
        title: "sName",
        dataIndex: "sName",
        key: "sName",
      },
      {
        title: "sPhone",
        dataIndex: "sPhone",
        key: "sPhone",
      },
      {
        title: "sEmail",
        dataIndex: "sEmail",
        key: "sEmail",
      },
      {
        title: "sDescription",
        dataIndex: "sDescription",
        key: "sDescription",
      },
      {
        title: "pid",
        dataIndex: "pid",
        key: "pid",
      },
    ];

    const addTOCart = async (productId) => {
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
      if (result.code === 200) {
        message.success("添加购物车成功");
      } else {
        message.error("商品加载失败");
      }
    };

    const handleSubmit = async () => {
      await getContentData(1, 10, inputValue.inputs);
    };

    const { inputs } = toRefs(inputValue);

    const test = () => {
      console.log(1);
    };

    return {
      data,
      columns,
      searchInput,
      ...toRefs(state),
      pagination,
      addTOCart,
      inputs,
      handleSubmit,
      test,
    };
  },
});
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
.search {
  display: flex;
  margin: 20px 0;
  /* flex-wrap: wrap; */
  justify-content: space-between;
}
.search .item {
  flex: 1;
  display: flex;
}
.search .item span {
  /* width: 100%; */
  flex: 1;
  line-height: 32px;
  height: 32px;
}
.search .item .input {
  flex: 1;
}
</style>