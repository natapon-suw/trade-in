import { Workbook } from 'exceljs';
import { PassThrough } from 'stream';

import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;
  let prisma: {
    stockItem: { findMany: jest.Mock };
    assessment: { findMany: jest.Mock };
  };

  const mockStockItems = [
    {
      id: 'stock-1',
      price: 500,
      conditionGrade: 'A',
      status: 'AVAILABLE',
      createdAt: new Date('2024-06-15T10:00:00Z'),
      productModel: {
        brand: 'Apple',
        name: 'MacBook Pro 14"',
        category: 'MACBOOK',
      },
    },
    {
      id: 'stock-2',
      price: 300,
      conditionGrade: 'B',
      status: 'AVAILABLE',
      createdAt: new Date('2024-06-14T09:00:00Z'),
      productModel: {
        brand: 'Lenovo',
        name: 'ThinkPad X1',
        category: 'LAPTOP',
      },
    },
  ];

  const mockAssessments = [
    {
      id: 'assess-1',
      status: 'PRICED',
      finalPrice: 450,
      createdAt: new Date('2024-06-15T10:00:00Z'),
      customer: { name: 'John Doe', phone: '0812345678' },
      productModel: { name: 'MacBook Pro 14"', category: 'MACBOOK' },
    },
    {
      id: 'assess-2',
      status: 'STOCKED',
      finalPrice: null,
      createdAt: new Date('2024-06-14T09:00:00Z'),
      customer: { name: 'Jane Smith', phone: '0898765432' },
      productModel: { name: 'ThinkPad X1', category: 'LAPTOP' },
    },
  ];

  beforeEach(() => {
    prisma = {
      stockItem: { findMany: jest.fn() },
      assessment: { findMany: jest.fn() },
    };
    service = new ExportService(prisma as any);
  });

  async function captureWorkbook(
    fn: (res: PassThrough) => Promise<void>,
  ): Promise<Workbook> {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));

    await fn(stream as any);

    const buffer = Buffer.concat(chunks);
    const workbook = new Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(buffer as any);
    return workbook;
  }

  describe('exportStock', () => {
    it('should query stock items without filter when no category', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);

      await captureWorkbook((res) => service.exportStock(undefined, res as any));

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith({
        where: {},
        include: { productModel: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by category when provided', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);

      await captureWorkbook((res) => service.exportStock('LAPTOP', res as any));

      expect(prisma.stockItem.findMany).toHaveBeenCalledWith({
        where: { productModel: { category: 'LAPTOP' } },
        include: { productModel: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should create workbook with correct Stock worksheet columns', async () => {
      prisma.stockItem.findMany.mockResolvedValue([]);

      const workbook = await captureWorkbook((res) =>
        service.exportStock(undefined, res as any),
      );

      const sheet = workbook.getWorksheet('Stock');
      expect(sheet).toBeDefined();

      const headers = sheet!.getRow(1).values as string[];
      expect(headers).toContain('ID');
      expect(headers).toContain('Brand');
      expect(headers).toContain('Model');
      expect(headers).toContain('Category');
      expect(headers).toContain('Price');
      expect(headers).toContain('Condition Grade');
      expect(headers).toContain('Status');
      expect(headers).toContain('Date Added');
    });

    it('should write stock item rows to worksheet', async () => {
      prisma.stockItem.findMany.mockResolvedValue(mockStockItems);

      const workbook = await captureWorkbook((res) =>
        service.exportStock(undefined, res as any),
      );

      const sheet = workbook.getWorksheet('Stock')!;
      expect(sheet.rowCount).toBe(3); // header + 2 data rows

      // Columns: 1=ID, 2=Brand, 3=Model, 4=Category, 5=Price, 6=Condition Grade, 7=Status, 8=Date Added
      const row2 = sheet.getRow(2);
      expect(row2.getCell(1).value).toBe('stock-1');
      expect(row2.getCell(2).value).toBe('Apple');
      expect(row2.getCell(3).value).toBe('MacBook Pro 14"');
      expect(row2.getCell(6).value).toBe('A');

      const row3 = sheet.getRow(3);
      expect(row3.getCell(1).value).toBe('stock-2');
      expect(row3.getCell(2).value).toBe('Lenovo');
    });
  });

  describe('exportAssessments', () => {
    it('should query assessments without date filter when no dates', async () => {
      prisma.assessment.findMany.mockResolvedValue([]);

      await captureWorkbook((res) =>
        service.exportAssessments(undefined, undefined, res as any),
      );

      expect(prisma.assessment.findMany).toHaveBeenCalledWith({
        where: {},
        include: { customer: true, productModel: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by date range when dateFrom and dateTo provided', async () => {
      prisma.assessment.findMany.mockResolvedValue([]);

      await captureWorkbook((res) =>
        service.exportAssessments('2024-01-01', '2024-06-30', res as any),
      );

      expect(prisma.assessment.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-06-30'),
          },
        },
        include: { customer: true, productModel: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by dateFrom only', async () => {
      prisma.assessment.findMany.mockResolvedValue([]);

      await captureWorkbook((res) =>
        service.exportAssessments('2024-01-01', undefined, res as any),
      );

      const call = prisma.assessment.findMany.mock.calls[0][0];
      expect(call.where.createdAt.gte).toEqual(new Date('2024-01-01'));
      expect(call.where.createdAt.lte).toBeUndefined();
    });

    it('should create workbook with correct Assessments worksheet columns', async () => {
      prisma.assessment.findMany.mockResolvedValue([]);

      const workbook = await captureWorkbook((res) =>
        service.exportAssessments(undefined, undefined, res as any),
      );

      const sheet = workbook.getWorksheet('Assessments');
      expect(sheet).toBeDefined();

      const headers = sheet!.getRow(1).values as string[];
      expect(headers).toContain('ID');
      expect(headers).toContain('Customer');
      expect(headers).toContain('Phone');
      expect(headers).toContain('Product Model');
      expect(headers).toContain('Category');
      expect(headers).toContain('Status');
      expect(headers).toContain('Final Price');
      expect(headers).toContain('Date');
    });

    it('should write assessment rows to worksheet', async () => {
      prisma.assessment.findMany.mockResolvedValue(mockAssessments);

      const workbook = await captureWorkbook((res) =>
        service.exportAssessments(undefined, undefined, res as any),
      );

      const sheet = workbook.getWorksheet('Assessments')!;
      expect(sheet.rowCount).toBe(3);

      // Columns: 1=ID, 2=Customer, 3=Phone, 4=Product Model, 5=Category, 6=Status, 7=Final Price, 8=Date
      const row2 = sheet.getRow(2);
      expect(row2.getCell(1).value).toBe('assess-1');
      expect(row2.getCell(2).value).toBe('John Doe');
      expect(row2.getCell(3).value).toBe('0812345678');
      expect(row2.getCell(4).value).toBe('MacBook Pro 14"');
      expect(row2.getCell(7).value).toBe(450);

      const row3 = sheet.getRow(3);
      expect(row3.getCell(1).value).toBe('assess-2');
      expect(row3.getCell(7).value).toBeNull();
    });

    it('should handle empty assessment list', async () => {
      prisma.assessment.findMany.mockResolvedValue([]);

      const workbook = await captureWorkbook((res) =>
        service.exportAssessments(undefined, undefined, res as any),
      );

      const sheet = workbook.getWorksheet('Assessments')!;
      expect(sheet.rowCount).toBe(1); // header only
    });
  });
});
