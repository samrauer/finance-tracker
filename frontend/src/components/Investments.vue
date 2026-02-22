<template>
  <div class="space-y-6 max-w-4xl mx-auto w-full">
    <!-- Trades -->
    <div class="bg-base-200 rounded-lg p-4 border border-base-300">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-info"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>
          Manual Trades
        </h3>
        <div class="flex gap-2">
          <button class="btn btn-xs btn-ghost text-xs opacity-70" @click="handleExpandAll">Expand All</button>
          <button class="btn btn-xs btn-ghost text-xs opacity-70" @click="handleCollapseAll">Collapse All</button>
          <button class="btn btn-xs btn-outline btn-info" @click="handleAddTicker">+ Add Ticker</button>
        </div>
      </div>

      <div v-if="!groupedTrades.length" class="text-sm opacity-50 italic">No trades found. Add one above.</div>
      
      <div v-for="group in groupedTrades" :key="group.ticker" class="collapse collapse-arrow bg-base-100 border border-base-300 mb-3">
        <input type="checkbox" :checked="openGroups.has(group.ticker)" @change="toggleGroup(group.ticker)" /> 
        <div class="collapse-title text-md font-bold text-base-content/80 flex items-center pr-12">
          <div class="flex-1 flex gap-2 items-center">
            <input type="text" v-model="group.tickerModel" :data-ticker-input="group.ticker" class="input input-bordered input-sm max-w-[120px] font-mono uppercase bg-base-200 z-10 relative" @click.stop @change="updateTicker(group.ticker, group.tickerModel)" />
            <span class="badge badge-sm badge-neutral opacity-70">{{ group.trades.length }} trades</span>
          </div>
          <!-- Click.stop prevents the collapse from toggling when clicking the button -->
          <button class="btn btn-xs btn-outline btn-info z-10 relative" @click.stop="handleAddTrade(group.tickerModel)">+ Add Trade</button>
        </div>
        <div class="collapse-content space-y-3 pt-2 border-t border-base-200">
          <div v-for="trade in group.trades" :key="trade._id" :data-trade-id="trade._id" 
               class="p-3 rounded-lg border relative transition-colors"
               :class="isTradeValid(trade) ? 'bg-base-200 border-base-300' : 'bg-error/10 border-error/50'">
            <button @click="removeTradeById(trade._id)" class="btn btn-circle btn-ghost btn-xs absolute top-2 right-2 text-error" title="Remove Trade">✕</button>
            
            <div class="flex gap-2 mb-2">
              <div class="form-control w-full">
                <label class="label py-1"><span class="label-text text-xs">Type</span></label>
                <select class="select select-bordered select-sm w-full" :data-focus-target="'type-'+trade._id" v-model="trade.type" @change="handleTradeUpdate">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </div>

            <div class="form-control w-full mb-2">
              <label class="label py-1"><span class="label-text text-xs">Date</span></label>
              <input 
                type="date" 
                v-model="trade.date" 
                @change="handleTradeUpdate"
                :data-focus-target="'date-'+trade._id"
                class="input input-bordered input-sm w-full" 
              />
            </div>
            
            <div class="flex gap-2">
              <div class="form-control w-1/2">
                <label class="label py-1"><span class="label-text text-xs">Shares</span></label>
                <input type="number" v-model.number="trade.shares" @change="handleTradeUpdate" :data-focus-target="'shares-'+trade._id" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-1/2">
                <label class="label py-1"><span class="label-text text-xs">Price / Share ($)</span></label>
                <input type="number" step="0.01" v-model.number="trade.price_per_share" @change="handleTradeUpdate" :data-focus-target="'price-'+trade._id" class="input input-bordered input-sm w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { 
  configObj, 
  syncObjectToYaml, 
  addTrade, 
  removeTradeById 
} from '../store';

// Track which groups are currently expanded. Initialize all existing tickers as open.
const initialTickers = (configObj.value?.investments?.trades || []).map((t: any) => (t.ticker || '').toUpperCase());
const openGroups = ref<Set<string>>(new Set(initialTickers));

const toggleGroup = (ticker: string) => {
  if (openGroups.value.has(ticker)) {
    openGroups.value.delete(ticker);
  } else {
    openGroups.value.add(ticker);
  }
};

const handleExpandAll = () => {
    groupedTrades.value.forEach(g => {
        openGroups.value.add(g.ticker);
    });
};

const handleCollapseAll = () => {
    openGroups.value.clear();
};

const handleAddTicker = async () => {
    addTrade('NEW_TICKER');
    openGroups.value.add('NEW_TICKER');
    
    await nextTick();
    const el = document.querySelector(`input[data-ticker-input="NEW_TICKER"]`);
    if (el) {
      const input = el as HTMLInputElement;
      input.focus();
      input.select();
    }
};

const handleAddTrade = async (ticker: string) => {
    const newId = addTrade(ticker);
    openGroups.value.add(ticker.toUpperCase());
    
    await nextTick();
    const el = document.querySelector(`[data-focus-target="type-${newId}"]`);
    if (el) {
        (el as HTMLElement).focus();
    }
};

const groupedTrades = computed(() => {
  const trades = configObj.value?.investments?.trades || [];
  const groups: Record<string, any[]> = {};
  
  trades.forEach((trade: any) => {
    const ticker = (trade.ticker || '').toUpperCase();
    if (!groups[ticker]) {
      groups[ticker] = [];
    }
    // We pass the actual trade object reference to v-model bindings instead of indexes, 
    // ensuring we don't decouple from the data when the array sorts out from underneath us.
    groups[ticker].push(trade); 
  });

  return Object.keys(groups).sort().map(ticker => ({
    ticker,
    tickerModel: ticker,
    trades: groups[ticker]
  }));
});

const handleTradeUpdate = async () => {
    // Vue DOM rendering behaves inconsistently when native browser inputs dynamically physically shift 
    // their DOM locations, so we manually preserve focus semantics programmatically.
    const activeEl = document.activeElement as HTMLElement | null;
    const focusTarget = activeEl?.getAttribute('data-focus-target');

    syncObjectToYaml(); // Perform sort and update store

    await nextTick(); // Wait for Vue to fully reconstruct and reposition the new DOM order

    if (focusTarget) {
        const newEl = document.querySelector(`[data-focus-target="${focusTarget}"]`) as HTMLElement | null;
        if (newEl) newEl.focus();
    }
};

// A helper function to update all trades with the new ticker name if it gets edited in the header
const updateTicker = (oldTicker: string, newTicker: string) => {
    const upperOld = oldTicker.toUpperCase();
    const upperNew = newTicker.toUpperCase();
    
    // Maintain open state for the newly renamed ticker
    if (openGroups.value.has(upperOld)) {
        openGroups.value.delete(upperOld);
        openGroups.value.add(upperNew);
    }

    const trades = configObj.value?.investments?.trades || [];
    trades.forEach((trade: any) => {
        if ((trade.ticker || '').toUpperCase() === upperOld) {
            trade.ticker = upperNew;
        }
    });
    syncObjectToYaml();
}

const isTradeValid = (trade: any) => {
    return !!(
        trade.ticker && 
        trade.date && 
        trade.shares !== null && trade.shares !== undefined && trade.shares !== '' &&
        trade.price_per_share !== null && trade.price_per_share !== undefined && trade.price_per_share !== ''
    );
};
</script>
