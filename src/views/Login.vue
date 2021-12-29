<template>
  <div class="container">
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
      class="form"
    >
      <a-form-item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入用户名！' }]"
      >
        <a-input v-model:value="formState.username" />
      </a-form-item>
      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入密码！' }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button class="button-left" type="primary" @click="handleRegister"
          >注册</a-button
        >
        <a-button type="primary" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { message } from "ant-design-vue";
import { defineComponent, reactive } from "vue";
import { post } from "../utils/request";
export default defineComponent({
  setup() {
    const formState = reactive({
      username: "",
      password: "",
      remember: true,
    });

    const onFinish = async () => {
      const result = await post("/mall/login", {
        username: formState.username,
        password: formState.password,
      });
      if (result.code === 200) {
        localStorage.setItem("token", result.data);
        message.success("登录成功");
      } else if (result.code === 201) {
        message.error("账号或密码错误");
      } else {
        message.error("登录失败");
      }
    };

    const onFinishFailed = () => {};

    const handleRegister = async () => {
      if (formState.username === "" || formState.password === "") {
        message.warning("请填写完整的信息");
        return;
      }
      const result = await post("/mall/register", {
        username: formState.username,
        password: formState.password,
      });
      if (result.code === 200) {
        message.success("注册成功，快去登录吧");
      } else {
        message.error("注册失败");
      }
    };

    return {
      formState,
      onFinish,
      onFinishFailed,
      handleRegister,
    };
  },
});
</script>

<style scoped >
.container {
  display: flex;
  justify-content: center;
  align-content: center;
}

.form {
  width: 600px;
}

.button-left {
  transform: translateX(-30px);
  margin-right: 50px;
}
</style>
