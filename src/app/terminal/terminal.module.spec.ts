import { TerminalModule } from './terminal.module';

describe('TerminalModule', () => {
  let terminalModule: TerminalModule;

  beforeEach(() => {
    terminalModule = new TerminalModule();
  });

  it('should create an instance', () => {
    expect(terminalModule).toBeTruthy();
  });
});
