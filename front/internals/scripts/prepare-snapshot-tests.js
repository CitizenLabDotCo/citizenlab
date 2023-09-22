const { globPromise, readFilePromise, writeFilePromise } = require('./helpers/promisify');

async function generateSnapshotTestMetadata(inputGlob, ignoreGlob) {
  const snapshotTestFiles = await globPromise(inputGlob, ignoreGlob);
  const snapshotTests = [];

  for (const fileName of snapshotTestFiles) {
    const file = await readFilePromise(fileName);
    snapshotTests.push(...(JSON.parse(file)))
  }

  return snapshotTests;
}

(async function main() {
  const snapshotTestMetadata = await generateSnapshotTestMetadata(
    'app/**/*.snapshots.json',
    ''
  );

  await writeFilePromise('.storybook/snapshots/snapshot-tests.json', JSON.stringify(snapshotTestMetadata));

  process.exit();
})();