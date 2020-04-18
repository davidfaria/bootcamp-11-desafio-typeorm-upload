import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    // console.log('Exists:', categoryExists);

    let newCategory;

    if (!categoryExists) {
      newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
    }

    // console.log('New:', newCategory);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();

      if (total < value) {
        throw new AppError('Saldo insuficiente');
      }
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists ? categoryExists.id : newCategory?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
