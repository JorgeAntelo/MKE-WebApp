import { VehicleInfoModule } from './vehicle-info.module';

describe('VehicleInfoModule', () => {
  let vehicleInfoModule: VehicleInfoModule;

  beforeEach(() => {
    vehicleInfoModule = new VehicleInfoModule();
  });

  it('should create an instance', () => {
    expect(vehicleInfoModule).toBeTruthy();
  });
});
