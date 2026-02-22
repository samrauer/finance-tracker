<template>
  <div class="w-full h-full flex flex-col">
    <!-- DEV MODE: Raw YAML Editor -->
    <div v-if="devMode" class="card-body p-4 flex flex-col h-full">
      <h2 class="card-title text-sm uppercase tracking-wider text-primary border-b border-base-300 pb-2 flex justify-between">
        <span>Raw YAML Configuration</span>
      </h2>
      <textarea 
        v-model="yamlString" 
        class="textarea textarea-bordered font-mono mt-2 flex-1 w-full text-xs bg-base-200 resize-none focus:outline-primary leading-tight overflow-y-auto"
        spellcheck="false"
        @change="syncYamlToObject"
      ></textarea>
    </div>

    <!-- STANDARD MODE: Interactive UI -->
    <div v-else class="flex flex-col h-full max-w-full w-full">
      <!-- Tabs -->
      <TabNavigation />

      <!-- Tab Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 max-w-full w-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { devMode, yamlString, syncYamlToObject } from '../store';
import TabNavigation from './TabNavigation.vue';
</script>
