import fs from 'fs';
import csvToJson from 'csvtojson';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  importFile: string;
}

interface TransactionCsv {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ importFile }: Request): Promise<Transaction[]> {
    const transactionscsv: TransactionCsv[] = await csvToJson().fromFile(
      importFile,
    );
    const transactions: Transaction[] = [];
    const createTransactionService = new CreateTransactionService();

    // TODO ( MELHORAR PROCESSO PARA INSEIR EM MASSA )
    // NÃO UTILIZAR A REGRA DE NEGÓCIO DO SERVISE - createTransactionService

    for (const item of transactionscsv) {
      const transaction = await createTransactionService.execute(item);
      transactions.push(transaction);
    }

    await fs.promises.unlink(importFile);

    return transactions;
  }
}

export default ImportTransactionsService;
