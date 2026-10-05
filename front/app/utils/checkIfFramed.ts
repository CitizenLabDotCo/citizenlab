// True when the page runs inside a frame, such as an admin preview. A cross-origin parent
// throws on access, which also means framed.
const checkIfFramed = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export default checkIfFramed;
