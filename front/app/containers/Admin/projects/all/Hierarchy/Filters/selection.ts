import { FacetOption } from './useFacetOptions';

// An option is picked when a value it stands for is in the URL; unticking it
// takes out all of them.
export const isPicked = (option: FacetOption, selected: readonly string[]) =>
  option.values.some((value) => selected.includes(value));

export const togglePicked = (
  option: FacetOption,
  selected: readonly string[]
) =>
  isPicked(option, selected)
    ? selected.filter((value) => !option.values.includes(value))
    : [...selected, ...option.values];

export const pickedOptions = (
  options: FacetOption[],
  selected: readonly string[]
) => options.filter((option) => isPicked(option, selected));
