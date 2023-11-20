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

// export interface Account extends AccountResponse {
//   simulatedDay: number,
//   todayDeposits: number
// }

export interface DayDeposit {
  id: string,
  accountId: string,
  deposit: number
}

export interface ProductHistory {
  simulationDay: number,
  products: Product[]
}
