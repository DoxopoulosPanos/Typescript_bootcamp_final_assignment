export interface Account {
  id: string,
  name: string,
  balance: number,
}

export interface Product {
  id: string,
  title: string,
  description: string,
  stock: number,
  price: number,
}

export interface DayDeposit {
  id: string,
  accountId: string,
  deposit: number
}

export interface ProductHistory {
  simulationDay: number,
  products: Product[]
}

export interface AccountWithInterest extends Account {
  // interest: number,
  currentMonthEarnings: number
}
