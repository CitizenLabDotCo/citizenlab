const CODE = "code_acb123";
const SCOPE = "some scope stuff";

function onSubmit() {
  const params = new URLSearchParams(window.location.search);
  const redirect_uri = params.get("redirect_uri");
  const state = params.get("state");

  window.location.href = `${redirect_uri}?state=${state}&code=${CODE}&scope=${SCOPE}&authuser=0&prompt=none`;
}
