from dataclasses import dataclass
from enum import Enum, auto
import datetime


class TransactionType(Enum):
    BUY = auto()
    SELL = auto()

    @staticmethod
    def from_str(type: str):
        type = type.lower()
        if type == "buy":
            return TransactionType.BUY
        if type == "sell":
            return TransactionType.SELL
        
        raise ValueError(f"type [{type}] must be BUY or SELL")


@dataclass
class Transaction:
    ticker: str
    type: TransactionType
    time: datetime.date
    price: float
    num_shares: float
    
    @property
    def amount(self):
        return self.price * self.num_shares


def extract_date(time):
    if type(time) is str:
        return datetime.datetime.strptime(time, "%m/%d/%Y").date()
    
    if type(time) is datetime.date:
        return time
    
    if type(time) is datetime.datetime:
        return time.date()
    
    raise ValueError(f"date [{time}] is not valid: ")


@dataclass
class Portfolio:
    transactions: list[Transaction]
 
    @classmethod
    def from_yaml(cls, data):
        investments = data["investments"]
        
        transactions = []
        for entry in investments:
            transactions.append(Transaction(
                ticker = entry["ticker"],
                type = TransactionType.from_str(entry["type"]),
                time = extract_date(entry["date"]),
                price = entry["price"],
                num_shares = entry["number"]
            ))

        return cls(transactions)

