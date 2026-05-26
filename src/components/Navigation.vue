<script setup>
import ApiConfig from "./ApiConfig.vue";
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl">Home</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li><router-link to="/query">Query</router-link></li>
        <li><ApiConfig /></li>
      </ul>
    </div>
  </div>
</template>
