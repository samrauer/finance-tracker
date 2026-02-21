import polars as pl
import numpy as np
from datetime import date
from dateutil.relativedelta import relativedelta
from .schemas import FinanceData

def generate_timeline(start_date: date, months: int = 360) -> pl.DataFrame:
    """Generate a monthly timeline dataframe."""
    dates = [start_date + relativedelta(months=i) for i in range(months)]
    df = pl.DataFrame({
        "date": dates,
        "month": [d.month for d in dates],
        "year": [d.year for d in dates],
        "month_index": range(months)
    })
    return df

def calculate_salary(df: pl.DataFrame, salary_data) -> pl.Series:
    """Calculate monthly salary with annual growth."""
    if salary_data.type == "weekly":
        base_monthly = salary_data.amount * 52.0 / 12.0
    elif salary_data.type == "annual":
        base_monthly = salary_data.amount / 12.0
    else:
        base_monthly = salary_data.amount
        
    start_year = df["year"][0]
    years_elapsed = df["year"] - start_year
    
    # Compound growth: base * (1 + growth)^years_elapsed
    monthly_salary = base_monthly * (1 + salary_data.expected_annual_growth) ** years_elapsed
    return monthly_salary

def calculate_bonuses(df: pl.DataFrame, bonuses_data) -> pl.Series:
    """Add bonuses in the specified months."""
    bonus_array = np.zeros(len(df), dtype=float)
    for bonus in bonuses_data:
        mask = df["month"] == bonus.month
        bonus_array += mask.to_numpy().astype(float) * bonus.amount
    return pl.Series("bonus", bonus_array)

def calculate_expenses(df: pl.DataFrame, expenses_data) -> pl.Series:
    """Calculate monthly expenses with inflation and events."""
    base_current = (
        expenses_data.current.rent + 
        expenses_data.current.food + 
        expenses_data.current.subscriptions + 
        expenses_data.current.fun + 
        expenses_data.current.misc
    )
    
    start_year = df["year"][0]
    years_elapsed = df["year"] - start_year
    
    total_growth_rate = expenses_data.assumptions.base_inflation_rate + expenses_data.assumptions.lifestyle_creep_rate
    monthly_expenses = base_current * (1 + total_growth_rate) ** years_elapsed
    
    # Add future events
    events_array = np.zeros(len(df), dtype=float)
    for event in expenses_data.future_events:
        one_time_mask = (df["year"] == event.year) & (df["month"] == 1)
        recurring_mask = df["year"] >= event.year
        
        events_array += one_time_mask.to_numpy().astype(float) * event.one_time_cost
        events_array += recurring_mask.to_numpy().astype(float) * event.monthly_cost_change
        
    # Return directly as Series avoiding operator overload issues
    return monthly_expenses + pl.Series("events_cost", events_array)

def run_simulation(data: FinanceData, months: int = 360) -> dict:
    today = date.today()
    start_date = date(today.year, today.month, 1)
    
    df = generate_timeline(start_date, months)
    
    df = df.with_columns(
        salary=calculate_salary(df, data.income.salary),
        bonus=calculate_bonuses(df, data.income.bonuses),
    )
    df = df.with_columns(
        total_income=pl.col("salary") + pl.col("bonus"),
        expenses=calculate_expenses(df, data.expenses)
    )
    
    df = df.with_columns(
        net_cashflow=pl.col("total_income") - pl.col("expenses")
    )
    
    df = df.with_columns(
        cumulative_cash=pl.col("net_cashflow").cum_sum()
    )
    
    records = df.to_dicts()
    
    for r in records:
        r["date"] = r["date"].isoformat()
        
    return {
        "timeline": records,
        "summary": {
            "final_cashflow": records[-1]["cumulative_cash"]
        }
    }
