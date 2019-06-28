import { reportError } from 'utils/loggingUtils';

export async function loadFonts() {
  try {
    const fontModules = await Promise.all([
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-thin.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-thin.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-thinitalic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-thinitalic.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-light.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-light.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-lightitalic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-lightitalic.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-italic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-italic.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-medium.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-medium.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-mediumitalic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-mediumitalic.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-bold.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-bold.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-bolditalic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-bolditalic.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-extrabold.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-extrabold.woff2'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-extrabolditalic.woff'
      ),
      import(
        /* webpackPreload: true */ 'assets/fonts/larsseit-extrabolditalic.woff2'
      )
    ]);

    return fontModules;
  } catch (error) {
    reportError(error);
    throw error;
  }
}
