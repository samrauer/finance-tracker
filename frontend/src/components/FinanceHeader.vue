<template>
  <div class="flex justify-between items-end">
    <div>
      <h1 class="text-4xl font-black tracking-tight text-primary">Financial Forecaster</h1>
      <div class="flex items-center gap-4 mt-2">
        <p class="text-base-content/70">Stochastic net worth projections</p>
        <div class="flex items-center gap-2">
            <button @click="exportYamlToFile" class="btn btn-xs btn-outline btn-neutral" title="Export Configuration to YAML" aria-label="Export Configuration to YAML">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Export
            </button>
            <label class="btn btn-xs btn-outline btn-neutral cursor-pointer" title="Import Configuration from YAML">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Import
                <input type="file" accept=".yaml,.yml" class="hidden" @change="importYamlFromFile" />
            </label>
            <div class="form-control ml-2">
                <label class="label cursor-pointer py-0 gap-2">
                <span class="label-text text-xs uppercase font-bold tracking-wider opacity-70">Dev Mode</span> 
                <input type="checkbox" v-model="devMode" class="toggle toggle-sm toggle-primary" />
                </label>
            </div>
        </div>
      </div>
    </div>
    <button 
      @click="handleRunForecast" 
      class="btn btn-primary btn-lg shadow-lg hover:-translate-y-1 transition-transform"
      :disabled="isLoading"
    >
      <span v-if="isLoading" class="loading loading-spinner"></span>
      Run Simulation
    </button>
  </div>
</template>

<script setup lang="ts">
import { devMode, isLoading, runForecast, exportYamlToFile, importYamlFromFile } from '../store';

const handleRunForecast = async () => {
    const success = await runForecast();
    if (success) {
        window.location.href = '/simulation';
    }
}
</script>
