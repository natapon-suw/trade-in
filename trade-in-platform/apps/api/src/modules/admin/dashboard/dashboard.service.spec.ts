import { AssessmentStatus, StockStatus } from '@prisma/client';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    assessment: { count: jest.Mock; findMany: jest.Mock };
    stockItem: { count: jest.Mock; aggregate: jest.Mock };
  };

  const mockRecentAssessments = [
    {
      id: 'assess-1',
      status: AssessmentStatus.PRICED,
      createdAt: new Date('2024-06-15T10:00:00Z'),
      customer: { name: 'John Doe' },
      productModel: { name: 'MacBook Pro 14"' },
    },
    {
      id: 'assess-2',
      status: AssessmentStatus.STOCKED,
      createdAt: new Date('2024-06-15T09:00:00Z'),
      customer: { name: 'Jane Smith' },
      productModel: { name: 'ThinkPad X1' },
    },
  ];

  beforeEach(() => {
    prisma = {
      assessment: { count: jest.fn(), findMany: jest.fn() },
      stockItem: { count: jest.fn(), aggregate: jest.fn() },
    };
    service = new DashboardService(prisma as any);
  });

  describe('getMetrics', () => {
    it('should return correct metrics structure', async () => {
      prisma.assessment.count.mockResolvedValue(5);
      prisma.stockItem.count.mockResolvedValue(42);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: 25000 } });
      prisma.assessment.findMany.mockResolvedValue(mockRecentAssessments);

      const result = await service.getMetrics();

      expect(result).toEqual({
        assessedToday: 5,
        totalStock: 42,
        stockValue: 25000,
        recentActivity: [
          {
            id: 'assess-1',
            customerName: 'John Doe',
            productModelName: 'MacBook Pro 14"',
            status: AssessmentStatus.PRICED,
            createdAt: new Date('2024-06-15T10:00:00Z'),
          },
          {
            id: 'assess-2',
            customerName: 'Jane Smith',
            productModelName: 'ThinkPad X1',
            status: AssessmentStatus.STOCKED,
            createdAt: new Date('2024-06-15T09:00:00Z'),
          },
        ],
      });
    });

    it('should count assessments created today by default', async () => {
      prisma.assessment.count.mockResolvedValue(3);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue([]);

      await service.getMetrics();

      const countCall = prisma.assessment.count.mock.calls[0][0];
      const { gte, lte } = countCall.where.createdAt;

      // Should be start and end of today
      expect(gte.getHours()).toBe(0);
      expect(gte.getMinutes()).toBe(0);
      expect(gte.getSeconds()).toBe(0);
      expect(lte.getHours()).toBe(23);
      expect(lte.getMinutes()).toBe(59);
      expect(lte.getSeconds()).toBe(59);
    });

    it('should use custom date range when dateFrom and dateTo provided', async () => {
      prisma.assessment.count.mockResolvedValue(10);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue([]);

      await service.getMetrics('2024-01-01', '2024-06-30');

      expect(prisma.assessment.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-06-30'),
          },
        },
      });
    });

    it('should count only AVAILABLE stock items for totalStock', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(15);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: 5000 } });
      prisma.assessment.findMany.mockResolvedValue([]);

      await service.getMetrics();

      expect(prisma.stockItem.count).toHaveBeenCalledWith({
        where: { status: StockStatus.AVAILABLE },
      });
    });

    it('should aggregate price for AVAILABLE stock items', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: 75000 } });
      prisma.assessment.findMany.mockResolvedValue([]);

      const result = await service.getMetrics();

      expect(prisma.stockItem.aggregate).toHaveBeenCalledWith({
        _sum: { price: true },
        where: { status: StockStatus.AVAILABLE },
      });
      expect(result.stockValue).toBe(75000);
    });

    it('should return stockValue as 0 when no AVAILABLE stock exists', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue([]);

      const result = await service.getMetrics();

      expect(result.stockValue).toBe(0);
    });

    it('should return last 10 assessments as recentActivity', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue(mockRecentAssessments);

      await service.getMetrics();

      expect(prisma.assessment.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          productModel: { select: { name: true } },
        },
      });
    });

    it('should map recentActivity with customer and product model names', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue([mockRecentAssessments[0]]);

      const result = await service.getMetrics();

      expect(result.recentActivity).toHaveLength(1);
      expect(result.recentActivity[0]).toEqual({
        id: 'assess-1',
        customerName: 'John Doe',
        productModelName: 'MacBook Pro 14"',
        status: AssessmentStatus.PRICED,
        createdAt: new Date('2024-06-15T10:00:00Z'),
      });
    });

    it('should return empty recentActivity when no assessments exist', async () => {
      prisma.assessment.count.mockResolvedValue(0);
      prisma.stockItem.count.mockResolvedValue(0);
      prisma.stockItem.aggregate.mockResolvedValue({ _sum: { price: null } });
      prisma.assessment.findMany.mockResolvedValue([]);

      const result = await service.getMetrics();

      expect(result.recentActivity).toEqual([]);
    });
  });
});
