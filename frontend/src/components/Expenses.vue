<template>
  <div class="space-y-6 max-w-4xl mx-auto w-full">
    <!-- Custom Expense Items -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-error"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
          Baseline Expenses
        </h3>
        <button class="btn btn-xs btn-outline btn-error" @click="addExpense">+ Add</button>
      </div>
      
      <div class="space-y-2">
        <div v-for="(expense, index) in configObj?.expenses?.items" :key="index" class="flex gap-2 items-center">
          <input type="text" v-model="expense.name" @change="syncObjectToYaml" placeholder="Name" class="input input-bordered input-xs w-1/3" />
          <input type="number" v-model.number="expense.amount" @change="syncObjectToYaml" placeholder="$" class="input input-bordered input-xs w-1/4" />
          <select class="select select-bordered select-xs w-1/3" v-model="expense.frequency" @change="syncObjectToYaml">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button @click="removeExpense(index)" class="btn btn-square btn-ghost btn-xs text-error">✕</button>
        </div>
      </div>
    </div>

    <!-- Macro Assumptions -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <h3 class="font-bold mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-warning"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
        Macro Assumptions
      </h3>
      <div class="form-control w-full">
        <label class="label">
          <div class="tooltip tooltip-right" data-tip="Estimated annual increase in costs due to inflation.">
            <span class="label-text flex items-center gap-1 cursor-help">
            Inflation Rate (%)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-50"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            </span>
          </div>
        </label>
        <input type="number" step="0.01" v-model.number="configObj.expenses.assumptions.base_inflation_rate" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
      </div>
      <div class="form-control w-full mt-2">
        <label class="label">
          <div class="tooltip tooltip-right" data-tip="Annual increase in spending beyond inflation as your income grows.">
            <span class="label-text flex items-center gap-1 cursor-help">
            Lifestyle Creep (%)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-50"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            </span>
          </div>
        </label>
        <input type="number" step="0.01" v-model.number="configObj.expenses.assumptions.lifestyle_creep_rate" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  configObj, 
  syncObjectToYaml, 
  addExpense, 
  removeExpense 
} from '../store';
</script>
