const CODE = "code_abc123";
const SCOPE = "some scope stuff";

function onSubmit() {
  const params = new URLSearchParams(window.location.search);

  const redirect_uri = params.get("redirect_uri");
  const state = params.get("state");

  const newParams = new URLSearchParams();
  newParams.append("state", state);
  newParams.append("code", CODE);
  newParams.append("scope", SCOPE);
  newParams.append("authuser", "0");
  newParams.append("prompt", "none");

  window.location.href = `${redirect_uri}?${newParams.toString()}`;
}
