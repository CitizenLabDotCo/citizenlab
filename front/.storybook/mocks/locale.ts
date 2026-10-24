// Storybook's stand-in for utils/locale: the shared test mock plus
// updateLocale, which the language selector imports. Picking a language in
// a story does nothing.
export * from '../../app/utils/__mocks__/locale';

export function updateLocale(..._args: unknown[]) {
  return undefined;
}
