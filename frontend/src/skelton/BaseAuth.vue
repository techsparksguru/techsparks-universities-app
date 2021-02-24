<template>
  <div class="login p-3">
    <img src="../assets/r_logo.svg" height="50px" style="cursor:pointer" @click="$router.push(`/`)" alt />
    <a-row type="flex" justify="center" align="top"  class="vh-100">
      <a-col :xs="24" :md="12">
        <div class="d-flex align-items-center justify-content-center vh-100">
          <router-view />
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      colors: ["#90bca0", "#65c9e9", "#989cce", "#67cbeb"],
      currentBg: "#90bca0"
    };
  }
};
</script>
<style scoped>
/* For demo */
.ant-carousel {
  height: 100vh;
}

.image-container {
  display: flex;
  justify-content: center;
}

.description {
  padding: 30px;
  padding-top: 90px;
  color: #fff !important;
}

.description h1 {
  color: #fff !important;
}

.image-container img {
  height: 50%;
  width: 70%;
}

.slick-slide.slick-active.slick-current .image-container img {
  -webkit-box-shadow: -8px 31px 20px 0px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: -8px 31px 20px 0px rgba(0, 0, 0, 0.3);
  box-shadow: -8px 31px 20px 0px rgba(0, 0, 0, 0.3);
  transition: all 500ms ease-in;
}

.slick-slide .image-container img {
  -webkit-box-shadow: -8px 10px 20px 0px rgba(0, 0, 0, 0.3);
  -moz-box-shadow: -8px 10px 20px 0px rgba(0, 0, 0, 0.3);
  box-shadow: -8px 10px 20px 0px rgba(0, 0, 0, 0.3);
  transition: all 500ms ease-out;
}

.ant-carousel >>> .slick-dots {
  bottom: 50px !important;
}

.ant-carousel >>> .slick-slide {
  text-align: center;
  padding: 50px;
  height: 100vh;
}

.ant-carousel .slick-slider {
  overflow: hidden;
}

.ant-carousel >>> .slick-slide h3 {
  color: #fff;
}
</style>
