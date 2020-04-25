import fs from 'fs';
import { getRepository, In } from 'typeorm';
import csvToJson from 'csvtojson';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const transactionscsv: TransactionCsv[] = await csvToJson().fromFile(
      importFile,
    );

    // TODO ( MELHORAR PROCESSO PARA INSEIR EM MASSA )
    // NÃO UTILIZAR A REGRA DE NEGÓCIO DO SERVISE - createTransactionService

    // for (const item of transactionscsv) {
    //   const transaction = await createTransactionService.execute(item);
    //   transactions.push(transaction);
    // }

    const csvCategories = transactionscsv.map(tx => tx.category);

    /** Get category that exists in database */
    const existsCategories = await categoryRepository.find({
      where: { title: In(csvCategories) },
    });
    const dbFoundCategories = existsCategories.map(category => category.title);

    /** Get unique category that will be save to database */
    const categoriesToSaveDB = Array.from(
      new Set(csvCategories.filter(item => !dbFoundCategories.includes(item))),
    );

    /**
     *  (Bulk) save new categories from csv
     */
    const newCategoriesSaved = await categoryRepository.save(
      categoriesToSaveDB.map(title => {
        return {
          title,
        };
      }),
    );

    const AllCategoriesDB = [...existsCategories, ...newCategoriesSaved];

    const transactionsToSaveDB = transactionscsv.map(tx => {
      return {
        ...tx,
        category: AllCategoriesDB.find(item => item.title === tx.category),
      };
    });

    const transactions = await transactionRepository.save(transactionsToSaveDB);

    // console.log(
    //   csvCategories,
    //   dbFoundCategories,
    //   categoriesToSaveDB,
    //   newCategoriesSaved,
    //   transactions,
    // );

    await fs.promises.unlink(importFile);

    return transactions;
  }
}

export default ImportTransactionsService;
