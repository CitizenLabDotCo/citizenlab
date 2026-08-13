# frozen_string_literal: true

require 'zip'
require 'fileutils'

module DecidimImporter
  # Unzips a Decidim CSV export. Decidim wraps everything in a single `<host>--<timestamp>/` directory
  # holding the per-model CSVs, so after extraction we look one level down for the directory with the
  # CSVs.
  module ZipExtractor
    module_function

    # Bundles `files` into a new zip at `zip_path`, each stored by basename (a flat archive that
    # {.extract} unpacks straight back into a directory). Replaces any existing file at `zip_path`.
    def compress(files, zip_path)
      FileUtils.rm_f(zip_path)
      Zip::File.open(zip_path, create: true) do |zip|
        files.each { |file| zip.add(File.basename(file), file) }
      end
      zip_path
    end

    # Extracts every non-metadata entry from `zip_path` into `dest`.
    def extract(zip_path, dest)
      dest_root = File.expand_path(dest)
      Zip::File.open(zip_path) do |zip|
        zip.each do |entry|
          next if skip?(entry.name)

          out = File.expand_path(File.join(dest_root, entry.name))
          # Zip Slip guard: a crafted `../…` or absolute entry name must not resolve outside `dest`.
          next unless out == dest_root || out.start_with?("#{dest_root}#{File::SEPARATOR}")

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
