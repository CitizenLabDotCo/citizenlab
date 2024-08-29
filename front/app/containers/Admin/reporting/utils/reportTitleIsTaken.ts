export default function reportTitleIsTaken(error: any) {
  return error?.errors?.name?.[0]?.error === 'taken';
}
