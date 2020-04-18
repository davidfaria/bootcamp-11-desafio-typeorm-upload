import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const { income, outcome } = transactions.reduce(
      (acumulator: Balance, tx: Transaction) => {
        const balance: Balance = acumulator;

        switch (tx.type) {
          case 'income':
            balance.income += Number(tx.value);
            break;

          case 'outcome':
            balance.outcome += Number(tx.value);
            break;
          default:
            break;
        }
        return balance;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
