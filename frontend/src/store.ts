import { ref, watch, computed } from 'vue';
import yaml from 'js-yaml';

// Initial default YAML configuration
const defaultYaml = `version: "1.0"

# INCOME STREAMS
income:
  salaries:
    - name: "Primary Job"
      type: "weekly"
      amount: 2000
      expected_annual_growth: 0.03 # 3% annual raise
  bonuses:
    - name: "Annual Performance Bonus"
      amount: 10000
      frequency: "annual"
      month: 2 # February
  rsus:
    - ticker: "MEGA" # Example ticker
      grant_date: 2025-01-15 # Use standard format
      vesting_schedule:
        type: "annual"
        years: 4
        cliff_months: 12 # Cliff before first vest
      shares: 400

# EXPENSES
expenses:
  # Customizable expense list with frequencies
  items:
    - name: "Rent"
      amount: 1800
      frequency: "monthly"
    - name: "Groceries"
      amount: 150
      frequency: "weekly"
    - name: "Subscriptions"
      amount: 50
      frequency: "monthly"
    - name: "Car Insurance"
      amount: 600
      frequency: "annual"
  
  # How expenses change over time
  assumptions:
    base_inflation_rate: 0.03 # 3% annual inflation applied to most expenses
    lifestyle_creep_rate: 0.01 # 1% extra growth reflecting lifestyle upgrades

  # Future planned specific changes to lifestyle
  future_events:
    - event: "Buy a House"
      year: 2028
      one_time_cost: 80000 # Down payment
      monthly_cost_change: 1200 # Mortgage + taxes/insurance vs previous rent
    - event: "Buy a Car"
      year: 2029
      one_time_cost: 35000
      monthly_cost_change: 150 # Insurance and maintenance

# INVESTMENTS & TRADES
investments:
  # Individual stock trades to track performance vs index
  trades:
    - ticker: "MSFT"
      date: 2022-04-10
      type: "buy"
      shares: 50
      price_per_share: 280.50
    - ticker: "MSFT"
      date: 2023-11-20
      type: "sell"
      shares: 20
      price_per_share: 370.00
    - ticker: "VOO"
      date: 2024-01-05
      type: "buy"
      shares: 100
      price_per_share: 430.00`;

// State
export const devMode = ref(false);
export const isLoading = ref(false);
export const forecastData = ref<any>(null);
export const yamlString = ref(defaultYaml);

// A small utility to generate unique local UI keys
const generateId = () => Math.random().toString(36).substring(2, 9);

const sanitizeConfig = (obj: any) => {
  if (!obj) return obj;
  // Recursively convert all Date objects to YYYY-MM-DD strings
  const walk = (o: any) => {
    if (o instanceof Date) {
      return o.toISOString().split('T')[0];
    }
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) {
        o[i] = walk(o[i]);
      }
    } else if (typeof o === 'object' && o !== null) {
      for (const key of Object.keys(o)) {
        o[key] = walk(o[key]);
      }
    }
    return o;
  };

  walk(obj);

  // Setup IDs for trades
  if (obj.investments && Array.isArray(obj.investments.trades)) {
    obj.investments.trades.forEach((trade: any) => {
      if (!trade._id) trade._id = generateId();
      if (typeof trade.date === 'string' && trade.date.includes('T')) {
        trade.date = trade.date.split('T')[0];
      }
    });
  }

  return obj;
};


// In a production app, we would type this fully.
export const configObj = ref<any>(sanitizeConfig(yaml.load(defaultYaml)));

// Client-side initialization to load from localStorage
if (typeof window !== 'undefined') {
  const savedDevMode = localStorage.getItem('financeDevMode');
  if (savedDevMode) {
    devMode.value = JSON.parse(savedDevMode);
  }

  const savedYaml = localStorage.getItem('financeYamlConfig');
  if (savedYaml) {
    yamlString.value = JSON.parse(savedYaml);
    try {
      configObj.value = sanitizeConfig(yaml.load(yamlString.value));
      // Actively purge leftover ISO formats from raw text
      yamlString.value = yaml.dump(configObj.value);
    } catch (e) {
      console.error("Failed to parse saved yaml, falling back to default", e);
      configObj.value = sanitizeConfig(yaml.load(defaultYaml));
      yamlString.value = defaultYaml;
    }
  }

  const savedForecast = localStorage.getItem('financeForecastData');
  if (savedForecast) {
    forecastData.value = JSON.parse(savedForecast);
  }

  // Set up watchers to save state continuously
  watch(devMode, (val) => {
    localStorage.setItem('financeDevMode', JSON.stringify(val));
  });

  watch(yamlString, (val) => {
    localStorage.setItem('financeYamlConfig', JSON.stringify(val));
  }, { deep: true });

  watch(forecastData, (val) => {
    if (val) {
      localStorage.setItem('financeForecastData', JSON.stringify(val));
    }
  }, { deep: true });
}

// Sync functions
export const syncObjectToYaml = () => {
  try {
    // Before dumping, let's sort all trades by date (no date first, then newest, then oldest)
    if (configObj.value?.investments?.trades) {
      configObj.value.investments.trades.sort((a: any, b: any) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return -1;
        if (!b.date) return 1;
        // Reverse chronological order
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    yamlString.value = yaml.dump(configObj.value);
  } catch (e) {
    console.error("Failed to dump yaml", e);
  }
};

export const syncYamlToObject = () => {
  try {
    const loaded = yaml.load(yamlString.value) as any;
    configObj.value = sanitizeConfig(loaded);
  } catch (e) {
    console.error("Failed to parse yaml, ignoring object update", e);
  }
};

export const exportYamlToFile = () => {
  syncObjectToYaml(); // Ensure yamlString is perfectly synced to UI before download
  const blob = new Blob([yamlString.value], { type: 'text/yaml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'finance_forecast_config.yaml');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importYamlFromFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (typeof content === 'string') {
      try {
        // Ensure it's valid YAML before blowing out the state
        const parsed = yaml.load(content);
        if (parsed) {
          yamlString.value = content;
          configObj.value = parsed;
        }
      } catch (err) {
        alert("The uploaded file could not be parsed as valid YAML.");
        console.error("YAML parse error during import:", err);
      }
    }
  };
  reader.readAsText(file);
};


// Form Array Helpers (Income)
export const addSalary = () => {
  configObj.value.income.salaries.push({
    name: "New Salary",
    type: "monthly",
    amount: 5000,
    expected_annual_growth: 0.03
  });
  syncObjectToYaml();
};

export const removeSalary = (index: number) => {
  configObj.value.income.salaries.splice(index, 1);
  syncObjectToYaml();
};

export const addBonus = () => {
  configObj.value.income.bonuses.push({
    name: "New Bonus",
    amount: 1000,
    frequency: "annual",
    month: 1
  });
  syncObjectToYaml();
};

export const removeBonus = (index: number) => {
  configObj.value.income.bonuses.splice(index, 1);
  syncObjectToYaml();
};

export const addRsu = () => {
  configObj.value.income.rsus.push({
    ticker: "NEW",
    grant_date: "2026-01-01",
    shares: 100,
    vesting_schedule: {
      type: "annual",
      years: 4,
      cliff_months: 12
    }
  });
  syncObjectToYaml();
};

export const removeRsu = (index: number) => {
  configObj.value.income.rsus.splice(index, 1);
  syncObjectToYaml();
};

// Form Array Helpers (Expenses)
export const addExpense = () => {
  configObj.value.expenses.items.push({
    name: "New Expense",
    amount: 100,
    frequency: "monthly",
  });
  syncObjectToYaml();
};

export const removeExpense = (index: number) => {
  configObj.value.expenses.items.splice(index, 1);
  syncObjectToYaml();
};

// Form Array Helpers (Investments)
export const addTrade = (tickerName = "NEW_TICKER") => {
  const newId = generateId();
  configObj.value.investments.trades.unshift({
    _id: newId,
    ticker: tickerName.toUpperCase(),
    date: "", // No date ensures it bubbles to the very top in sorting
    type: "buy",
    shares: 10,
    price_per_share: 100.00
  });
  syncObjectToYaml();
  return newId; // Return ID so UI can focus it
};

export const removeTradeById = (id: string) => {
  const index = configObj.value.investments.trades.findIndex((t: any) => t._id === id);
  if (index !== -1) {
    configObj.value.investments.trades.splice(index, 1);
    syncObjectToYaml();
  }
};

export const removeTrade = (index: number) => {
  configObj.value.investments.trades.splice(index, 1);
  syncObjectToYaml();
};

// Compute chart data globally
export const chartData = computed(() => {
  if (!forecastData.value || !forecastData.value.timeline) return null;

  const timeline = forecastData.value.timeline;

  // Downsample data if too large (e.g., plot every year instead of every month) to make chart responsive
  const dataPoints = timeline.filter((_: any, idx: number) => idx % 12 === 0);

  return {
    labels: dataPoints.map((d: any) => `${d.year}`),
    datasets: [
      {
        label: 'Net Cashflow (Cumulative)',
        backgroundColor: 'rgba(56, 189, 248, 0.2)', // Tailwind primary color with opacity
        borderColor: 'rgb(56, 189, 248)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 6,
        fill: true,
        data: dataPoints.map((d: any) => d.cumulative_cash)
      }
    ]
  };
});

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'var(--fallback-bc,oklch(var(--bc)/0.8))'
      }
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        color: 'var(--fallback-bc,oklch(var(--bc)/0.6))',
        callback: function (value: any) {
          if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
          if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
          return '$' + value;
        }
      },
      grid: {
        color: 'var(--fallback-b3,oklch(var(--b3)/0.5))'
      }
    },
    x: {
      ticks: {
        color: 'var(--fallback-bc,oklch(var(--bc)/0.6))',
        maxRotation: 45,
        minRotation: 45
      },
      grid: {
        display: false
      }
    }
  }
};

export const runForecast = async () => {
  // If in standard mode, ensure the YAML string has the latest UI values before sending
  if (!devMode.value) {
    syncObjectToYaml();
  } else {
    syncYamlToObject();
  }

  // Create a clean payload object that strips incomplete trades so the simulation doesn't crash
  const clonedConfig = JSON.parse(JSON.stringify(configObj.value));
  if (clonedConfig.investments?.trades) {
    clonedConfig.investments.trades = clonedConfig.investments.trades.filter((trade: any) => {
      return trade.ticker && trade.date && (trade.shares !== null && trade.shares !== undefined) && (trade.price_per_share !== null && trade.price_per_share !== undefined);
    });
  }
  const payloadYaml = yaml.dump(clonedConfig);

  isLoading.value = true;
  try {
    const response = await fetch('http://127.0.0.1:8000/api/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payloadYaml
    });

    if (response.ok) {
      const data = await response.json();
      forecastData.value = data.data;
      // Navigation to simulation page will be handled by the component.
      return true;
    } else {
      const err = await response.text();
      alert("Failed to parse YAML configuration: " + err);
      return false;
    }
  } catch (error) {
    console.error("Error connecting to backend:", error);
    alert("Could not connect to the backend server. Is FastAPI running?");
    return false;
  } finally {
    isLoading.value = false;
  }
};
