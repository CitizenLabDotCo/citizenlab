# frozen_string_literal: true

module DecidimImporter
  # Applies a dumped tenant-template to the current tenant: app-config patch, then the deserialize +
  # post-import passes (idea statuses, image cleaning, voting counts, timestamps, permissions, pages).
  # The template is built separately by {TemplateCreator}.
  class Importer
    # Applies a dumped tenant-template YAML file to the current tenant, returning the deserializer's
    # created-ids hash. Moderator roles (`RoleAssigner`) aren't applied here — that needs the in-memory
    # ref map, so it only runs in {TemplateCreator#import}.
    #
    # @param import_uploads [Boolean] when false, every `remote_*_url` (images *and* file attachments) is
    #   stripped before deserialize — no external HTTP — e.g. for exports whose upload URLs are unreachable.
    def self.apply_template_file(path, import_uploads: true)
      # Parsing a large, anchor-heavy template is a silent single-threaded pause before the first DB
      # query — bracket it so the log shows progress rather than an apparent hang.
      Rails.logger.info "Loading template #{path} (#{File.size(path) / 1_048_576} MB)…"
      template = YAML.load_file(path, aliases: true)
      Rails.logger.info 'Template loaded, resolving idea statuses…'
      apply_template(template, import_uploads: import_uploads)
    end

    # Deserializes an in-memory template into the current tenant and runs the post-import passes. Shared
    # by {.apply_template_file} and {TemplateCreator#import}. Returns the deserializer's created-ids hash.
    def self.apply_template(template, import_uploads: true, validate: true)
      IdeaStatuses.resolve!(template)
      resolve_area_orderings!(template)
      TemplateCleaner.prepare_uploads!(template, import_uploads: import_uploads)
      TemplateCleaner.prune_fileless_attachments!(template)
      TemplateCleaner.prune_imageless_project_images!(template)
      # Suppress `touch: true` callbacks during the bulk load so imported records keep their template dates.
      created = ActiveRecord::Base.no_touching do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, validate: validate)
      end
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

    # Gives a default `project_page` layout to **this import's** projects that didn't get one from
    # {Extractors::DescriptionLayoutExtractor} (it only builds a page for projects with content), so
    # pre-existing (e.g. demo) projects are left untouched. The SideFx that normally creates the page is
    # bypassed by the deserializer, so without this those pages 404.
    def self.provision_project_pages!(created_object_ids)
      ids = created_object_ids['Project'] || []
      return if ids.empty?

      Project.where(id: ids).find_each do |project|
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

    # Additively unions the export's locales (from the app-config patch JSON) into the current tenant's
    # `core.locales`, so the template's multilocs have every locale they reference — *without* replacing
    # the tenant's own set (that's {.apply_app_config}'s job) and without touching branding/reply-to. Only
    # adds, so no user is stranded and no `validate_locales` migration is needed. Returns the locales added
    # (empty when the JSON is absent or adds nothing). Run before the template deserializes.
    def self.merge_app_config_locales_file(path)
      return [] unless path && File.file?(path)

      incoming = JSON.parse(File.read(path)).dig('settings', 'core', 'locales')
      return [] unless incoming.is_a?(Array)

      config = AppConfiguration.instance
      current = Array(config.settings('core', 'locales'))
      added = incoming - current
      return [] if added.empty?

      settings = config.settings
      settings['core'] ||= {}
      settings['core']['locales'] = current + added
      config.settings = settings
      config.save!
      added
    end

    # Applies an AppConfiguration patch JSON (the companion artifact `create_template` writes) to the
    # current tenant: deep-merges `settings` and, with fetching on, sets remote logo/favicon URLs. Returns
    # false when `path` is nil/missing. Apply *before* the template so locales are in place for its records.
    def self.apply_app_config_file(path, import_uploads: true)
      return false unless path && File.file?(path)

      apply_app_config(JSON.parse(File.read(path)), import_uploads: import_uploads)
      true
    end

    def self.apply_app_config(patch, import_uploads: true)
      config = AppConfiguration.instance
      settings = patch['settings']
      if settings.is_a?(Hash)
        # `deep_merge` overwrites arrays, so `core.locales` *replaces* the tenant's rather than unioning.
        # A user still on a now-removed locale is migrated first, else `validate_locales` rejects the drop.
        migrate_users_to_first_locale(settings.dig('core', 'locales'))
        config.settings = config.settings.deep_merge(settings)
      end

      if import_uploads
        patch.slice('remote_logo_url', 'remote_favicon_url').each do |attr, value|
          setter = :"#{attr}="
          config.public_send(setter, value) if config.respond_to?(setter)
        end
      end
      config.save!
      config
    end

    # Moves every user whose locale isn't in the incoming `locales` onto the first of them, so the
    # `core.locales` replacement doesn't strand a user on a removed locale. Bulk `update_all`, no callbacks.
    def self.migrate_users_to_first_locale(locales)
      return if locales.blank?

      User.where.not(locale: locales).update_all(locale: locales.first)
    end
  end
end
