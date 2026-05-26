<script setup>
import DashBackends from "../components/DashBackends.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function goToAbout() {
  router.push("/about");
}
</script>

<template>
  <DashBackends />

</template>
