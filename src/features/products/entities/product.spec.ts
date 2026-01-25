import { Products } from './product.entity';

describe('Products', () => {
  it('should be defined', () => {
    expect(new Products()).toBeDefined();
  });
});
