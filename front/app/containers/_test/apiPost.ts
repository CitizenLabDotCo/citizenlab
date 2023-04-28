const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

// const jsonErrors = {
//   errors: {
//     first_name: [
//       { error: 'slug_taken' }
//     ]
//   }
// }

export default async function apiPost(_args: any) {
  await sleep(2000);

  // const e = new Error('Test error');
  // e['json'] = jsonErrors;
  // throw e;

  throw new Error('bla');
}
