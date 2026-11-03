# frozen_string_literal: true

module DecidimImporter
  # Normalises an arbitrary string (typically a Decidim slug lifted from a URL) into a value that
  # satisfies Go Vocal's `Sluggable::SLUG_REGEX`, mirroring `SlugService`'s transform
  # (`downcase.parameterize.tr('_', '-')`). Decidim slugs are *usually* already valid, so this is a
  # no-op for the common case; it only rescues the odd one that carries uppercase runs, accents or
  # double hyphens (e.g. `Assemblee--Citoyenne`), which `Sluggable` rejects with "slug is invalid".
  # Returns nil when nothing slug-worthy remains, so callers can fall back to the model's own
  # title-derived slug generation instead of forcing an invalid value through.
  module Slug
    module_function

    def sanitize(value)
      slug = value.to_s.downcase.parameterize.tr('_', '-')
      slug if Sluggable::SLUG_REGEX.match?(slug)
    end
  end
end
