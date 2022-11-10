import * as Ammo from 'ammo.js';

export let ammoModule: any;
export const ammoReadyPromise = new Promise(resolve => {
  new Ammo().then((res: any) => {
    ammoModule = res;
    resolve(res);
  });
});
