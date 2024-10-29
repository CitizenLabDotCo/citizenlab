import validate from './validate';

export type SubmitStateType = 'disabled' | 'enabled' | 'error' | 'success';

export type ValidationErrors = Partial<ReturnType<typeof validate>['errors']>;
