# frozen_string_literal: true

module DecidimImporter
  # Applies a dumped tenant-template to the current tenant: app-config patch, then the deserialize +
  # post-import passes (idea statuses, image cleaning, voting counts, timestamps, permissions, pages).
  # The template is built separately by {TemplateCreator}.
  class Importer
    # Applies a dumped tenant-template YAML file to the current tenant, returning the deserializer's
    # created-ids hash. Project-moderator roles aren't applied here — they're driven by the sibling
    # `<base>.moderators.csv` and applied by {ModeratorAssigner} in the `import` rake task's finishing pass.
    #
    # Matchers that reuse an already-imported record (keyed by its stable Decidim identity) rather than
    # inserting a duplicate — enabled with `reuse_existing:` for a supplemental import into a tenant that
    # already holds an earlier import. Users match on `unique_code` (the Decidim uid; stable across
    # exports, unlike anonymised emails); process-group folders on the slug their title generates (the
    # only slugify — {Slug.sanitize}); user custom fields on `key`.
    REUSE_MATCHERS = {
      'User' => lambda { |attrs, klass|
        code = attrs['unique_code']
        klass.find_by(unique_code: code) if code.present?
      },
      'CustomField' => lambda { |attrs, klass|
        key = attrs['key']
        klass.find_by(key: key) if key.present?
      },
      'ProjectFolders::Folder' => lambda { |attrs, klass|
        slug = Slug.sanitize((attrs['title_multiloc'] || {}).values.find(&:present?))
        klass.find_by(slug: slug) if slug
      }
    }.freeze

    # @param import_uploads [Boolean] when false, every `remote_*_url` (images *and* file attachments) is
    #   stripped before deserialize — no external HTTP — e.g. for exports whose upload URLs are unreachable.
    # @param reuse_existing [Boolean] when true, reuse already-imported users/folders/custom-fields instead
    #   of duplicating them (a supplemental import into a tenant that already holds an earlier import).
    def self.apply_template_file(path, import_uploads: true, reuse_existing: false)
      # Parsing a large, anchor-heavy template is a silent single-threaded pause before the first DB
      # query — bracket it so the log shows progress rather than an apparent hang.
      Rails.logger.info "Loading template #{path} (#{File.size(path) / 1_048_576} MB)…"
      template = YAML.load_file(path, aliases: true)
      Rails.logger.info 'Template loaded, resolving idea statuses…'
      apply_template(template, import_uploads: import_uploads, reuse_existing: reuse_existing)
    end

    # Deserializes an in-memory template into the current tenant and runs the post-import passes. Shared
    # by {.apply_template_file} and {TemplateCreator#import}. Returns the deserializer's created-ids hash.
    def self.apply_template(template, import_uploads: true, validate: true, reuse_existing: false)
      IdeaStatuses.resolve!(template)
      resolve_area_orderings!(template)
      TemplateCleaner.prepare_uploads!(template, import_uploads: import_uploads)
      TemplateCleaner.prune_fileless_attachments!(template)
      TemplateCleaner.prune_imageless_project_images!(template)
      # Suppress `touch: true` callbacks during the bulk load so imported records keep their template dates.
      created = ActiveRecord::Base.no_touching do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(
          template, validate: validate, reuse_by: reuse_existing ? REUSE_MATCHERS : {}
        )
      end
      resolve_scope_areas!(template, created)
      recompute_voting_counts!(created)
      restore_update_timestamps(template, created)
      reconcile_permissions!
      provision_project_pages!(created)
      created
    end

    # Restores each created record's `updated_at` to its template date. `no_touching` stops `touch`
    # callbacks, but counter-cache `update_all`s (e.g. an idea's `comments_count`) bump it to import time
    # anyway; the template's records line up positionally with the per-model created ids, so we reset it.
    def self.restore_update_timestamps(template, created_object_ids)
      (template['models'] || {}).each do |model_name, records|
        klass = model_name.classify.safe_constantize
        next unless klass.respond_to?(:column_names) && klass.column_names.include?('updated_at')

        ids = created_object_ids[klass.name] || []
        next unless ids.size == records.size

        by_timestamp = Hash.new { |hash, key| hash[key] = [] }
        records.each_with_index do |attrs, i|
          timestamp = attrs['updated_at'].presence || attrs['created_at'].presence
          by_timestamp[timestamp] << ids[i] if timestamp
        end
        by_timestamp.each { |timestamp, group_ids| klass.where(id: group_ids).update_all(updated_at: timestamp) }
      end
    end

    # Resolves the scope→area pointer parked on each imported idea. {Extractors::IdeaAssociations#register_scope_area}
    # seeds `custom_field_values['decidim_scope']` with the (shared) attributes hash of the `Area` the
    # idea's Decidim scope became; here — now that the area is a real row — that hash is swapped for
    # `{ 'area_id' => <uuid>, 'title_multiloc' => … }`, giving the imported input a durable pointer back
    # to its area (ideas have no first-class area association). Idea/area template records line up
    # positionally with the deserializer's created ids (same trick as {.restore_update_timestamps}); a
    # size mismatch skips the pass rather than mislinking. Run in the target tenant.
    def self.resolve_scope_areas!(template, created_object_ids)
      ideas = template.dig('models', 'idea')
      areas = template.dig('models', 'area')
      return if ideas.blank? || areas.blank?

      idea_ids = created_object_ids['Idea'] || []
      area_ids = created_object_ids['Area'] || []
      return unless ideas.size == idea_ids.size && areas.size == area_ids.size

      area_id_by_attrs = {}.compare_by_identity
      areas.each_with_index { |attrs, i| area_id_by_attrs[attrs] = area_ids[i] }

      ideas.each_with_index do |attrs, i|
        area_attrs = attrs['custom_field_values']&.fetch('decidim_scope', nil)
        area_id = area_attrs.is_a?(Hash) && area_id_by_attrs[area_attrs]
        next unless area_id

        resolved = { 'area_id' => area_id, 'title_multiloc' => area_attrs['title_multiloc'] }
        values = attrs['custom_field_values'].merge('decidim_scope' => resolved)
        attrs['custom_field_values'] = values
        Idea.where(id: idea_ids[i]).update_all(custom_field_values: values)
      end
    end

    # Offsets each imported area's `ordering` past the tenant's existing areas (relative order kept).
    # `Area#ordering` is uniquely indexed and the deserializer doesn't reposition, so without this an
    # import into a tenant that already has areas — or a re-import — would collide. Run in the target tenant.
    def self.resolve_area_orderings!(template)
      areas = template.dig('models', 'area')
      return template if areas.blank?

      base = (::Area.maximum(:ordering) || -1) + 1
      areas.each { |attrs| attrs['ordering'] = base + attrs['ordering'] if attrs['ordering'] }
      template
    end

    # Backfills the `Permission` records the deserializer bypasses (it creates phases/projects directly,
    # skipping their SideFx) — e.g. a native-survey phase's nil `posting_permission` would 500 the admin. Idempotent.
    def self.reconcile_permissions!
      Permissions::PermissionsUpdateService.new.update_all_permissions
    end

    # (Re)builds the `project_page` layout — generated from `project_description` — for **this import's**
    # projects only, so pre-existing (e.g. demo) projects are left untouched. The SideFx that normally
    # creates the page is bypassed by the deserializer, so without this the page 404s. Any existing page is
    # dropped first and regenerated: `provision_for` skips a project that already has one, so a stale/broken
    # page from an earlier partial import would otherwise survive every re-import.
    def self.provision_project_pages!(created_object_ids)
      ids = created_object_ids['Project'] || []
      return if ids.empty?

      Project.where(id: ids).find_each do |project|
        ContentBuilder::Layout
          .where(content_buildable: project, code: ContentBuilder::ProjectPageLayoutService::CODE)
          .destroy_all
        ContentBuilder::DescriptionLayoutService.new.provision_for(project)
      end
    end

    # Recomputes each imported voting phase's basket/vote counters. `Basket`'s counts aren't a
    # counter_culture cache — `Basket.update_counts` recomputes them (submitted baskets only). Runs before
    # {.restore_update_timestamps} so its `update!` timestamp bumps get reset. Scoped to this import's phases.
    def self.recompute_voting_counts!(created_object_ids)
      ids = created_object_ids['Phase'] || []
      return if ids.empty?

      Phase.where(id: ids, participation_method: 'voting').find_each { |phase| Basket.update_counts(phase) }
    end

    # Applies the import's app-config patch (`<base>.app_config.json`) to the current tenant: additively
    # unions the export's locales into `core.locales` — *without* replacing the tenant's own set, so no
    # user is stranded and no `validate_locales` migration is needed — and allows+enables the feature flags
    # the import relies on (`project_static_pages`, `parallel_participation`), merged onto whatever the
    # tenant already has. Nothing else in the app config is touched. Run before the template deserializes,
    # so its records have the locales they reference. Returns the locales added (empty when none/no file).
    def self.apply_import_app_config_file(path)
      return [] unless path && File.file?(path)

      patch_settings = JSON.parse(File.read(path))['settings']
      return [] unless patch_settings.is_a?(Hash)

      config = AppConfiguration.instance
      settings = config.settings
      added = union_locales!(settings, patch_settings.dig('core', 'locales'))
      merge_feature_flags!(settings, patch_settings)
      config.settings = settings
      config.save!
      added
    end

    # Adds any locales in `incoming` the tenant doesn't already have (order preserved, never dropping the
    # tenant's own). Mutates `settings` in place; returns the locales added.
    def self.union_locales!(settings, incoming)
      return [] unless incoming.is_a?(Array)

      current = Array(settings.dig('core', 'locales'))
      added = incoming - current
      return [] if added.empty?

      settings['core'] ||= {}
      settings['core']['locales'] = current + added
      added
    end

    # Merges every feature flag in the patch (every non-`core` settings key) onto the tenant's, so the
    # import's `allowed`/`enabled` switches are turned on without disturbing the tenant's other config.
    def self.merge_feature_flags!(settings, patch_settings)
      patch_settings.each do |key, value|
        next if key == 'core' || !value.is_a?(Hash)

        settings[key] = (settings[key] || {}).merge(value)
      end
    end
  end
end
