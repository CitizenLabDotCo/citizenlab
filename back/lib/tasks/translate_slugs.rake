# frozen_string_literal: true

namespace :slugs do
  # In development
  desc 'Translate slugs to given locale'
  task :translate_slugs, %i[host locale execute] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    dev_null = Logger.new('/dev/null')
    Rails.logger = dev_null
    ActiveRecord::Base.logger = dev_null

    host = args[:host]
    locale = args[:locale]
    execute = args[:execute] == 'execute'

    tenant = Tenant.find_by(host: host)
    raise "No tenant found for host '#{host}'" if tenant.nil?

    tenant.switch do
      # First, find all database tables that have a 'slug' column.
      # Exclude 'users': user slugs derive from the user's name, which is never translated.
      tables_with_slug = ActiveRecord::Base.connection.tables.select do |table|
        ActiveRecord::Base.connection.column_exists?(table, :slug)
      end - %w[users]

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

      # Iterate every sluggable record and print its title_multiloc and current slug,
      # skipping records whose slug is not derived from title_multiloc.
      models_with_slug.each do |model|
        puts "\n=== #{model.name} (#{model.table_name}) ==="
        model.find_each do |record|
          next unless slug_from_title_multiloc.call(record)

          title = record&.title_multiloc&.[](locale)
          if title.blank?
            puts "SKIPPED: No #{locale} title_multiloc for #{model.name} #{record.id} to create translated slug from."
            next
          end

          # SlugService#generate_slug treats *any* record sharing the slug as a collision,
          # including the record itself — so re-slugging to the same value would bump it to
          # '-1'. Skip when the slugified title already matches the current slug.
          if SlugService.new.slugify(title) == record.slug
            puts "UNCHANGED: #{model.name} #{record.id} slug already '#{record.slug}'."
            next
          end

          new_slug = SlugService.new.generate_slug(record, title)
          if execute
            record.update!(slug: new_slug)
            puts "UPDATED slug for #{model.name} #{record.id} - to '#{new_slug}'."
          else
            puts "Would translate slug for #{model.name} #{record.id} - from '#{record.slug}', to '#{new_slug}'."
          end
        end
      end
    end
  end
end
