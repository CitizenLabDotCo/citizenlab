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

## Getting Started

### Prerequisites

- Node.js
- Backend must be running (default: localhost:4000)

### Installation

```bash
cd front
npm install
```

### Running the Development Server

**Standard development**:

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

#### Data Fetching

**REST (TanStack Query)**:

```typescript
import { useQuery } from '@tanstack/react-query';
import api from 'services/api';

const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: () => api.getData(),
});
```

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

```typesript
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

### Environment Variables

- Development: Set in shell or `.env` files
- Production: Injected during build
- Key variables:
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
- **Analytics**: `posthog-js`, `@segment/snippet`
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

- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org
- Vite docs: https://vitejs.dev
- Testing Library: https://testing-library.com
- Styled Components: https://styled-components.com
