import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Gift } from './entities/gift.entity';
import { GiftsService } from './gifts.service';

const gift = (id: string) => ({ id, category: 'spa' }) as Gift;

describe('GiftsService', () => {
  let service: GiftsService;
  const repository = { find: jest.fn(), findOneBy: jest.fn() };

  beforeEach(async () => {
    repository.find.mockReset();
    repository.findOneBy.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GiftsService,
        { provide: getRepositoryToken(Gift), useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(GiftsService);
  });

  it('если ничего не найдено, возвращает три подарка в suggestions', async () => {
    repository.find
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([gift('1'), gift('2'), gift('3')]);

    const result = await service.findAll({ search: 'нет такого' });

    expect(result.items).toEqual([]);
    expect(result.suggestions).toHaveLength(3);
    expect(repository.find).toHaveBeenLastCalledWith(
      expect.objectContaining({ take: 3 }),
    );
  });

  it('если подарки найдены, suggestions пустой', async () => {
    repository.find.mockResolvedValueOnce([gift('1')]);

    const result = await service.findAll({ category: 'spa' });

    expect(result.items).toHaveLength(1);
    expect(result.suggestions).toEqual([]);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('поиск ищет в title ИЛИ description, а остальные фильтры остаются через AND', async () => {
    repository.find.mockResolvedValueOnce([gift('1')]);

    await service.findAll({ search: 'чай', tier: 'premium' as never });

    const { where } = repository.find.mock.calls[0][0] as {
      where: Record<string, unknown>[];
    };
    expect(where).toHaveLength(2);
    expect(where[0]).toHaveProperty('title');
    expect(where[1]).toHaveProperty('description');
    expect(where[0]).toHaveProperty('tier', 'premium');
    expect(where[1]).toHaveProperty('tier', 'premium');
  });

  it('findOne бросает 404, если подарка нет', async () => {
    repository.findOneBy.mockResolvedValueOnce(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
