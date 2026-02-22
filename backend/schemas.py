from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class Salary(BaseModel):
    name: str = "Base Salary"
    type: str # e.g. weekly, monthly, annual
    amount: float
    expected_annual_growth: float

class Bonus(BaseModel):
    name: str
    amount: float
    frequency: str
    month: int

class VestingSchedule(BaseModel):
    type: str
    years: int
    cliff_months: Optional[int] = 0

class RSUGrant(BaseModel):
    ticker: str
    grant_date: date
    vesting_schedule: VestingSchedule
    shares: float

class IncomeStreams(BaseModel):
    salaries: List[Salary] = Field(default_factory=list)
    bonuses: List[Bonus] = Field(default_factory=list)
    rsus: List[RSUGrant] = Field(default_factory=list)

class CustomExpense(BaseModel):
    name: str
    amount: float
    frequency: str # e.g. weekly, monthly, annual

class ExpenseAssumptions(BaseModel):
    base_inflation_rate: float
    lifestyle_creep_rate: float

class FutureEvent(BaseModel):
    event: str
    year: int
    one_time_cost: float = 0.0
    monthly_cost_change: float = 0.0

class Expenses(BaseModel):
    items: List[CustomExpense] = Field(default_factory=list)
    assumptions: ExpenseAssumptions
    future_events: List[FutureEvent] = Field(default_factory=list)

class Trade(BaseModel):
    ticker: str
    date: date
    type: str # 'buy' or 'sell'
    shares: float
    price_per_share: float

class Investments(BaseModel):
    trades: List[Trade] = Field(default_factory=list)

class FinanceData(BaseModel):
    """The root schema that matches the demo.yaml structure."""
    income: IncomeStreams
    expenses: Expenses
    investments: Investments
