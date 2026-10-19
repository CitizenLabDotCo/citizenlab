// A letter as the search compares it: lower case, without accents, so "izmir"
// finds "İzmir" and "cafe" finds "Café". It can be longer or shorter than the
// letter itself.
const fold = (letter: string) =>
  letter.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Where a search appears in a title, as offsets into the title itself. The
// title is folded letter by letter, keeping where each folded character came
// from, so a letter whose folded form has another length doesn't shift the
// offsets after it.
export const findMatch = (text: string, term: string) => {
  const wanted = Array.from(term).map(fold).join('');
  if (!wanted) return undefined;

  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;

  for (const letter of text) {
    const foldedLetter = fold(letter);
    for (let i = 0; i < foldedLetter.length; i++) {
      starts.push(offset);
      ends.push(offset + letter.length);
    }
    folded += foldedLetter;
    offset += letter.length;
  }

  const at = folded.indexOf(wanted);
  if (at < 0) return undefined;

  return { start: starts[at], end: ends[at + wanted.length - 1] };
};
