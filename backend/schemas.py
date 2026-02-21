from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class Salary(BaseModel):
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
    salary: Salary
    bonuses: List[Bonus] = Field(default_factory=list)
    rsus: List[RSUGrant] = Field(default_factory=list)

class CurrentExpenses(BaseModel):
    rent: float = 0.0
    food: float = 0.0
    subscriptions: float = 0.0
    fun: float = 0.0
    misc: float = 0.0

class ExpenseAssumptions(BaseModel):
    base_inflation_rate: float
    lifestyle_creep_rate: float

class FutureEvent(BaseModel):
    event: str
    year: int
    one_time_cost: float = 0.0
    monthly_cost_change: float = 0.0

class Expenses(BaseModel):
    current: CurrentExpenses
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
