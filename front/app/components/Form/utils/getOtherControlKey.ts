function getOtherControlKey(scope: string = ''): string | undefined {
  const regex = /^#\/properties\/(\w+)_other$/;
  const match = scope.match(regex);

  if (match) {
    return match[1];
  }

  return undefined;
}

export default getOtherControlKey;
