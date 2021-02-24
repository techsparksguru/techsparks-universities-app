<template>
  <div class="mr-3 my-3 account">
    <div class="card-body text-center">
      <a-row :gutter="10">
        <a-col :span="10">
          <a-form-item
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
            :label="showLable ? 'First Name' : ''"
            :validate-status="errors.first_name ? 'error' : ''"
            :help="errors.first_name"
          >
            <a-input
              type="text"
              size="large"
              placeholder="First Name"
              v-model="payload.first_name"
              @keyup.enter="updateProfile"
              v-bind:disabled="is_loading"
            ></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
            :label="showLable ? 'Last Name' : ''"
            :validate-status="errors.last_name ? 'error' : ''"
            :help="errors.last_name"
          >
            <a-input
              type="text"
              size="large"
              placeholder="Last name"
              v-model="payload.last_name"
              @keyup.enter="updateProfile"
              v-bind:disabled="is_loading"
            ></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
            :label="showLable ? ' Default Color' : ''"
            :validate-status="errors.default_color ? 'error' : ''"
            :help="errors.default_color"
          >
            <swatches
              class="default-color-picker"
              v-model="payload.default_color"
              colors="material-dark"
              popover-to="left"
            ></swatches>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item
        :label-col="{ span: 24 }"
        :wrapper-col="{ span: 24 }"
        :label="showLable ? 'Email' : ''"
        :validate-status="errors.email ? 'error' : ''"
        :help="errors.email"
      >
        <a-input
          type="text"
          size="large"
          placeholder="Email"
          v-model="payload.email"
          disabled
          @keyup.enter="updateProfile"
        ></a-input>
      </a-form-item>
      <a-upload
        name="avatar"
        list-type="picture-card"
        class="avatar-uploader"
        :show-upload-list="false"
        :customRequest="customRequest"
      >
        <img
          v-if="payload.picture&&payload.picture.url"
          style="width: 100%;"
          :src="API_URL.slice(0, API_URL.length - 1) + payload.picture.url"
          alt="avatar"
        />
        <div v-else>
          <a-icon :type="loading ? 'loading' : 'plus'" />
          <div class="ant-upload-text">
            Upload
          </div>
        </div>
      </a-upload>
      <a-button
        type="primary"
        :loading="is_loading"
        size="large"
        v-on:click="updateProfile"
        class="mb-4 w-100 shadow-2"
        >Update</a-button
      >
    </div>
  </div>
</template>

<script src="./Account.js"></script>
<style src="./Account.css" scoped></style>
<style>
.default-color-picker > div:nth-child(1) {
  display: flex;
  padding-left: 12px;
  padding-bottom: 10px;
}
</style>