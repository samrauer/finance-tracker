<template>
  <div class="space-y-6 max-w-4xl mx-auto w-full">
    <!-- Salaries -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-success"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Income Streams
        </h3>
        <button class="btn btn-xs btn-outline btn-success" @click="addSalary">+ Add</button>
      </div>
      
      <div v-for="(salary, index) in configObj?.income?.salaries" :key="index" class="bg-base-100 p-3 rounded-lg border border-base-300 mb-3 relative">
        <button v-if="configObj?.income?.salaries.length > 1" @click="removeSalary(index)" class="btn btn-circle btn-ghost btn-xs absolute top-2 right-2 text-error">✕</button>
        
        <div class="form-control w-full mb-2">
          <label class="label py-1"><span class="label-text text-xs">Name</span></label>
          <input type="text" v-model="salary.name" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
        </div>
        
        <div class="flex gap-2 mb-2">
          <div class="form-control w-1/3">
            <label class="label py-1"><span class="label-text text-xs">Cycle</span></label>
            <select class="select select-bordered select-sm w-full" v-model="salary.type" @change="syncObjectToYaml">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div class="form-control w-2/3">
            <label class="label py-1"><span class="label-text text-xs">Amount ($)</span></label>
            <input type="number" v-model.number="salary.amount" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
          </div>
        </div>
        
        <div class="form-control w-full">
          <label class="label py-1"><span class="label-text text-xs">Expected Annual Raise (%)</span></label>
          <input type="number" step="0.01" v-model.number="salary.expected_annual_growth" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
        </div>
      </div>
    </div>

    <!-- Bonuses -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-success"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Bonuses
        </h3>
        <button class="btn btn-xs btn-outline btn-success" @click="addBonus">+ Add</button>
      </div>
      
      <div v-for="(bonus, index) in configObj?.income?.bonuses" :key="'bonus-'+index" class="bg-base-100 p-3 rounded-lg border border-base-300 mb-3 relative">
        <button @click="removeBonus(index)" class="btn btn-circle btn-ghost btn-xs absolute top-2 right-2 text-error">✕</button>
        
        <div class="form-control w-full mb-2">
          <label class="label py-1"><span class="label-text text-xs">Name</span></label>
          <input type="text" v-model="bonus.name" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
        </div>
        
        <div class="flex gap-2 mb-2">
          <div class="form-control w-1/3">
            <label class="label py-1"><span class="label-text text-xs">Freq</span></label>
            <select class="select select-bordered select-sm w-full" v-model="bonus.frequency" @change="syncObjectToYaml">
              <option value="annual">Annual</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
          <div class="form-control w-1/4">
            <label class="label py-1"><span class="label-text text-xs">Month (1-12)</span></label>
            <input type="number" v-model.number="bonus.month" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
          </div>
          <div class="form-control w-1/2">
            <label class="label py-1"><span class="label-text text-xs">Amount ($)</span></label>
            <input type="number" v-model.number="bonus.amount" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- RSUs -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-accent"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
          Stock Grants (RSUs)
        </h3>
        <button class="btn btn-xs btn-outline btn-accent" @click="addRsu">+ Add</button>
      </div>
      
      <div v-for="(rsu, index) in configObj?.income?.rsus" :key="'rsu-'+index" class="bg-base-100 p-3 rounded-lg border border-base-300 mb-3 relative">
        <button @click="removeRsu(index)" class="btn btn-circle btn-ghost btn-xs absolute top-2 right-2 text-error">✕</button>
        
        <div class="flex gap-2 mb-2">
          <div class="form-control w-1/2">
            <label class="label py-1"><span class="label-text text-xs">Ticker</span></label>
            <input type="text" v-model="rsu.ticker" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
          </div>
          <div class="form-control w-1/2">
            <label class="label py-1"><span class="label-text text-xs">Shares</span></label>
            <input type="number" v-model.number="rsu.shares" @change="syncObjectToYaml" class="input input-bordered input-sm w-full" />
          </div>
        </div>
        
        <div class="form-control w-full mb-3">
          <label class="label py-1"><span class="label-text text-xs">Grant Date</span></label>
          <input 
            type="date" 
            v-model="rsu.grant_date" 
            @change="syncObjectToYaml" 
            class="input input-bordered input-sm w-full" 
          />
        </div>
        
        <div class="form-control w-full mb-1">
          <label class="label py-1"><span class="label-text text-xs font-bold opacity-70">Vesting Schedule</span></label>
        </div>
        
        <div class="flex gap-2 bg-base-200 p-2 rounded border border-base-300">
          <div class="form-control w-1/3">
            <label class="label pt-0 pb-1"><span class="label-text text-xs">Type</span></label>
            <select class="select select-bordered select-xs w-full" v-model="rsu.vesting_schedule.type" @change="syncObjectToYaml">
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="form-control w-1/3">
            <label class="label pt-0 pb-1"><span class="label-text text-xs">Total Years</span></label>
            <input type="number" v-model.number="rsu.vesting_schedule.years" @change="syncObjectToYaml" class="input input-bordered input-xs w-full" />
          </div>
          <div class="form-control w-1/3">
            <label class="label pt-0 pb-1"><span class="label-text text-xs">Cliff (Months)</span></label>
            <input type="number" v-model.number="rsu.vesting_schedule.cliff_months" @change="syncObjectToYaml" class="input input-bordered input-xs w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  configObj, 
  syncObjectToYaml, 
  addSalary, 
  removeSalary, 
  addBonus, 
  removeBonus, 
  addRsu, 
  removeRsu 
} from '../store';
</script>
