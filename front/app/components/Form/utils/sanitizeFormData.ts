import { FormValues } from '../typings';

const sanitizeFormData = (data: FormValues) => {
  const sanitizedFormData = {};

  for (const key in data) {
    const value = data[key];

    sanitizedFormData[key] =
      value === null || value === '' || value === false ? undefined : value;
  }

  return sanitizedFormData;
};

export default sanitizeFormData;
