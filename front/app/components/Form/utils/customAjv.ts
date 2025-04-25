import { createAjv } from '@jsonforms/core';

const customAjv = createAjv({
  useDefaults: 'empty',
  removeAdditional: true,
});
// The image key word is used for the image choice option
customAjv.addKeyword('image');

export default customAjv;
