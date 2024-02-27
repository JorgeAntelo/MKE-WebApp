import { Global } from "../app/shared/global";

const versionFilePath = Global.WebUrl + 'version.json';
export const environment = {
  production: true,
  versionCheckUrl: versionFilePath,
  version: '0.0.314'
};
