<template>
  <div class="search">
    <span class="item">
      <span> 商品信息：</span>
      <a-input class="input" v-model:value="inputs.pDesc" />
    </span>
    <span class="item">
      <span> 供应商信息：</span>
      <a-input class="input" v-model:value="inputs.sDesc" />
    </span>
    <span class="item">
      <span>标签信息：</span>
      <a-input class="input" v-model:value="inputs.tDesc" />
    </span>
    <span class="item">
      <span> 最小价格：</span>
      <a-input class="input" v-model:value="inputs.min" />
    </span>
    <span class="item">
      <span> 最大价格：</span>
      <a-input class="input" v-model:value="inputs.max" />
    </span>
    <a-button class="button" type="primary" @click="handleSubmit"
      >查询</a-button
    >
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
        <a @click="() => addTOCart(record.pid)">添加</a>
      </template>
    </template>
  </a-table>
</template>
<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, toRefs, watchEffect } from "vue";
import { post } from "../utils/request";

// 搜索功能
const useSearchEffect = (getContentData) => {
  const inputValue = reactive({
    inputs: {
      pDesc: null,
      sDesc: null,
      tDesc: null,
      min: null,
      max: null,
    },
  });
  const handleSubmit = async () => {
    await getContentData(1, 10, inputValue.inputs);
  };

  const { inputs } = toRefs(inputValue);
  return {
    inputs,
    handleSubmit,
  };
};

// 表格构建功能
const useConstrctTableEffect = () => {
  const columns = [
    {
      title: "商品描述",
      dataIndex: "pDescription",
      key: "pDescription",
    },
    {
      title: "商品名称",
      dataIndex: "pName",
      key: "pName",
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "库存数",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "标签名称",
      dataIndex: "tName",
      key: "tName",
    },
    {
      title: "供应商名称",
      dataIndex: "sName",
      key: "sName",
    },
    {
      title: "供应商电话",
      dataIndex: "sPhone",
      key: "sPhone",
    },
    {
      title: "供应商邮箱",
      dataIndex: "sEmail",
      key: "sEmail",
    },
    {
      title: "供应商信息",
      dataIndex: "sDescription",
      key: "sDescription",
    },
    {
      title: "添加到购物车",
      dataIndex: "pid",
      key: "pid",
    },
  ];

  return {
    columns,
  };
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

// 添加到购物车功能
const useAddToCartEffect = () => {
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
    } else if (result.code === 701) {
      message.error("token 过期，请重新登录");
    } else {
      message.error("商品加载失败");
    }
  };
  return {
    addTOCart,
  };
};

export default defineComponent({
  components: {
    SearchOutlined,
  },

  setup() {
    const { columns } = useConstrctTableEffect();
    const { getContentData, data, pagination } = useGetTableInfoEffect();
    const { inputs, handleSubmit } = useSearchEffect(getContentData);
    const { addTOCart } = useAddToCartEffect();

    watchEffect(() => {
      getContentData();
    });

    return {
      data,
      columns,
      pagination,
      addTOCart,
      inputs,
      handleSubmit,
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

.button {
  margin-left: 20px;
}
</style>