# Go Vocal - Frontend Application

## Overview

React/TypeScript-based frontend for the Go Vocal digital democracy platform. Built with Vite, this application provides the user interface for community participation including idea submission, discussions, voting, surveys, and administrative functions.

## Tech Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.3.3
- **Build Tool**: Vite 5.4+
- **Styling**: Styled Components 5.3.9
- **State Management**:
  - TanStack Query 4.22 (REST/async state)
  - RxJS 7.x (reactive state, rarely used, moving away from it)
- **Routing**: React Router DOM 6.3
- **Form Handling**: React Hook Form 7.64 + Yup validation
- **Internationalization**: React Intl 7.0
- **Testing**: Jest 29.4 + React Testing Library 16.1
- **E2E Testing**: Cypress 13.14

## Project Structure

```
front/
├── app/
│   ├── component-library/      # Reusable component library
│   ├── components/             # Shared components
│   ├── containers/             # Feature containers/pages
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   └── modules/                # Feature modules
├── server/                     # Express servers (production, images)
├── cypress/                    # E2E tests
├── internals/                  # Build scripts and config
├── .storybook/                 # Storybook configuration
└── vite.config.ts             # Vite configuration
```

## Running

For initial bootstrap, see the [root `CLAUDE.md`](../CLAUDE.md). The backend must be running (default: `localhost:4000`) before the frontend will work.

**Standard development** (from `front/`):

```bash
npm start
```

**SSO development** (requires HTTPS):

```bash
npm run start:sso
npm run start:sso:claveunica
npm run start:sso:nemlogin
npm run start:sso:keycloak
# ... other SSO variants
```

### Building for Production

```bash
npm run build
```

Build output goes to `build/` directory.

## Development

### Code Structure Conventions

- **Components**: Organized by feature in `app/containers/` or shared in `app/components/`
- **Hooks**: Custom hooks in `app/hooks/`
- **API Services**: Service layer in `app/services/`
- **Types**: TypeScript interfaces and types co-located with components
- **Styling**: Styled Components with theme provider

### Key Libraries & Patterns

#### Data Fetching (TanStack Query)

API hooks live in `app/api/<resource>/`. Each resource folder follows a consistent layout:

- `keys.ts` — query key factory (`all`, `lists`, `list`, `items`, `item`) typed via `QueryKeys` from `utils/cl-react-query/types`
- `types.ts` — request/response types and a `Keys<typeof xxxKeys>` alias used by `useQuery` generics
- One file per hook: `useXxx.ts` for queries, `useAddXxx.ts` / `useUpdateXxx.ts` / `useDeleteXxx.ts` for mutations
- `__mocks__/` and `*.test.ts` colocated

**Queries** wrap `useQuery` and call `fetcher` from `utils/cl-react-query/fetcher` (do **not** import from `services/api`):

```typescript
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

const fetchIdea = ({ id }: { id?: string }) =>
  fetcher<IIdea>({ path: `/ideas/${id}`, action: 'get' });

const useIdeaById = (id?: string) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ id }),
    queryFn: () => fetchIdea({ id }),
    enabled: !!id,
  });
};
```

The four `useQuery` generics are always `<Response, CLErrors, Response, ResourceKeys>`. Use `enabled: !!id` to gate fetches on optional params.

**Mutations** wrap `useMutation` + `useQueryClient` and invalidate every related key factory in `onSuccess`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IIdeaAdd } from './types';

const addIdea = (requestBody: IIdeaAdd) =>
  fetcher<IIdea>({
    path: `/ideas`,
    action: 'post',
    body: { idea: requestBody },
  });

const useAddIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IIdeaAdd>({
    mutationFn: addIdea,
    onSuccess: (idea) => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      const projectId = idea.data.relationships?.project.data.id;
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: projectId }),
        });
      }
    },
  });
};
```

Conventions for mutations:

- Generics are `<Response, CLErrors, Variables>`. For updates, `Variables` is typically `{ id: string; requestBody: IXxxUpdate }`.
- Invalidate broadly but precisely: list keys for collections that may have changed, item keys for specific records, and any cross-resource keys whose data depends on this one (e.g. `projectsKeys`, `meKeys`, `analyticsKeys`).
- Prefer `key.lists()` / `key.items()` over `key.all()` when you only need to invalidate one operation type.
- Don't call `setQueryData` for create/update responses unless there's a measured reason — invalidation is the default.
- Consume mutations in components via `const { mutate } = useAddIdea()` and pass `{ onSuccess, onError }` at the call site for UI side effects (toasts, navigation, form errors).

#### Forms

Using React Hook Form + Yup validation:

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  field: yup.string().required(),
});

const { register, handleSubmit } = useForm({
  resolver: yupResolver(schema),
  defaultValues: {
    'fieldName'
  }
});
```

When defining `defaultValues` to `useForm`, it's not needed to add empty defaultValues, just omit them.

#### Internationalization

We use cl-intl insteal of react-intl. The interface is the same.

```typescript
import { FormattedMessage, useIntl } from 'cl-intl';
import messages from './messages';

// Component usage
<FormattedMessage {...messages.title} />;

// In code
const { formatMessage } = useIntl();
const text = formatMessage(messages.title);
```

The data often contains multiloc attributes, which we transform to a string with the `localize` method.

```typescript
import useLocalize from 'hooks/useLocalize';

// Component usage
const localize = useLocalize();
const title = localize(title_multiloc);
```

### Component Library

Reusable components are in `app/component-library/`.

**IMPORTANT**: Always prefer using component library components (Box, Text, Icon, Button, etc.) over creating styled components. Use component props for styling whenever possible:

- Use `Box` with props like `display`, `flexDirection`, `gap`, `p`, `m`, `background`, `border`, `borderRadius`, `boxShadow` instead of creating styled divs
- Use `Text` with props like `fontSize`, `fontWeight`, `color`, `lineHeight`, `fontStyle` instead of creating styled spans/paragraphs
- Only create styled components when the component library doesn't support the required styling (e.g., dynamic styles based on props that can't be computed inline)

### Styling

Theme-based styling with Styled Components:

```typescript
import styled from 'styled-components';

const Button = styled.button`
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.medium};
`;
```

For small customizations, we use a few components with styling props, most notably <Box>.
For border radius adjustments, we use the value as specified by `stylingConsts.borderRadius.`

## Code Quality & Maintainability

### TypeScript

Type everything as strictly as possible. The goal is to push as many bugs as possible into the type checker so they never reach runtime or review.

- Avoid `any`.
- Avoid `as` casts. They silently disable type checking. Prefer type guards (`if (typeof x === 'string')`, `if ('foo' in obj)`), `satisfies` for literal-shape validation, or fixing the upstream type. Reserve casts for cases where you genuinely know more than the compiler (e.g. parsed JSON at a trusted boundary) and add a comment explaining why.
- Don't use non-null assertions (`!`) to silence the compiler. If a value can be undefined, handle it; if it really cannot, narrow it with a guard so the type system knows.
- Model state with discriminated unions instead of multiple optional fields. `{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: E }` makes invalid combinations unrepresentable.
- Prefer `readonly` arrays/objects and literal types (`'a' | 'b'`) over wider types when the value is fixed.
- Always type `useState`, function parameters, and return types of exported functions explicitly when inference is not obviously correct. Don't rely on inference across module boundaries.

### useEffect

`useEffect` is for synchronizing with **external** systems (the DOM, subscriptions, timers, network side effects not already handled by TanStack Query). Most other uses are mistakes. Before adding one, ask: can this be derived in some other way.

Common mistakes to avoid:

- **Syncing props to local state.** `useEffect(() => setX(prop), [prop])` is almost always wrong — it causes an extra render, drops local edits unpredictably, and hides the real intent. Either use the prop directly, derive from it during render, or use a `key` to reset a child component when the identity changes.
- **Computing derived values.** `useEffect(() => setFullName(`${first} ${last}`), [first, last])` should just be `const fullName = `${first} ${last}``during render. Wrap in`useMemo` only if profiling shows it matters.
- **Reacting to user events.** Logic that should run because the user clicked something belongs in the click handler, not in an effect that watches the resulting state. Effects make the cause non-local and harder to trace.
- **Chaining effects to cascade state updates.** If effect A sets state that triggers effect B, collapse them — usually the data flow can be expressed in one place.
- **Fetching data.** That's what TanStack Query hooks (`app/api/<resource>/`) are for. Don't roll your own fetch-in-`useEffect`.

When you do need an effect, keep its dependency array honest (don't omit deps to "make it work") and include a cleanup function for anything subscribed, timed, or aborted.

## Testing

### Unit & Integration Tests

**Run all tests**:

```bash
npm test
```

#### Writing Tests

Tests use Jest + React Testing Library:

```typescript
import { render, screen } from 'utils/testUtils/rtl';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests (Cypress)

**Open Cypress UI**:

```bash
npm run cypress:open
```

**Run tests headlessly**:

```bash
npm run cypress:run
```

**Note**: Backend must have E2E test data loaded:

```bash
cd ..
make e2e-setup
```

## Code Quality

### Type Checking

Run the TypeScript type checker after all work is complete:

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint -- --fix
```

### Formatting

```bash
npm run prettier
```

### Dead Code Detection

```bash
npm run detect-deadcode
```

### Dependency Analysis

```bash
npm run dependency-cruiser
```

## Build Configuration

### Vite Configuration

Main config: `vite.config.ts`

Key features:

- TypeScript support
- Path aliases via `tsconfig-paths`
- Environment variable compatibility
- HTTPS for SSO development (via `vite-plugin-mkcert`)
- Type checking (`vite-plugin-checker`)
- Bundle analysis

### Environment Configuration

Environment variables are in `../env_files/`:

- `front-safe.env` - Safe to commit
- `front-secret.env` - Secrets (gitignored)

In production, variables are injected during build.

Key variables:

- `API_HOST`: Backend hostname
- `API_PORT`: Backend port
- `HTTPS_HOST`: HTTPS hostname for SSO

## Key Features & Modules

### Major Dependencies

- **Drag & Drop**: `@hello-pangea/dnd`, `react-dnd`
- **Maps**: `@arcgis/core` (ArcGIS)
- **Rich Text**: `quill` editor
- **Charts**: `recharts`
- **File Handling**: `react-dropzone`, `react-easy-crop`
- **Date Handling**: `date-fns`, `moment`, `react-day-picker`
- **PDF**: `react-pdf`
- **CSV Export**: `react-csv`, `papaparse`
- **Analytics**: `posthog-js`
- **Error Tracking**: `@sentry/react`
- **Animations**: `lottie-react`, `react-transition-group`

### Content Builder

Uses `@craftjs/core` for drag-and-drop page building.

## Internationalization

### Extracting Messages

```bash
npm run extract-intl
```

This extracts all `FormattedMessage` strings for translation.

### Finding Unused Messages

```bash
npm run find-unused-messages
```

### Updating translations

The translations JSON files in app/translations are managed externally through crowdin, and should never be updated manually. Instead, the `extract-intl` should be run in case of new entries in the messages.ts files. If text needs to change, the translation id needs to change, as corrections to the values in the messages.ts files (or translation json files) will either have no effect or be overwritten again. When 'bumping' a translation id, add a number at the end.

## CI/CD

CircleCI runs on each PR:

- Linting
- Type checking
- Unit tests
- E2E tests (on master)
- Bundle size checks

## Common Issues & Solutions

### Test Failures

### Build Memory Issues

Already configured with increased memory:

```bash
NODE_OPTIONS='--max-old-space-size=5120'
```

### SSO Development

Requires HTTPS. Use the `start:sso:*` scripts which configure HTTPS automatically.

### Type Errors

Check `tsconfig.json` paths and ensure all dependencies have proper types installed.

## IDE Setup

## Performance

### Code Splitting

Vite automatically handles code splitting. Use dynamic imports for route-based splitting:

```typescript
const Component = lazy(() => import('./Component'));
```

### Bundle Optimization

- Tree shaking enabled by default
- Check bundle size with `npm run visualize-bundle`
- Use `React.memo()` and `useMemo()` for expensive components

## Additional Scripts

- `npm run start:production` - Build and serve production build
- `npm run chromatic` - Visual regression testing (Storybook)

## Important Files

- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `jest.config.js` - Test configuration
- `cypress.config.ts` - E2E test configuration
- `.eslintrc.js` - Linting rules
- `tsconfig.json` - TypeScript configuration
- `.dependency-cruiser.js` - Dependency rules

## Contributing

- Follow existing code patterns
- Write tests for new features
- Run linter before committing
- Check bundle size impact for large dependencies

## Resources

- [`front/README.md`](./README.md) — frontend README
- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org
- Vite docs: https://vitejs.dev
- Testing Library: https://testing-library.com
- Styled Components: https://styled-components.com
