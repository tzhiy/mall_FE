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
        label="username"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.user.username"
          :placeholder="formState.user.username"
        />
      </a-form-item>
      <a-form-item
        :name="['user', 'password']"
        label="password"
        :rules="[{ required: false }]"
      >
        <a-input v-model:value="formState.user.password" />
      </a-form-item>
      <a-form-item label="gender" :name="['user', 'password']">
        <a-radio-group
          v-model:value="formState.user.gender"
          :placeholder="formState.user.gender"
        >
          <a-radio value="1">male</a-radio>
          <a-radio value="0">female</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :name="['user', 'phone']"
        label="phone"
        :rules="[{ required: false }]"
      >
        <a-input
          v-model:value="formState.user.phone"
          :placeholder="formState.user.phone"
        />
      </a-form-item>
      <a-form-item
        :name="['user', 'email']"
        label="Email"
        :rules="[{ type: 'email' }]"
      >
        <a-input
          v-model:value="formState.user.email"
          :placeholder="formState.user.email"
        />
      </a-form-item>
      <a-form-item :name="['user', 'description']" label="description">
        <a-textarea
          v-model:value="formState.user.description"
          :placeholder="formState.user.description"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ ...layout.wrapperCol, offset: 8 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
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
      console.log(localStorage.getItem("token"));
      const result = await get(
        "/mall/customer",
        {},
        {
          Authorization: localStorage.getItem("token"),
        }
      );
      console.log(result);
      formState.user = result.data;
      console.log(formState.user);
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
      console.log("Success:", formState.user);
      const result = await put("/mall/customer", params, {
        Authorization: localStorage.getItem("token"),
      });
      console.log(result);
      if (result.code === 200) {
        message.success("登录成功");
      } else {
        message.error("登录失败");
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
  width: 800px;
}
</style>
