const sanitizeFormData = (data: Record<string, any>) => {
  const sanitizedFormData = {};

  for (const key in data) {
    const value = data[key];

    sanitizedFormData[key] =
      value === null || value === '' || value === false ? undefined : value;
  }

  return sanitizedFormData;
};

export default sanitizeFormData;
