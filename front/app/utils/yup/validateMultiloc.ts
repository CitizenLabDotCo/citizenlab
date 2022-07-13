import { object, lazy, string } from 'yup';

const validateMultiloc = (message: string) =>
  lazy((obj) => {
    const keys = Object.keys(obj);

    return object(
      keys.reduce(
        (acc, curr) => ((acc[curr] = string().required(message)), acc),
        {}
      )
    );
  });

export default validateMultiloc;
