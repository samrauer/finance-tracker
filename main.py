import yaml

from investments.investments import Portfolio


file_path = "demo.yaml"

with open(file_path, "r") as file:
    data = yaml.safe_load(file)



portfolio = Portfolio.from_yaml(data)


print(data)
print(portfolio)

