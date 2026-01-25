import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { BrandMiddleware } from '../src/middlewares/brand.middleware';

describe('SaleInvoice (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // apply BrandMiddleware used in production (sets req.brand from x-brand header)
    app.use(new BrandMiddleware().use);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates hydroworx invoice with taxes zeroed', async () => {
    const invoiceNumber = `E2E-${Date.now()}`;
    const payload = {
      computerNumber: 'CN-E2E-001',
      invoiceDate: new Date().toISOString(),
      account: 'acct-e2e',
      accountTitle: 'E2E Customer',
      saleAccount: 'sale-e2e',
      saleAccountTitle: 'Sale E2E',
      products: [
        {
          code: 1,
          productName: 'E2E Product',
          hsCode: '0000',
          quantity: 2,
          rate: 100,
          netAmount: 200,
          gstPercent: 18,
          exGstRate: 36,
          exGstAmount: 36,
        },
      ],
      invoiceNumber,
    };

    const res = await request(app.getHttpServer())
      .post('/sale-invoice')
      .set('x-brand', 'hydroworx')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('invoiceNumber', invoiceNumber);
    expect(Array.isArray(res.body.products)).toBeTruthy();
    expect(res.body.products[0].gstPercent).toBe(0);
    expect(res.body.products[0].netAmount).toBe(200);
  });
});