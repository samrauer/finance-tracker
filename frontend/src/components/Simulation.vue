<template>
  <div class="space-y-6 h-full flex flex-col w-full max-w-6xl mx-auto">
    <!-- No Data State -->
    <div v-if="!forecastData" class="flex-1 flex flex-col items-center justify-center text-center text-base-content/40 py-20">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-4 opacity-50">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
      <p class="text-xl font-medium">No simulation data</p>
      <p class="text-sm">Click the "Run Simulation" button above to see results.</p>
    </div>

    <!-- Results Content -->
    <div v-else class="flex-1 flex flex-col gap-6 w-full">
      <div class="stats stats-vertical lg:stats-horizontal bg-base-200 shadow overflow-hidden w-full border border-base-300">
        <div class="stat">
          <div class="stat-title text-xs uppercase tracking-widest font-bold">Projected Net Liquidity (30y)</div>
          <div class="stat-value text-primary font-black text-3xl sm:text-4xl">${{ Math.round(forecastData.summary.final_cashflow).toLocaleString() }}</div>
          <div class="stat-desc mt-1">Cumulative inflation-adjusted cashflow</div>
        </div>
        <div class="stat">
          <div class="stat-title text-xs uppercase tracking-widest font-bold">Investments (Pending)</div>
          <div class="stat-value text-secondary font-black opacity-30">---</div>
          <div class="stat-desc">Waiting for Monte Carlo simulator</div>
        </div>
      </div>

      <div class="flex-1 bg-base-100 rounded-xl p-4 border border-base-300 min-h-[400px] w-full max-w-full">
        <Line
          v-if="chartData"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forecastData, chartData, chartOptions } from '../store';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
</script>
