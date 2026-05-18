# frozen_string_literal: true

namespace :single_use do
  desc 'For a tenant using de-AT (and not de-DE), rename de-DE multiloc keys to de-AT in all content builder layouts.'
  task :replace_de_DE_content_builder_layout_multilocs_with_de_AT, %i[host execute] => [:environment] do |_t, args|
    host = args[:host]
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Replace de-DE content builder layout multilocs with de-AT ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    reporter = ScriptReporter.new

    if host.blank?
      puts 'ERROR! No host argument provided. Usage: rake single_use:replace_de_DE_content_builder_layout_multilocs_with_de_AT[example.com,execute]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    reporter.add_processed_tenant(tenant)

    tenant.switch do
      locales = AppConfiguration.instance.settings('core', 'locales') || []
      puts "Tenant: #{host} - locales in use: #{locales.inspect}\n\n"

      if locales.exclude?('de-AT')
        puts "NO-OP: Tenant #{host} does not have the 'de-AT' locale in use - nothing to do."
        next
      end

      if locales.include?('de-DE')
        puts "NO-OP: Tenant #{host} still has the 'de-DE' locale in use - nothing to do."
        next
      end

      layouts = ContentBuilder::Layout.all.to_a
      puts "Found #{layouts.size} content builder layout(s) to inspect.\n\n"

      total_replaced = 0
      total_skipped = 0
      changed_layouts = 0

      layouts.each do |layout|
        service = ReplaceDeDeMultilocsService.new
        before_craftjs_json = layout.craftjs_json.deep_dup
        after_craftjs_json = layout.craftjs_json.deep_dup
        service.process!(after_craftjs_json)

        next if service.replaced.zero? && service.skipped.zero?

        puts "Layout #{layout.id} (code: #{layout.code}, buildable: #{layout.content_buildable_type}##{layout.content_buildable_id})"

        service.skipped_paths.each do |path|
          puts "  SKIP: de-AT multiloc key already present at #{path} - leaving de-DE untouched"
        end
        service.replaced_paths.each do |path|
          puts "  #{execute ? 'REPLACED' : 'WOULD REPLACE'} de-DE -> de-AT at #{path}"
        end

        total_skipped += service.skipped

        next if service.replaced.zero?

        changed_layouts += 1
        total_replaced += service.replaced

        context = {
          tenant: host,
          layout_id: layout.id,
          code: layout.code,
          content_buildable_type: layout.content_buildable_type,
          content_buildable_id: layout.content_buildable_id,
          replaced: service.replaced,
          skipped: service.skipped
        }
        reporter.add_change(before_craftjs_json, after_craftjs_json, context: context)

        next unless execute

        begin
          layout.update!(craftjs_json: after_craftjs_json)
        rescue StandardError => e
          reporter.add_error(e.message, context: context)
          puts "  ERROR! Failed to update layout #{layout.id}: #{e.message}"
        end
      end

      puts "\nSummary for tenant #{host}:"
      puts "  Layouts inspected:                 #{layouts.size}"
      puts "  Layouts with de-DE multilocs:      #{changed_layouts}"
      puts "  de-DE multilocs #{execute ? 'replaced' : 'to be replaced'}:   #{total_replaced}"
      puts "  Multilocs skipped (de-AT present): #{total_skipped}"
    end

    begin
      reporter.report!('replace_de_DE_content_builder_layout_multilocs_with_de_AT.json', verbose: false)
      puts "\nReport written to replace_de_DE_content_builder_layout_multilocs_with_de_AT.json"
    rescue StandardError => e
      puts "ERROR! Failed to write report: #{e.message}"
    end

    puts "\n---------- FINISHED TASK: Replace de-DE content builder layout multilocs with de-AT ----------\n\n"
  end
end

# Recursively walks a craftjs_json structure and renames every `de-DE` multiloc
# key to `de-AT`, keeping a duplicate of the original value. A multiloc that
# already has a `de-AT` key is left untouched (the `de-DE` entry is kept as-is).
class ReplaceDeDeMultilocsService
  attr_reader :replaced, :skipped, :replaced_paths, :skipped_paths

  def initialize
    @replaced = 0
    @skipped = 0
    @replaced_paths = []
    @skipped_paths = []
  end

  # Mutates +craftjs_json+ in place.
  def process!(craftjs_json)
    walk(craftjs_json, 'craftjs_json')
  end

  private

  def walk(node, path)
    case node
    when Hash
      # Recurse first, then mutate, to avoid modifying the hash while iterating it.
      node.each { |key, value| walk(value, "#{path} > #{key}") }
      replace_de_de_key(node, path) if node.key?('de-DE')
    when Array
      node.each_with_index { |value, index| walk(value, "#{path}[#{index}]") }
    end
  end

  def replace_de_de_key(multiloc, path)
    if multiloc.key?('de-AT')
      @skipped += 1
      @skipped_paths << path
      return
    end

    multiloc['de-AT'] = multiloc['de-DE'].deep_dup
    multiloc.delete('de-DE')
    @replaced += 1
    @replaced_paths << path
  end
end
