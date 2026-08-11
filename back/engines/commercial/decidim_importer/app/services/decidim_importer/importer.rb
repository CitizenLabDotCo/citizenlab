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
    # Per-model matchers that reuse a record the tenant already holds instead of inserting a duplicate.
    # Always applied, so an import never aborts on a pre-existing record (e.g. an admin whose email is in
    # the export, which would fail the email-uniqueness validation). No-op on a fresh tenant. Matches on
    # stable identity: users by `unique_code` then case-insensitive email, folders by title slug
    # ({Slug.sanitize}), custom fields by `key`, custom idea-statuses by title. Only custom statuses travel
    # in the template (standard ones resolve by code in {IdeaStatuses.resolve!}); their titles are matched
    # in Ruby, best-effort — {StatusMapper} picks each import's customs blind to the tenant, so an identical
    # label reuses and a new one is created.
    #
    # Built fresh per apply (not a shared constant): the user matcher preloads the tenant's existing users
    # into in-memory maps ONCE, lazily on first use, and matches against those. A per-row DB lookup would
    # be an N+1 against a table that grows as the import inserts — quadratic for a 20k-user template — and
    # the snapshot is exactly right anyway (we only ever want to reuse users that pre-date this import).
    def self.reuse_matchers
      user_ids_by_code = nil
      user_ids_by_email = nil

      {
        'User' => lambda { |attrs, klass|
          user_ids_by_code ||= klass.where.not(unique_code: nil).pluck(:unique_code, :id).to_h
          user_ids_by_email ||= klass.pluck(:email, :id).each_with_object({}) do |(email, id), map|
            map[email.downcase] = id if email.present?
          end

          id = (code = attrs['unique_code']).present? ? user_ids_by_code[code] : nil
          # No unique_code match — fall back to email (e.g. a manually-created user).
          id ||= (email = attrs['email']).present? ? user_ids_by_email[email.downcase] : nil
          klass.find(id) if id
        },
        'CustomField' => lambda { |attrs, klass|
          key = attrs['key']
          klass.find_by(key: key) if key.present?
        },
        'ProjectFolders::Folder' => lambda { |attrs, klass|
          slug = Slug.sanitize((attrs['title_multiloc'] || {}).values.find(&:present?))
          klass.find_by(slug: slug) if slug
        },
        'IdeaStatus' => lambda { |attrs, klass|
          titles = (attrs['title_multiloc'] || {}).values.compact_blank
          next if titles.empty?

          klass.where(code: 'custom', participation_method: IdeaStatuses::PARTICIPATION_METHOD)
            .find { |status| status.title_multiloc.values.intersect?(titles) }
        }
      }
    end

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
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(
          template, validate: validate, reuse_by: reuse_matchers
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
