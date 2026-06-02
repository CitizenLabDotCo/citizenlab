# frozen_string_literal: true

# Usage:
#   rake decidim_importer:run[tmp/import_files/example.com.zip,localhost,fr-FR]
#   rake decidim_importer:run[tmp/import_files/example.com.zip,localhost,fr-FR,false]   # skip image fetches
#   rake decidim_importer:dump_yaml[tmp/import_files/example.com.zip,localhost,fr-FR]
#
# `path` accepts either a Decidim export zip or an already-unzipped directory. The task switches
# into the tenant matching `host` and applies the import inside it. The 4th argument disables
# image fetching — use it when the export's `remote_*_url` values point at an unreachable host
# (e.g. the source Decidim's `http://localhost/...` blob redirects).
namespace :decidim_importer do
  desc 'Imports a Decidim CSV export (zip or unzipped dir) into the tenant matching `host`.'
  task :run, %i[path host primary_locale import_images] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    path = args.fetch(:path)
    import_images = args[:import_images].to_s.downcase != 'false'

    Rails.logger.info "Decidim import → tenant=#{tenant.host} path=#{path} import_images=#{import_images}"
    tenant.switch do
      importer = build_importer(path, primary_locale: args[:primary_locale] || 'fr-FR', import_images: import_images)
      created = importer.import
      created.each { |klass, ids| Rails.logger.info "  created #{ids.size} #{klass}" }
      importer.skipped_phases.each do |skipped|
        Rails.logger.warn "  skipped phase #{skipped[:uid]}: #{skipped[:reason]}"
      end
    end
    Rails.logger.info 'COMPLETE'
  end

  desc 'Builds the tenant-template YAML from a Decidim export and writes it next to the input (no import).'
  task :dump_yaml, %i[path host primary_locale] => [:environment] do |_t, args|
    tenant = Tenant.find_by!(host: args[:host] || 'localhost')
    path = args.fetch(:path)
    out_path = yaml_output_path(path)
    tenant.switch do
      yaml = build_importer(path, primary_locale: args[:primary_locale] || 'fr-FR').to_yaml
      File.write(out_path, yaml)
    end
    Rails.logger.info "Wrote #{out_path}"
  end

  # Picks the appropriate Importer factory based on whether `path` is a zip file or a directory.
  def build_importer(path, **opts)
    if File.directory?(path)
      DecidimImporter::Importer.from_directory(path, **opts)
    elsif File.file?(path)
      DecidimImporter::Importer.from_zip(path, **opts)
    else
      raise ArgumentError, "no such file or directory: #{path}"
    end
  end

  # Drops the input's extension and appends `.template.yml`, keeping the same parent directory.
  # `/tmp/example.zip` => `/tmp/example.template.yml`; a directory `/tmp/example` => same.
  def yaml_output_path(input_path)
    normalized = input_path.chomp('/')
    parent = File.dirname(normalized)
    base = File.basename(normalized, File.extname(normalized))
    File.join(parent, "#{base}.template.yml")
  end
end
