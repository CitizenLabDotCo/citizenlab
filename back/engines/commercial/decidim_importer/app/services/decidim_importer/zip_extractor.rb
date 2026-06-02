# frozen_string_literal: true

require 'zip'
require 'fileutils'

module DecidimImporter
  # Unzips a Decidim CSV export. Decidim wraps everything in a single `<host>--<timestamp>/`
  # directory containing the per-model CSV files (plus a `participatory-processes/` subfolder), so
  # after extraction we look one level down for the directory that actually holds the CSVs.
  module ZipExtractor
    module_function

    # Extracts every non-metadata entry from `zip_path` into `dest`.
    def extract(zip_path, dest)
      Zip::File.open(zip_path) do |zip|
        zip.each do |entry|
          next if skip?(entry.name)

          out = File.join(dest, entry.name)
          FileUtils.mkdir_p(entry.directory? ? out : File.dirname(out))
          next if entry.directory?

          entry.extract(out) { true }
        end
      end
    end

    # Finds the directory directly containing the per-model CSVs. Falls back to `dir` if the export
    # was already flat.
    def detect_csv_root(dir)
      return dir if Dir.glob(File.join(dir, '*--users.csv')).any?

      Dir.glob(File.join(dir, '*'))
        .select { |path| File.directory?(path) && !skip?(File.basename(path)) }
        .find { |path| Dir.glob(File.join(path, '*--users.csv')).any? } || dir
    end

    def skip?(name)
      basename = File.basename(name)
      basename.start_with?('__MACOSX', '.')
    end
  end
end
