import { MpdtransfersModule } from './mpdtransfers.module';

describe('MpdtransfersModule', () => {
  let mpdtransfersModule: MpdtransfersModule;

  beforeEach(() => {
    mpdtransfersModule = new MpdtransfersModule();
  });

  it('should create an instance', () => {
    expect(mpdtransfersModule).toBeTruthy();
  });
});
