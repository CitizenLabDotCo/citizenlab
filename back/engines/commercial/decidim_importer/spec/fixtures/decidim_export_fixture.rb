# frozen_string_literal: true

require 'tmpdir'

module DecidimImporter
  # Shared accessor for the checked-in Decidim export zip fixture. Extracts the zip into a tempdir
  # once per process and exposes (a) the zip path and (b) the directory containing the CSV files,
  # so specs can drive both the `from_zip` path and the lower-level CSV-reading code.
  module DecidimExportFixture
    ZIP_PATH = File.expand_path('example.com.zip', __dir__).freeze

    module_function

    def zip_path
      ZIP_PATH
    end

    def csv_root
      @csv_root ||= begin
        dir = Dir.mktmpdir('decidim_export_fixture_')
        at_exit { FileUtils.remove_entry(dir) rescue nil } # rubocop:disable Style/RescueModifier
        ZipExtractor.extract(ZIP_PATH, dir)
        ZipExtractor.detect_csv_root(dir)
      end
    end
  end
end
