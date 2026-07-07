# frozen_string_literal: true

require 'tmpdir'
require 'net/http'

module DecidimImporter
  # Orchestrates a Decidim → Go Vocal import for the base scaffold (users, folders, projects,
  # phases). Reads the Decidim CSV export (a zip file containing per-model CSVs), builds a
  # tenant-template graph and applies it through the existing template deserializer, then assigns
  # the deferred moderator roles.
  #
  # @example
  #   DecidimImporter::Importer.from_zip('tmp/example.com.zip').import
  class Importer
    # Build an importer from a Decidim export zip. Extracts into a tempdir, parses every CSV into
    # memory, then tears the tempdir down.
    def self.from_zip(zip_path, **)
      raise ArgumentError, "file not found: #{zip_path}" unless File.file?(zip_path)

      Dir.mktmpdir('decidim_import_') do |tmp|
        ZipExtractor.extract(zip_path, tmp)
        from_directory(ZipExtractor.detect_csv_root(tmp), **)
      end
    end

    # Build an importer by scanning a directory of already-unzipped Decidim CSVs. The directory should
    # be the one that *directly* contains the export's CSV files (see {ExportReader}).
    def self.from_directory(path, **)
      new(ExportReader.read(path), **)
    end

    # Applies a previously dumped tenant-template YAML file to the current tenant, independent of
    # the CSV/zip pipeline (the file is the only input). Returns the deserializer's created-ids
    # hash. Note: scoped moderator roles (`RoleAssigner`) are *not* applied here — that pass needs
    # the in-memory ref map, so it only runs in the combined {#import} path. Real exports don't
    # carry process-roles yet, so a file-based import is currently complete.
    #
    # @param import_images [Boolean] when false, `remote_*_url` attributes are stripped before
    #   deserialize (no external HTTP), e.g. for exports whose image URLs are unreachable.
    def self.apply_template_file(path, import_images: true)
      template = YAML.load_file(path, aliases: true)
      IdeaStatuses.resolve!(template)
      resolve_area_orderings!(template)
      prepare_images!(template, import_images: import_images)
      prune_fileless_attachments!(template)
      prune_imageless_project_images!(template)
      # Suppress `touch: true` callbacks during the bulk load: creating an idea's `ideas_phase`/comments
      # would otherwise bump the idea's `updated_at` to the import time, overwriting the date the
      # template carries.
      created = ActiveRecord::Base.no_touching do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template)
      end
      restore_update_timestamps(template, created)
      reconcile_permissions!
      created
    end

    # After the bulk load, restore each created record's `updated_at` to the date the template carries.
    # `no_touching` stops `touch: true` callbacks, but counter-cache updates (`counter_culture ...
    # touch: true`, e.g. an idea's `comments_count`/a project's `ideas_count`) bump `updated_at` to the
    # import time via raw `update_all`, which it can't intercept. The template's records line up
    # positionally with the deserializer's per-model created ids (same order), so we map them back and
    # reset `updated_at` with `update_all` (no callbacks, no re-touch). Records keep their source update
    # date where the export gave one (comments, projects, …); the rest mirror `created_at`.
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

    # Offsets each imported area's `ordering` past the tenant's existing areas. `Area#ordering` is
    # uniquely indexed and the deserializer doesn't reposition (`acts_as_list_no_update`), so without
    # this an import into a tenant that already has areas — or a re-import into the same tenant — would
    # abort on a unique-ordering collision. Relative order is preserved. Run inside the target tenant.
    def self.resolve_area_orderings!(template)
      areas = template.dig('models', 'area')
      return template if areas.blank?

      base = (::Area.maximum(:ordering) || -1) + 1
      areas.each { |attrs| attrs['ordering'] = base + attrs['ordering'] if attrs['ordering'] }
      template
    end

    # The deserializer creates phases/projects directly, bypassing the SideFx that normally generates
    # their `Permission` records — so imported phases would have none (e.g. `posting_idea`), and a
    # native-survey phase's `posting_permission` would be nil, 500ing the admin endpoints. Reconciling
    # all permissions (idempotent) backfills the missing ones.
    def self.reconcile_permissions!
      Permissions::PermissionsUpdateService.new.update_all_permissions
    end

    # Applies an AppConfiguration patch JSON (the companion artifact `dump_yaml` writes) to the
    # current tenant: deep-merges its `settings` over the tenant's, and — when image fetching is on —
    # sets its remote logo/favicon URLs. No-op returning false when `path` is nil or missing; returns
    # true when applied. Apply this *before* the template so locale settings are in place for the
    # records that use them.
    def self.apply_app_config_file(path, import_images: true)
      return false unless path && File.file?(path)

      apply_app_config(JSON.parse(File.read(path)), import_images: import_images)
      true
    end

    def self.apply_app_config(patch, import_images: true)
      config = AppConfiguration.instance
      settings = patch['settings']
      if settings.is_a?(Hash)
        # `deep_merge` overwrites array values, so the patch's `core.locales` *replaces* the tenant's
        # rather than unioning with it — the imported content's locales become the tenant's exact set.
        # Any existing user still on a now-removed locale is migrated to the first of the new locales,
        # otherwise `AppConfiguration#validate_locales` would reject dropping a locale still in use.
        migrate_users_to_first_locale(settings.dig('core', 'locales'))
        config.settings = config.settings.deep_merge(settings)
      end

      if import_images
        patch.slice('remote_logo_url', 'remote_favicon_url').each do |attr, value|
          setter = :"#{attr}="
          config.public_send(setter, value) if config.respond_to?(setter)
        end
      end
      config.save!
      config
    end

    # Moves every user whose locale isn't among the incoming `locales` onto the first of them, so the
    # subsequent `core.locales` replacement doesn't strand a user on a removed locale. No-op for a
    # blank locale list. Bulk `update_all` (no callbacks) — a locale switch needs none.
    def self.migrate_users_to_first_locale(locales)
      return if locales.blank?

      User.where.not(locale: locales).update_all(locale: locales.first)
    end

    # Prepares the loaded template's images before deserialize.
    #
    # With fetching **off**, every image is dropped — `remote_*_url` attachment attributes and the
    # `<img>` tags embedded in rich-text bodies — so the deserializer performs no HTTP.
    #
    # With fetching **on**, images that are still reachable are kept and only the unreachable ones are
    # dropped — both `remote_*_url` attachments (avatars, hero images) and the `<img>` tags embedded in
    # rich-text bodies. Decidim references the source platform's storage, where a since-deleted image
    # 404s on download and would abort the all-or-nothing import; probing each URL once (shared cache)
    # and dropping only the dead ones keeps the import robust without losing images that are still
    # there.
    def self.prepare_images!(template, import_images:)
      if import_images
        reachability = {}
        prune_unreachable_remote_urls!(template, reachability)
        prune_unreachable_embedded_images!(template, reachability)
      else
        strip_remote_image_urls!(template)
        strip_embedded_images!(template)
      end
    end

    # Drops any `Files::File` whose content URL was pruned (unreachable) or stripped (images off): a
    # file with no content is a broken, empty attachment, so the record — and its dependent
    # `files_project` ownership join and `file_attachment` — are removed rather than imported. Runs
    # after {.prepare_images!}, which is what removes the unreachable/stripped `remote_content_url`s.
    def self.prune_fileless_attachments!(template)
      files = template.dig('models', 'files/file')
      return unless files

      removed = files.reject { |attrs| attrs['remote_content_url'].present? || attrs['content'].present? }
      return if removed.empty?

      # Cross-record links share the exact attribute-hash object (preserved through the YAML
      # anchors/aliases), so dependents are matched to removed files by object identity. Sweep every
      # model for a `file_ref` pointing at a removed file — the files_project join and file_attachment
      # today, plus any future file-referencing model — so no dangling ref survives to crash the
      # deserializer, which raises (not skips) on an unresolved ref.
      removed_ids = removed.to_set(&:object_id)
      files.reject! { |attrs| removed_ids.include?(attrs.object_id) }
      template['models'].each_value do |records|
        records.reject! { |attrs| removed_ids.include?(attrs['file_ref'].object_id) }
      end
      strip_layout_file_nodes!(template, removed.filter_map { |attrs| attrs['id'] }.to_set)
    end

    # Removes `FileAttachment` craft nodes whose file was pruned from every project-description layout.
    # A node pointing at a non-existent file would make the layout's `sync_file_attachments` callback
    # try to attach a missing file and fail the import. Nodes are unlinked from *whatever* parent holds
    # them (the ROOT canvas, or an accordion's linked `Container`), and an accordion left with no files
    # is removed too (along with its linked canvas) so no empty accordion is rendered.
    def self.strip_layout_file_nodes!(template, removed_file_ids)
      return if removed_file_ids.empty?

      (template.dig('models', 'content_builder/layout') || []).each do |layout|
        craftjs = layout['craftjs_json']
        next unless craftjs.is_a?(Hash)

        dangling = craftjs.select do |_id, node|
          craftjs_resolved_name(node) == 'FileAttachment' && removed_file_ids.include?(node.dig('props', 'fileId'))
        end.keys
        remove_craftjs_nodes!(craftjs, dangling)
        remove_empty_accordions!(craftjs)
      end
    end

    # Deletes the given craft nodes and unlinks their ids from every node's `nodes` child list.
    def self.remove_craftjs_nodes!(craftjs, ids)
      return if ids.empty?

      ids.each { |id| craftjs.delete(id) }
      craftjs.each_value do |node|
        node['nodes'] -= ids if node.is_a?(Hash) && node['nodes'].is_a?(Array)
      end
    end

    # Drops `AccordionMultiloc` nodes whose linked content canvas has no children left, removing the
    # accordion and its canvas together (the canvas would otherwise be an orphan).
    def self.remove_empty_accordions!(craftjs)
      empty = craftjs.select do |_id, node|
        next false unless craftjs_resolved_name(node) == 'AccordionMultiloc'

        canvas = craftjs[node['linkedNodes']&.values&.first]
        canvas.nil? || (canvas['nodes'].is_a?(Array) && canvas['nodes'].empty?)
      end
      canvases = empty.values.filter_map { |node| node['linkedNodes']&.values }.flatten
      remove_craftjs_nodes!(craftjs, empty.keys + canvases)
    end

    # Drops any `project_image` whose image URL was pruned (unreachable) or stripped (images off): an
    # image-less ProjectImage would surface as a broken/empty card image, so the record is removed.
    # Runs after {.prepare_images!}. The project itself is untouched — only the card-image record goes.
    def self.prune_imageless_project_images!(template)
      images = template.dig('models', 'project_image')
      return unless images

      images.reject! { |attrs| attrs['remote_image_url'].blank? && attrs['image'].blank? }
    end

    # Drops every `remote_*_url` attribute so the deserializer doesn't trigger a CarrierWave fetch.
    def self.strip_remote_image_urls!(template)
      template['models'].each_value do |records|
        records.each { |attrs| attrs.delete_if { |key, _| remote_image_url?(key) } }
      end
    end

    # Removes every `<img>` tag embedded in a rich-text `*_multiloc` value (text kept, images dropped).
    def self.strip_embedded_images!(template)
      rewrite_multiloc_html!(template) { |html| html.gsub(/<img\b[^>]*>/i, '') }
    end

    # Drops each `remote_*_url` attachment attribute whose URL can't be reached, leaving the reachable
    # ones for CarrierWave to fetch.
    def self.prune_unreachable_remote_urls!(template, reachability = {})
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.reject! do |key, value|
            next false unless remote_image_url?(key) && value.is_a?(String)

            reachability[value] = image_reachable?(value) unless reachability.key?(value)
            !reachability[value]
          end
        end
      end
    end

    def self.remote_image_url?(key)
      key.is_a?(String) && key.start_with?('remote_') && key.end_with?('_url')
    end

    # Drops only the embedded `<img>` tags whose remote source can't be reached, keeping the rest.
    # Each distinct URL is probed once (cache shared with the attachment pass).
    def self.prune_unreachable_embedded_images!(template, reachability = {})
      rewrite_multiloc_html!(template) do |html|
        html.gsub(/<img\b[^>]*>/i) do |tag|
          src = tag[%r{\bsrc\s*=\s*["']?(https?://[^"' >]+)}i, 1]
          next tag if src.nil? # base64 / relative sources are left untouched

          reachability[src] = image_reachable?(src) unless reachability.key?(src)
          reachability[src] ? tag : ''
        end
      end
    end

    # True only when the URL resolves to a 2xx (following redirects); any non-success or error → false,
    # so a missing file/image is dropped rather than risking a download failure mid-import.
    #
    # Uses a single-byte ranged GET (`Range: bytes=0-0`), not HEAD: Active Storage redirects to
    # presigned S3 URLs that are signed for GET only and answer HEAD with 403, so a HEAD probe would
    # wrongly mark a perfectly reachable file unreachable. The body is left unread (the request is
    # streamed and the connection closed), so nothing is actually downloaded. A 206 Partial Content is
    # a `Net::HTTPSuccess`, so it's covered alongside a 200 (servers that ignore the Range header).
    def self.image_reachable?(url, redirects_left = 5)
      uri = URI.parse(url)
      return false unless uri.is_a?(URI::HTTP)

      response = nil
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https',
        open_timeout: 5, read_timeout: 5) do |http|
        request = Net::HTTP::Get.new(uri.request_uri)
        request['Range'] = 'bytes=0-0'
        http.request(request) { |res| response = res } # body intentionally left unread
      end
      case response
      when Net::HTTPSuccess then true
      when Net::HTTPRedirection
        redirects_left.positive? && image_reachable?(URI.join(url, response['location']).to_s, redirects_left - 1)
      else false
      end
    rescue StandardError
      false
    end

    # Rewrites every rich-text `*_multiloc` HTML string in the template through the given block,
    # including the `TextMultiloc` text buried inside a Content Builder layout's `craftjs_json` (so the
    # project description — now a craft block rather than a top-level multiloc — gets the same treatment).
    def self.rewrite_multiloc_html!(template, &block)
      template['models'].each_value do |records|
        records.each do |attrs|
          attrs.each do |key, value|
            if key.is_a?(String) && key.end_with?('_multiloc') && value.is_a?(Hash)
              value.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
            elsif key == 'craftjs_json' && value.is_a?(Hash)
              rewrite_craftjs_text!(value, &block)
            end
          end
        end
      end
    end

    # Rewrites the `text` multiloc HTML of every `TextMultiloc` node in a craftjs tree.
    def self.rewrite_craftjs_text!(craftjs)
      craftjs.each_value do |node|
        next unless craftjs_resolved_name(node) == 'TextMultiloc'

        text = node.dig('props', 'text')
        next unless text.is_a?(Hash)

        text.transform_values! { |html| html.is_a?(String) ? yield(html) : html }
      end
    end

    # The craft component name of a node, or nil. Guards against the ROOT node, whose `type` is the
    # plain string `'div'` rather than a `{ 'resolvedName' => … }` hash.
    def self.craftjs_resolved_name(node)
      return nil unless node.is_a?(Hash)

      type = node['type']
      type['resolvedName'] if type.is_a?(Hash)
    end

    # @param rows_by_model [Hash{Symbol=>Array<Hash>}] parsed CSV rows keyed by model
    #   (:organization, :users, :scopes, :folders, :projects, :attachments, :proposals,
    #   :comments, :components, :process_roles). Missing keys are treated as "model not in this
    #   export" and silently skipped.
    # @param import_images [Boolean] when false, `remote_*_url` attributes are dropped from the
    #   template before deserialize, so no external HTTP is performed. Useful for dry runs and for
    #   exports whose image URLs reference an unreachable host (e.g. the Decidim dev instance's
    #   `http://localhost/rails/active_storage/...` blob redirects).
    # @param anonymize_users [Boolean] when true, imported users' names and emails are replaced with
    #   fake values (for non-production dumps that shouldn't carry real PII).
    # @param original_domain [String, nil] the source Decidim host (e.g. `participer.arcueil.fr`),
    #   used by {#link_map} to classify links embedded in imported project descriptions. Defaults to
    #   the host of the processes' URLs.
    def initialize(rows_by_model, primary_locale: 'fr-FR', locale_mapping: {}, import_images: true,
      anonymize_users: false, include_source_url: false, original_domain: nil)
      @rows_by_model = rows_by_model
      @primary_locale = primary_locale
      @locale_mapper = LocaleMapper.new(locale_mapping, fallback_locale: primary_locale)
      @ref_map = RefMap.new
      @import_images = import_images
      @anonymize_users = anonymize_users
      @include_source_url = include_source_url
      @original_domain = original_domain
    end

    attr_reader :ref_map

    # Builds the {TemplateBuilder} for the configured exports without applying anything. Extractors
    # must run folders → projects → phases so cross-record refs resolve; users are independent.
    def build_template
      user_custom_fields.register!(ref_map)
      run_users_extractor
      run_extractor(Extractors::ScopesExtractor, :scopes)
      run_extractor(Extractors::FoldersExtractor, :folders)
      run_extractor(Extractors::ProjectsExtractor, :projects)
      run_categories
      run_phases
      run_proposals
      run_results
      run_comments
      run_followers
      run_endorsements
      run_proposal_attachments
      run_surveys
      run_survey_responses
      run_static_pages
      run_files
      run_description_layouts
      default_record_update_timestamps
      TemplateBuilder.new(ref_map)
    end

    # The old-URL → new-target mapping for the links embedded in the built Content Builder layouts
    # (project descriptions) and static pages. Built from the registered records, so call after
    # {#build_template}. The links aren't rewritten here — the mapping is written beside the template
    # and applied to the tenant after import by the `decidim_importer:correct_links` task (see {LinkMap}).
    def link_map
      corrector = LinkCorrector.new(original_domain: original_domain, resolver: ImportLinkResolver.new(ref_map))
      LinkMap.build(correctable_html_texts, corrector)
    end

    # For every record that has a `created_at` but no explicit update date, mirror `created_at` into
    # `updated_at`. Without this the deserializer (Rails timestamps) stamps `updated_at` with the import
    # date, so imported content would appear edited today. Records that carry a real update date from
    # the source (users, projects, comments, …) keep it.
    def default_record_update_timestamps
      ref_map.records.each do |record|
        created = record.attributes['created_at']
        next if created.blank? || record.attributes['updated_at'].present?

        record.attributes['updated_at'] = created
      end
    end

    # The AppConfiguration patch derived from `01--organization.csv` — a JSON-able hash of just the
    # fields with a Go Vocal equivalent, for merging into the target tenant's app config on import.
    # The template pipeline itself doesn't touch app config, so this is a separate artifact.
    # Returns `{}` when the export has no organization file.
    def app_config_patch
      AppConfigMapper.new(organization_row, locale_mapper: @locale_mapper, primary_locale: @primary_locale).patch
    end

    # The YAML artifact (the product output) for the configured exports.
    delegate :to_yaml, to: :build_template

    # Applies the import to the current tenant. Returns the deserializer's created-ids hash.
    def import(validate: true)
      builder = build_template
      # Round-trip through YAML so we exercise the actual artifact the deserializer consumes.
      template = YAML.load(builder.to_yaml, aliases: true)
      IdeaStatuses.resolve!(template)
      self.class.resolve_area_orderings!(template)
      self.class.prepare_images!(template, import_images: @import_images)
      self.class.prune_fileless_attachments!(template)
      self.class.prune_imageless_project_images!(template)
      # See {.apply_template_file}: suppress `touch` callbacks so imported records keep their dates.
      created_object_ids = ActiveRecord::Base.no_touching do
        MultiTenancy::Templates::TenantDeserializer.new.deserialize(template, validate: validate)
      end
      self.class.restore_update_timestamps(template, created_object_ids)
      RoleAssigner.new(ref_map).assign(created_object_ids, role_assignments)
      self.class.reconcile_permissions!
      created_object_ids
    end

    # Participation components that couldn't be placed as a phase (never published / no datable window).
    def skipped_components
      @phase_projector&.skipped || []
    end

    # Proposals/comments that couldn't be imported (e.g. their phase or proposal wasn't created).
    def skipped_participation
      (@proposals_extractor&.skipped || []) + (@comments_extractor&.skipped || [])
    end

    # Accountability results that couldn't be imported as ideas (no owning project/phase).
    def skipped_results
      @results_extractor&.skipped || []
    end

    # Proposal follows that couldn't be imported (followed proposal or follower user not imported).
    def skipped_followers
      @followers_extractor&.skipped || []
    end

    # Proposal endorsements that couldn't be imported (endorsed proposal not imported / duplicate).
    def skipped_endorsements
      @endorsements_extractor&.skipped || []
    end

    # Surveys/questions that couldn't be imported (e.g. an unsupported question type).
    def skipped_surveys
      @surveys_extractor&.skipped || []
    end

    # Survey responses (or their uploaded files) that couldn't be fully imported.
    def skipped_survey_responses
      @survey_responses_extractor&.skipped || []
    end

    # Pages that couldn't be imported as static pages (e.g. unpublished drafts, no owning project).
    def skipped_pages
      @static_pages_extractor&.skipped || []
    end

    # Attachments that couldn't be imported as project files (e.g. no file URL, no owning project).
    def skipped_files
      @files_extractor&.skipped || []
    end

    # Proposal attachments that couldn't be imported as idea files (proposal not imported / no URL).
    def skipped_proposal_attachments
      @proposal_attachments_extractor&.skipped || []
    end

    # Categories that couldn't be imported as input topics (no owning project / no name).
    def skipped_categories
      @categories_extractor&.skipped || []
    end

    private

    def run_phases
      @phase_projector = PhaseProjector.new(ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale)
      @phase_projector.run(participation_components: participation_components)
    end

    def run_proposals
      return unless @rows_by_model.key?(:proposals)

      @proposals_extractor = Extractors::ProposalsExtractor.new(
        rows_for(:proposals), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @proposals_extractor.run
    end

    # Decidim accountability results → ideas in the accountability ideation phase. Runs after the phases
    # (the phase exists) and categories (input topics resolve); the statuses title each result's
    # progress line.
    def run_results
      return unless @rows_by_model.key?(:results)

      @results_extractor = Extractors::ResultsExtractor.new(
        rows_for(:results), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        statuses: rows_for(:accountability_statuses)
      )
      @results_extractor.run
    end

    def run_comments
      return unless @rows_by_model.key?(:comments)

      @comments_extractor = Extractors::CommentsExtractor.new(
        rows_for(:comments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @comments_extractor.run
    end

    # Decidim proposal follows → `Follower`s on the imported ideas (idea + user resolved).
    def run_followers
      return unless @rows_by_model.key?(:followers)

      (@followers_extractor = build_extractor(Extractors::FollowersExtractor, :followers)).run
    end

    # Decidim proposal endorsements → up-`Reaction`s (likes) on the imported ideas (idea + author resolved).
    def run_endorsements
      return unless @rows_by_model.key?(:endorsements)

      (@endorsements_extractor = build_extractor(Extractors::EndorsementsExtractor, :endorsements)).run
    end

    # Decidim proposal attachments → `Files::File` attachments on the imported ideas (idea + project resolved).
    def run_proposal_attachments
      return unless @rows_by_model.key?(:proposal_attachments)

      (@proposal_attachments_extractor = build_extractor(Extractors::ProposalAttachmentsExtractor, :proposal_attachments)).run
    end

    # Decidim categories → project `InputTopic`s (after the projects extractor so the project resolves).
    def run_categories
      return unless @rows_by_model.key?(:categories)

      (@categories_extractor = build_extractor(Extractors::CategoriesExtractor, :categories)).run
    end

    def run_surveys
      return if survey_component_rows.empty?

      @surveys_extractor = Extractors::SurveysExtractor.new(
        survey_component_rows, ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @surveys_extractor.run
    end

    # Decidim survey answers (`02---answers.csv`) → native-survey response `Idea`s. Runs after the
    # surveys and users extractors so each response's phase, project and author resolve through the ref
    # map. The survey component rows are passed too: the extractor parses their questionnaires to encode
    # each answer cell by question type.
    def run_survey_responses
      return if rows_for(:survey_answers).empty?

      @survey_responses_extractor = Extractors::SurveyResponsesExtractor.new(
        rows_for(:survey_answers), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        survey_components: survey_component_rows
      )
      @survey_responses_extractor.run
    end

    # Builds a Content Builder project-description layout per project from the Decidim description, the
    # project's static pages and its files. Runs last so those records (and their ids) are registered.
    def run_description_layouts
      return unless @rows_by_model.key?(:projects)

      Extractors::DescriptionLayoutExtractor.new(
        rows_for(:projects), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        include_source_url: @include_source_url, attachments: rows_for(:attachments),
        attachment_collections: rows_for(:attachment_collections)
      ).run
    end

    # Every rich-text HTML string (one per locale) {LinkMap} should scan for embedded links: the
    # `TextMultiloc` blocks of the Content Builder layouts (project descriptions) and the static pages'
    # top info sections.
    def correctable_html_texts
      ref_map.records.flat_map do |record|
        case record.model_name
        when 'content_builder/layout' then layout_text_values(record)
        when 'static_page' then multiloc_values(record.attributes['top_info_section_multiloc'])
        else []
        end
      end
    end

    def layout_text_values(record)
      craftjs = record.attributes['craftjs_json']
      return [] unless craftjs.is_a?(Hash)

      craftjs.values.flat_map do |node|
        next [] unless self.class.craftjs_resolved_name(node) == 'TextMultiloc'

        multiloc_values(node.dig('props', 'text'))
      end
    end

    def multiloc_values(multiloc)
      multiloc.is_a?(Hash) ? multiloc.values : []
    end

    # The source Decidim host: the one passed to the importer, else the host of the processes' own URLs.
    def original_domain
      @original_domain || derived_original_domain
    end

    def derived_original_domain
      url = rows_for(:projects).filter_map { |row| present_string(row['url']) }.first
      url && URI.parse(url).host
    rescue URI::InvalidURIError
      nil
    end

    def present_string(value)
      str = value.to_s.strip
      str.empty? ? nil : str
    end

    # Decidim process attachments → project-level file attachments (`ProjectFile`). Runs after the
    # projects extractor so each file's `project_ref` resolves through the ref map.
    def run_files
      return unless @rows_by_model.key?(:attachments)

      @files_extractor = Extractors::FilesExtractor.new(
        rows_for(:attachments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @files_extractor.run
    end

    # Decidim `pages` components → project-level static pages (not phases). Runs after the projects
    # extractor so each page's `project_ref` resolves through the ref map.
    def run_static_pages
      return if page_component_rows.empty?

      @static_pages_extractor = Extractors::StaticPagesExtractor.new(
        page_component_rows, ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @static_pages_extractor.run
    end

    # The phase-generating components fed to {PhaseProjector}: proposals and accountability →
    # ideation phases, surveys → native_survey phases. Each phase starts at its component's
    # `published_at` and ends at its last activity (a proposal's/result's date, a survey answer's
    # `created_at`); see {PhaseProjector}. Pages are *not* here: they become project-level static
    # pages via {Extractors::StaticPagesExtractor}.
    def participation_components
      proposal_components + survey_phase_components + accountability_components
    end

    def accountability_components
      dates_by_component = rows_for(:results).group_by { |row| row['decidim_component'] }
      accountability_component_rows.map do |row|
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], method: 'ideation',
          published_at: row['published_at'], previously_published: row['previously_published'],
          end_dates: (dates_by_component[row['uid']] || []).pluck('created_at') }
      end
    end

    def proposal_components
      dates_by_component = rows_for(:proposals).group_by { |row| row['decidim_component'] }
      proposal_component_rows.map do |row|
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], method: 'ideation',
          published_at: row['published_at'], previously_published: row['previously_published'],
          end_dates: (dates_by_component[row['uid']] || []).pluck('published_at') }
      end
    end

    def survey_phase_components
      dates_by_component = rows_for(:survey_answers).group_by { |row| row['decidim_component'] }
      survey_component_rows.map do |row|
        # The phase is titled by the component `name`; the questionnaire's own title/description (when
        # present) render into the phase description as an <h2> heading above the body. It ends at its
        # last answer (`created_at`).
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], method: 'native_survey',
          published_at: row['published_at'], previously_published: row['previously_published'],
          end_dates: (dates_by_component[row['uid']] || []).pluck('created_at'),
          description_heading: SurveyParser.title(row['specific_data']),
          description_body: SurveyParser.description(row['specific_data']) }
      end
    end

    # Component manifest rows whose type is `proposals` (their proposals live in a sibling CSV).
    def proposal_component_rows
      @proposal_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::PROPOSALS_COMPONENT }
    end

    # Component manifest rows whose type is `accountability` (their results live in a sibling CSV).
    def accountability_component_rows
      @accountability_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::ACCOUNTABILITY_COMPONENT }
    end

    # Component manifest rows whose type is `surveys` (their questionnaire lives in `specific_data`).
    def survey_component_rows
      @survey_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::SURVEYS_COMPONENT }
    end

    # Component manifest rows whose type is `pages` (their body lives in `specific_data`).
    def page_component_rows
      @page_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::PAGES_COMPONENT }
    end

    # Custom user fields are seeded from the organization's `extra_user_fields` config (if present)
    # and feed both the template (new `custom_field` records) and the users extractor (which keys to
    # copy off `extended_data`).
    def user_custom_fields
      @user_custom_fields ||= UserCustomFields.new(
        organization_row, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
    end

    def run_users_extractor
      return unless @rows_by_model.key?(:users)

      Extractors::UsersExtractor.new(
        rows_for(:users), ref_map,
        locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        extra_text_field_keys: user_custom_fields.text_field_keys,
        anonymize_users: @anonymize_users
      ).run
    end

    def organization_row
      rows_for(:organization).first
    end

    def run_extractor(klass, model)
      return unless @rows_by_model.key?(model)

      build_extractor(klass, model).run
    end

    # Instantiates an extractor for a model with the shared ref map + locale settings.
    def build_extractor(klass, model)
      klass.new(rows_for(model), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale)
    end

    def role_assignments
      return [] unless @rows_by_model.key?(:process_roles)

      Extractors::ProcessRolesExtractor.new(
        rows_for(:process_roles), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      ).run
    end

    def rows_for(model)
      @rows_by_model[model] || []
    end
  end
end
