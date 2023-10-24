# Citizenlab Component Library

📖 Visit our [Storybook]([https://citizenlabdotco.github.io/cl2-component-library/])

## Useful Commands

- `npm run storybook` - start Storybook locally

## Useful Links

- [How to publish a new version of the package to NPM](https://www.notion.so/citizenlab/Component-library-ede2e7a1cd5641c9953c9f9bbcbd1b84#f7ec4121359f469aad948cf9b0d5cd7e)

## Using the library
- To use the library, you must wrap your application with a ThemeProvider from styled-components and provide it with a theme.

Example:
```js
// If using the DateInput component, also import the following from react-dates (must be before any other import):
import 'react-dates/initialize';

// Import the ThemeProvider and getTheme function
import { ThemeProvider } from "styled-components";
import { getTheme, Text } from "@citizenlab/cl2-component-library";

function App() {

  const theme = getTheme(null); // Retrieves the default theme

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Text>
          Text component from the cl2-component-library
        </Text>
      </ThemeProvider>
    </div>
  );
}

export default App;
}
```