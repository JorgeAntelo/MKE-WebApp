import { TowModule } from './tow.module';

describe('TowModule', () => {
  let towModule: TowModule;

  beforeEach(() => {
    towModule = new TowModule();
  });

  it('should create an instance', () => {
    expect(towModule).toBeTruthy();
  });
});
