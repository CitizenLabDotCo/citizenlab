import useIdMethods from 'api/id_methods/useIdMethods';

// FranceConnect always gets its own block, separate from the other id methods
// (see useVisibleIdMethodsExceptFC).
const useFranceConnectEnabled = () => {
  const { data: idMethods } = useIdMethods();

  return !!idMethods?.data.find(
    (method) => method.attributes.name === 'franceconnect'
  );
};

export default useFranceConnectEnabled;
