<template>
  <a-layout>
    <a-layout-sider
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }"
    >
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1">
          <user-outlined />
          <span class="nav-text">登录 / 注册</span>
        </a-menu-item>
        <a-menu-item key="2">
          <video-camera-outlined />
          <span class="nav-text">个人信息</span>
        </a-menu-item>
        <a-menu-item key="3">
          <upload-outlined />
          <span class="nav-text">商品列表</span>
        </a-menu-item>
        <a-menu-item key="4">
          <bar-chart-outlined />
          <span class="nav-text">购物车</span>
        </a-menu-item>
        <a-menu-item key="5">
          <cloud-outlined />
          <span class="nav-text">我的订单</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout :style="{ marginLeft: '200px' }">
      <a-layout-header :style="{ background: '#fff', padding: 0 }" />
      <a-layout-content :style="{ margin: '24px 16px 0', overflow: 'initial' }">
        <div
          :style="{ padding: '24px', background: '#fff', textAlign: 'center' }"
        >
          <router-view></router-view>
        </div>
      </a-layout-content>
      <a-layout-footer :style="{ textAlign: 'center' }">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
  CloudOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  components: {
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    BarChartOutlined,
    CloudOutlined,
  },

  setup() {
    const router = useRouter();
    const selectedKeys = ref(["1"]);
    const routerList = [
      "/",
      "/userInfo",
      "/productList",
      "/cartList",
      "/orderList",
    ];

    watch(selectedKeys, (newValue) => {
      console.log(newValue[0]);
      router.push(routerList[parseInt(newValue[0]) - 1]);
    });
    return {
      selectedKeys,
    };
  },
});
</script>
<style>
#components-layout-demo-fixed-sider .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.site-layout .site-layout-background {
  background: #fff;
}

[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
