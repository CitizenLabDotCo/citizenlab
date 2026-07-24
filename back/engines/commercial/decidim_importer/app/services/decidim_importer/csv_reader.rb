# frozen_string_literal: true

require 'csv'

module DecidimImporter
  # Parses a Decidim CSV export file into an array of `{ header => value }` hashes — the same
  # shape the extractors consume. Decidim emits standard RFC4180 CSV with JSON-encoded multiloc and
  # nested-attribute cells, so the stdlib reader is enough.
  module CsvReader
    module_function

    # @param path [String, Pathname]
    # @return [Array<Hash>]
    def read(path)
      CSV.parse(File.read(path), headers: true).map(&:to_h)
    end
  end
end
