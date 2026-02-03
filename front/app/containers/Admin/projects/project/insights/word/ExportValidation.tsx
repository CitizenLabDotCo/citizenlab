import { useEffect } from 'react';

import { INSIGHT_EXPORT_REGISTRY } from './exportRegistry';
import { useWordExportContext } from './WordExportContext';

/**
 * Development-only component that logs warnings when expected
 * exportable components are missing from the DOM.
 *
 * This helps developers identify when they've forgotten to wrap
 * a component with ExportableInsight or when a component is not
 * rendering as expected.
 */
const ExportValidation = () => {
  const { getMissingComponents } = useWordExportContext();

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;

    // Check after a delay to allow components to mount
    const timer = setTimeout(() => {
      const missing = getMissingComponents();
      if (missing.length > 0) {
        const missingDetails = missing.map((id) => {
          const config = INSIGHT_EXPORT_REGISTRY[id];
          return `  - ${id} (${config.displayName || 'Unknown'})`;
        });

        console.warn(
          `[Word Export] Missing exportable components:\n${missingDetails.join(
            '\n'
          )}\n\n` +
            `Ensure these components are wrapped with <ExportableInsight exportId="..."> ` +
            `or check if they should be rendered for this participation method.`
        );
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [getMissingComponents]);

  return null;
};

export default ExportValidation;
