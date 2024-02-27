import { ScrapModule } from './scrap.module';

describe('ScrapModule', () => {
  let scrapModule: ScrapModule;

  beforeEach(() => {
    scrapModule = new ScrapModule();
  });

  it('should create an instance', () => {
    expect(scrapModule).toBeTruthy();
  });
});
