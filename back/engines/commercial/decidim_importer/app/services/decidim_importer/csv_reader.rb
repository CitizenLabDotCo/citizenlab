# frozen_string_literal: true

require 'csv'

module DecidimImporter
  # Parses a Decidim CSV export into an array of `{ header => value }` hashes (what extractors consume).
  # Decidim emits standard RFC4180 CSV with JSON-encoded cells, so the stdlib reader suffices.
  module CsvReader
    module_function

    # @param path [String, Pathname]
    # @return [Array<Hash>]
    def read(path)
      CSV.parse(File.read(path), headers: true).map(&:to_h)
    end
  end
end
