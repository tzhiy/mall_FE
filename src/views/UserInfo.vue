<template>
  <div class="container">
    <a-form
      class="form"
      :model="formState"
      v-bind="layout"
      name="nest-messages"
      :validate-messages="validateMessages"
      @finish="onFinish"
    >
      <a-form-item
        :name="['user', 'username']"
        label="用户名"
        :rules="[{ required: false }]"
      >
        <a-input
          v-model:value="formState.user.username"
          :placeholder="formState.user.username"
        />
      </a-form-item>
      <a-form-item
        :name="['user', 'password']"
        label="密码"
        :rules="[{ required: false }]"
      >
        <a-input v-model:value="formState.user.password" />
      </a-form-item>
      <a-form-item label="性别" :name="['user', 'password']">
        <a-radio-group
          v-model:value="formState.user.gender"
          :placeholder="formState.user.gender"
        >
          <a-radio value="1">男</a-radio>
          <a-radio value="0">女</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :name="['user', 'phone']"
        label="电话"
        :rules="[{ required: false }]"
      >
        <a-input
          v-model:value="formState.user.phone"
          :placeholder="formState.user.phone"
        />
      </a-form-item>
      <a-form-item
        :name="['user', 'email']"
        label="邮箱"
        :rules="[{ type: 'email' }]"
      >
        <a-input
          v-model:value="formState.user.email"
          :placeholder="formState.user.email"
        />
      </a-form-item>
      <a-form-item :name="['user', 'description']" label="个人描述">
        <a-textarea
          v-model:value="formState.user.description"
          :placeholder="formState.user.description"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button type="primary" html-type="submit">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { defineComponent, reactive } from "vue";
import { message } from "ant-design-vue";
import { put, get } from "../utils/request";
export default defineComponent({
  setup() {
    const formState = reactive({
      user: {
        username: "",
        password: "",
        email: "",
        phone: "",
        description: "",
        gender: "",
      },
    });

    const getUserInfo = async () => {
      const result = await get(
        "/mall/customer",
        {},
        {
          Authorization: localStorage.getItem("token"),
        }
      );
      formState.user = result.data;
    };

    getUserInfo();

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
      types: {
        email: "${label} is not a valid email!",
        number: "${label} is not a valid number!",
      },
      number: {
        range: "${label} must be between ${min} and ${max}",
      },
    };

    const onFinish = async () => {
      const params = {
        userId: 3,
        ...formState.user,
      };
      const result = await put("/mall/customer", params, {
        Authorization: localStorage.getItem("token"),
      });
      if (result.code === 200) {
        message.success("修改成功");
      } else if (result.code === 701) {
        message.error("token 过期，请重新登录");
      } else {
        message.error("修改失败");
      }
    };

    return {
      formState,
      onFinish,
      layout,
      validateMessages,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
}

.form {
  width: 600px;
}
</style>
