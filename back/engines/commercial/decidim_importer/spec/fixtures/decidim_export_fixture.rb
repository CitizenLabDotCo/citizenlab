# frozen_string_literal: true

module DecidimImporter
  # Shared accessor for the checked-in Decidim export fixture — the unzipped CSV tree under
  # `spec/fixtures/decidim_export/`. Specs read individual CSVs from it and drive
  # `Importer.from_directory`. (Unzipping is not exercised; that's `ZipExtractor`'s concern.)
  module DecidimExportFixture
    CSV_ROOT = File.expand_path('decidim_export', __dir__).freeze

    module_function

    def csv_root
      CSV_ROOT
    end
  end
end
