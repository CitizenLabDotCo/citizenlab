# frozen_string_literal: true

# Re-derives the slug of every sluggable record of a single tenant from its
# title_multiloc in a given locale.
#
# Intended for manual use on freshly cloned tenants used as demo platforms - NOT
# on live tenants, where re-slugging would break existing inbound URLs. For that
# reason, execute mode only runs on demo platforms (lifecycle_stage = 'demo') or in
# local development; a dry run is allowed everywhere.
#
# What it does:
#   - Targets one tenant, identified by the `host` argument.
#   - Processes projects, static pages, project folders, groups and ideas, setting
#     each slug to the slugified `title_multiloc[locale]`.
#   - Skips ideas whose slug is not derived from title_multiloc (only Ideation,
#     Proposals and Voting ideas are - Native Survey and others are left untouched).
#   - Skips a record when it has no title in the target locale, or when its slug
#     already matches the translated title.
#   - Skips a custom static page when its translated slug would collide with a
#     value in StaticPage::RESERVED_SLUGS (which the model would otherwise reject).
#   - Writes a JSON report (translate_slugs.json) of the before/after slugs.
#
# What it does NOT do:
#   - It does not translate title_multiloc - it only re-derives the slug from an
#     already-translated title.
#   - It does not touch user slugs (those derive from the user's name).
#   - It does not change anything in dry-run mode (the default).
#   - It does not run across multiple tenants - one `host` per invocation.
#
# Example commands (run from the repo root):
#   Dry run (no changes applied, just reports what would happen):
#     docker compose run --rm web bundle exec rake 'demos:translate_slugs[example.com,fr-BE]'
#
#   Execute (applies the changes):
#     docker compose run --rm web bundle exec rake 'demos:translate_slugs[example.com,fr-BE,execute]'

namespace :demos do
  desc 'Translate slugs to given locale'
  task :translate_slugs, %i[host locale execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    host = args[:host]
    locale = args[:locale]
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Translate slugs to '#{locale}' ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    if host.blank? || locale.blank?
      puts 'ERROR! Both host and locale arguments are required. Usage: rake demos:translate_slugs[example.com,fr-BE,execute]'
      next
    end

    tenant = Tenant.find_by(host: host)
    if tenant.nil?
      puts "ERROR! No tenant found for host '#{host}'. Aborting."
      next
    end

    # Re-deriving slugs would break existing inbound URLs on a live tenant, so applying
    # changes is only allowed on demo platforms (lifecycle_stage = 'demo') or in local
    # development. A dry run stays available everywhere.
    lifecycle_stage = tenant.switch { AppConfiguration.instance.settings('core', 'lifecycle_stage') }
    if execute && lifecycle_stage != 'demo' && !Rails.env.development?
      puts "ERROR! Execute mode is only allowed on demo platforms (lifecycle_stage = 'demo') or in development (current: '#{lifecycle_stage}'). Run without 'execute' to do a dry run."
      next
    end

    reporter = ScriptReporter.new
    reporter.add_processed_tenant(tenant)

    tenant.switch do
      # First, find all database tables that have both a 'slug' and a 'title_multiloc'
      # column - the slug is re-derived from title_multiloc, so a table without
      # title_multiloc has nothing to translate from. This naturally excludes 'users':
      # user slugs derive from the user's name (no title_multiloc), which is never translated.
      tables_with_slug = ActiveRecord::Base.connection.tables.select do |table|
        ActiveRecord::Base.connection.column_exists?(table, :slug) &&
          ActiveRecord::Base.connection.column_exists?(table, :title_multiloc)
      end

      # Map each table to its model class.
      Rails.application.eager_load!
      models_with_slug = tables_with_slug.filter_map do |table|
        ApplicationRecord.descendants.find { |model| model.table_name == table && model.base_class == model }
      end

      # Whether a record's slug is derived from title_multiloc (and so can be translated).
      # Only ideas can differ: their slug comes from the participation method's
      # #generate_slug, and only ParticipationMethod::Ideation (incl. its Proposals/Voting
      # subclasses) derives it from title_multiloc. Checking the method owner rather than
      # the class stays correct if a subclass overrides #generate_slug.
      slug_from_title_multiloc = lambda do |record|
        return true unless record.is_a?(Idea)

        participation_method = record.participation_method_on_creation
        participation_method && participation_method.method(:generate_slug).owner == ParticipationMethod::Ideation
      end

      total_inspected = 0
      total_not_title_derived = 0
      total_unchanged = 0
      total_updated = 0
      total_errors = 0
      total_reserved_slug_collisions = 0
      no_title_records = []

      # Iterate every sluggable record and re-derive its slug from title_multiloc[locale],
      # skipping records whose slug is not derived from title_multiloc.
      models_with_slug.each do |model|
        puts "\n=== #{model.name} (#{model.table_name}) ==="
        model.find_each do |record|
          total_inspected += 1

          unless slug_from_title_multiloc.call(record)
            total_not_title_derived += 1
            next
          end

          title = record&.title_multiloc&.[](locale)
          if title.blank?
            no_title_records << "#{model.name} #{record.id}"
            puts "SKIPPED: No #{locale} title_multiloc for #{model.name} #{record.id} to create translated slug from."
            next
          end

          # SlugService#generate_slug treats *any* record sharing the slug as a collision,
          # including the record itself — so re-slugging to the same value would bump it to
          # '-1'. Skip when the slugified title already matches the current slug.
          if SlugService.new.slugify(title) == record.slug
            total_unchanged += 1
            puts "UNCHANGED: #{model.name} #{record.id} slug already '#{record.slug}'."
            next
          end

          old_slug = record.slug
          new_slug = SlugService.new.generate_slug(record, title)

          # A custom StaticPage can't be saved with a slug from RESERVED_SLUGS (validate_slug
          # in StaticPage). Skip those explicitly rather than letting update! raise.
          if record.is_a?(StaticPage) && record.custom? && StaticPage::RESERVED_SLUGS.include?(new_slug)
            total_reserved_slug_collisions += 1
            puts "SKIPPED: #{model.name} #{record.id} - translated slug '#{new_slug}' is reserved."
            next
          end

          context = { tenant: host, locale: locale, model: model.name, id: record.id }

          # Record the before/after slug for the JSON report. Done in both modes, so a dry
          # run also produces a full report of the changes that would be applied.
          reporter.add_change(
            { slug: old_slug, title_multiloc: record.title_multiloc },
            { slug: new_slug, title_multiloc: record.title_multiloc },
            context: context
          )

          if execute
            begin
              record.update!(slug: new_slug)
              total_updated += 1
              puts "UPDATED slug for #{model.name} #{record.id} - from '#{old_slug}', to '#{new_slug}'."
            rescue StandardError => e
              total_errors += 1
              reporter.add_error(e.message, context: context)
              puts "  ERROR! Failed to update #{model.name} #{record.id}: #{e.message}"
            end
          else
            total_updated += 1
            puts "WOULD UPDATE slug for #{model.name} #{record.id} - from '#{old_slug}', to '#{new_slug}'."
          end
        end
      end

      summary = {
        'Records inspected' => total_inspected,
        (execute ? 'Slugs updated' : 'Slugs to be updated') => total_updated,
        'Skipped (slug not title-derived)' => total_not_title_derived,
        "Skipped (no '#{locale}' title)" => no_title_records.size,
        'Skipped (slug would be reserved)' => total_reserved_slug_collisions,
        'Unchanged (slug already correct)' => total_unchanged
      }
      summary['Errors'] = total_errors if execute

      label_width = summary.keys.map(&:length).max
      puts "\nSummary for tenant #{host} (target locale '#{locale}'):"
      summary.each { |label, count| puts "  #{"#{label}:".ljust(label_width + 1)}  #{count}" }

      # List the records that could not be translated because they have no title in the
      # target locale - so they can be checked or translated manually.
      if no_title_records.any?
        puts "\n#{no_title_records.size} records skipped because no '#{locale}' title_multiloc to derive a slug from:"
        no_title_records.each { |record_ref| puts "  #{record_ref}" }
      end
    end

    begin
      reporter.report!('translate_slugs.json', verbose: false)
      puts "\nReport written to translate_slugs.json"
    rescue StandardError => e
      puts "ERROR! Failed to write report: #{e.message}"
    end

    puts "\n---------- FINISHED TASK: Translate slugs to '#{locale}' ----------\n\n"
  end
end
