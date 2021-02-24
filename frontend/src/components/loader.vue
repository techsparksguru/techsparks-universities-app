<template>
  <div style="position:absolute;top:0;bottom:0;right:0;left:0;background-color:#f2f2f2b0">
    <div class="d-flex justify-content-center align-items-center h-100">
      <svg
        class="lds-blocks"
        width="200px"
        height="200px"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        style="background: none;"
      >
        <rect x="19" y="19" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0s"
            calcMode="discrete"
          />
        </rect>
        <rect x="40" y="19" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.125s"
            calcMode="discrete"
          />
        </rect>
        <rect x="61" y="19" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.25s"
            calcMode="discrete"
          />
        </rect>
        <rect x="19" y="40" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.875s"
            calcMode="discrete"
          />
        </rect>
        <rect x="61" y="40" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.375s"
            calcMode="discrete"
          />
        </rect>
        <rect x="19" y="61" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.75s"
            calcMode="discrete"
          />
        </rect>
        <rect x="40" y="61" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.625s"
            calcMode="discrete"
          />
        </rect>
        <rect x="61" y="61" width="20" height="20" fill="#93dbe9">
          <animate
            attributeName="fill"
            values="#689cc5;#93dbe9;#93dbe9"
            keyTimes="0;0.125;1"
            dur="1s"
            repeatCount="indefinite"
            begin="0.5s"
            calcMode="discrete"
          />
        </rect>
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  }
};
</script>