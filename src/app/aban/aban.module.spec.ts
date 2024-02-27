import { AbanModule } from './aban.module';

describe('AbanModule', () => {
  let abanModule: AbanModule;

  beforeEach(() => {
    abanModule = new AbanModule();
  });

  it('should create an instance', () => {
    expect(abanModule).toBeTruthy();
  });
});
