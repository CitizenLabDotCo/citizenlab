window.cl = console.log; // eslint-disable-line
window.cls = (m1, m2) => {
  if (m2) {
    console.log(JSON.stringify(m1), JSON.stringify(m2)); // eslint-disable-line
  } else {
    console.log(JSON.stringify(m1)); // eslint-disable-line
  }
};
