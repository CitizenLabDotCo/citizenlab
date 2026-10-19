/**
 * Pin the timezone for the whole test run.
 *
 * Date behaviour depends on the process timezone, so without this a suite can
 * pass on a developer's machine and fail in CI purely because one is in
 * Europe/Brussels and the other in UTC. That is not hypothetical: the date
 * formatting characterization snapshots were recorded locally and broke on CI
 * for exactly this reason.
 *
 * UTC is chosen because it is what CI already ran, so pinning it makes local
 * runs match CI rather than the other way round. Tests that care about a
 * specific zone should pass it explicitly rather than rely on the ambient one.
 */
module.exports = () => {
  process.env.TZ = 'UTC';
};
