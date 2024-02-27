import { DevicePromptModule } from './device-prompt.module';

describe('DevicePromptModule', () => {
  let devicePromptModule: DevicePromptModule;

  beforeEach(() => {
    devicePromptModule = new DevicePromptModule();
  });

  it('should create an instance', () => {
    expect(devicePromptModule).toBeTruthy();
  });
});
