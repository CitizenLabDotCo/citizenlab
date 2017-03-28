const Api = {};

Api.createUser = (values) => (
  // TODO: remove hardcoded address
  fetch('http://localhost:4000/api/v1/users', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ user: values }),
  })
  .then((response) => Promise.all([response, response.json()]))
  .then((result) => {
    const response = result[0];
    const json = result[1];

    if (response.ok) {
      return json;
    }

    const error = new Error(response.statusText);
    error.json = json;
    throw error;
  })
);

export default Api;
