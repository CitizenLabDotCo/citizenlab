import { IDestination, TCategory } from './destinations';

// the format in which the user will make its choices,
export type IPreferences = Partial<Record<TCategory, boolean>>;

// the format in which we'll present the destinations to the user
export type CategorizedDestinations = Record<TCategory, IDestination[]>;
