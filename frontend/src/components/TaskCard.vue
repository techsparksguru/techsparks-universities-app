<template>
  <div class="bg-white shadow rounded p-3 border border-white">
    <div class="d-flex justify-content-between">
      <p
        class="text-gray-700 font-semibold font-sans tracking-wide text-sm"
        style="max-width: calc(100% - (1.5em + 5px));"
      >
        {{ task.university.name }} at
        {{ task.university.city ? task.university.city + "," : "" }}
        {{ task.university.state }}
      </p>

      <a-tooltip placement="bottom">
        <template slot="title">
          {{ task.user.first_name }} {{ task.user.last_name }}
        </template>
        <a-avatar
          v-if="task.user.picture"
          class="w-6 h-6 ml-3"
          :src="
            $Services.API_URL.slice(0, $Services.API_URL.length - 1) +
              task.user.picture.url
          "
        ></a-avatar>
        <a-avatar
          v-else
          :style="{ backgroundColor: task.user.default_color || '#fde3cf' }"
          class="w-6 h-6"
          style="color: #fff;font-size:12px;line-height:24px;cursor: pointer;"
          >{{ task.user.first_name?task.user.first_name[0]:'NA' }}</a-avatar
        >
      </a-tooltip>
    </div>
    <p class="mb-0">
      <a-icon class="mr-2" type="phone" />{{
        task.university.international_phone_number || "Not available"
      }}
    </p>
    <p class="mb-0">
      <a-icon class="mr-2" type="global" />
      <a
        target="_blank"
        :href="task.university.website "
        >{{task.university.website || "Not available"}}</a>
    </p>
    <p class="mb-0">
      <a-icon class="mr-2" type="environment" />
      <a
        target="_blank"
        :href="
          `${task.university.map_url ||
            'https://www.google.com/maps/search/' +
              task.university.name +
              task.university.state}`
        "
        >View in maps</a
      >
    </p>
    <div class="d-flex mt-4 justify-content-between">
      <span class="text-sm text-gray-600">{{
        moment(task.created_at).format("ll")
      }}</span>
      <div>
        <a-icon
          type="message"
          @click="$emit('message-open', task.university)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  components: {},
  props: {
    task: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    badgeColor() {
      const mappings = {
        product1: "purple",
        product2: "teal",
        product3: "blue",
        product4: "green",
        default: "teal"
      };
      return mappings[this.task.type] || mappings.default;
    }
  },
  methods: { moment }
};
</script>
<style scoped>
.w-6 {
  width: 1.5rem;
}
.ml-3 {
  margin-left: 0.75rem;
}
.h-6 {
  height: 1.5rem;
}
.rounded-full {
  border-radius: 9999px;
}
</style>