<script setup>
import DashBackends from "../components/DashBackends.vue";
import HomePage from "../components/HomePage.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function goToAbout() {
  router.push("/about");
}
</script>

<template>
  <DashBackends />

</template>
