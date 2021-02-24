<template>
  <div class="text-center reset">
    <div class="mb-5">
      <h1> Welcome Back</h1>
      <p>Reset your password below</p>
    </div>
    <a-form-item
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
      :label="showLable ? 'Password' : ''"
      :validate-status="errors.password ? 'error' : ''"
      :help="errors.password"
    >
      <a-input
        type="password"
        size="large"
        placeholder="your strong password"
        v-model="password"
        @keyup.enter="resetPassword"
        @change="passwordChange"
        v-bind:disabled="is_loading"
      ></a-input>
    </a-form-item>
    <a-form-item
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
      :label="showLable ? 'Confirm password' : ''"
      :validate-status="errors.confirmPassword ? 'error' : ''"
      :help="errors.confirmPassword"
    >
      <a-input
        type="password"
        size="large"
        placeholder="Confirm your strong password"
        v-model="confirmPassword"
        @keyup.enter="resetPassword"
        @change="validateResetPassword"
        v-bind:disabled="is_loading"
      ></a-input>
    </a-form-item>
    <a-button
      type="primary"
      :loading="is_loading"
      size="large"
      v-on:click="resetPassword"
      class="mb-4 w-100 shadow-2"
      >Reset Password</a-button
    >
  <div>
    <h6 style="text-align:left"> Password Hint:</h6>
      <ul style="list-style-type:square;text-align:left">
      <li> At least 8 characters </li>
      <li> Should contain atleast one Uppercase , one number & One Special Character.</li>
      </ul>
    </div>
    </div>
</template>

<script src="./ResetPassword.js"></script>
<style src="./ResetPassword.css" scoped></style>
