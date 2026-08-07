# frozen_string_literal: true

require 'tmpdir'

module DecidimImporter
  # Builds a tenant-template graph from a Decidim CSV export by running the extractors in dependency
  # order, plus the companion artifacts (app-config patch, link map). {Importer} applies the result.
  #
  # @example
  #   DecidimImporter::TemplateCreator.from_zip('tmp/example.com.zip').import
  class TemplateCreator
    # Build from a Decidim export zip: extract to a tempdir, parse every CSV, tear the tempdir down.
    # @param container_ids [Array<String>, nil] when given, narrow the export to those process/assembly
    #   uids and the users/folders they reference (see {RowScoper}) — a supplemental single-project import.
    def self.from_zip(zip_path, container_ids: nil, **)
      raise ArgumentError, "file not found: #{zip_path}" unless File.file?(zip_path)

      Dir.mktmpdir('decidim_import_') do |tmp|
        ZipExtractor.extract(zip_path, tmp)
        from_directory(ZipExtractor.detect_csv_root(tmp), container_ids: container_ids, **)
      end
    end

    # Build by scanning a directory that *directly* contains the export's CSV files (see {ExportReader}).
    # @param container_ids [Array<String>, nil] see {.from_zip}.
    def self.from_directory(path, container_ids: nil, **)
      rows = ExportReader.read(path)
      rows = RowScoper.scope(rows, container_ids) if container_ids.present?
      new(rows, **)
    end

    # @param rows_by_model [Hash{Symbol=>Array<Hash>}] parsed CSV rows keyed by model. Missing keys mean
    #   "model not in this export" and are silently skipped.
    # @param import_uploads [Boolean] when false, every `remote_*_url` (images *and* file attachments) is
    #   dropped before deserialize (no external HTTP) — for dry runs and exports whose uploads are unreachable.
    # @param anonymize_users [Boolean] when true, imported users' names and emails are faked (non-prod dumps).
    # @param original_domain [String, nil] the source Decidim host, used by {#link_map} to classify links.
    #   Defaults to the processes' host.
    def initialize(rows_by_model, primary_locale: 'fr-FR', locale_mapping: {}, import_uploads: true,
      anonymize_users: false, include_source_url: false, original_domain: nil)
      @rows_by_model = rows_by_model
      @primary_locale = primary_locale
      @locale_mapper = LocaleMapper.new(locale_mapping, fallback_locale: primary_locale)
      @ref_map = RefMap.new
      @import_uploads = import_uploads
      @anonymize_users = anonymize_users
      @include_source_url = include_source_url
      @original_domain = original_domain
    end

    attr_reader :ref_map

    # Builds the {TemplateBuilder} without applying anything. Extractors must run folders → projects →
    # phases so cross-record refs resolve; users are independent.
    def build_template
      user_custom_fields.register!(ref_map)
      run_users_extractor
      run_extractor(Extractors::ScopesExtractor, :scopes)
      run_extractor(Extractors::FoldersExtractor, :folders)
      run_extractor(Extractors::ProjectsExtractor, :projects)
      run_categories
      run_phases
      run_proposal_statuses
      run_proposals
      run_results
      run_debates
      run_budget_projects
      run_comments
      run_comment_votes
      run_proposal_notes
      run_followers
      run_endorsements
      run_orders
      run_proposal_votes
      run_proposal_attachments
      run_surveys
      run_survey_responses
      run_static_pages
      run_blog_posts
      run_meetings
      run_meeting_attachments
      run_files
      run_description_layouts
      absolutize_embedded_images!
      default_record_update_timestamps
      TemplateBuilder.new(ref_map)
    end

    # The old-URL → new-target mapping for links in the built layouts and static pages. Built from the
    # registered records, so call after {#build_template}. Links aren't rewritten here — the mapping is
    # written beside the template and applied post-import by the `correct_links` task (see {Links::Map}).
    def link_map
      corrector = Links::Corrector.new(original_domain: original_domain, resolver: Links::Resolver.new(ref_map))
      Links::Map.build(correctable_html_texts, corrector)
    end

    # Rewrites Decidim's root-relative `<img src="/…">` to absolute URLs on the source domain, so the
    # rich-text handler can fetch them (a host-less path aborts the import). Absolute/`data:`/`//…` srcs and
    # an unknown source domain are left as-is. Covers rich-text multilocs and layout craftjs `TextMultiloc`s.
    def absolutize_embedded_images!
      origin = original_domain.presence && "https://#{original_domain}"
      return unless origin

      absolutize = ->(html) { html.is_a?(String) ? absolutize_img_srcs(html, origin) : html }
      ref_map.records.each do |record|
        record.attributes.each do |key, value|
          next unless value.is_a?(Hash)

          if key.to_s.end_with?('_multiloc')
            value.transform_values!(&absolutize)
          elsif key == 'craftjs_json'
            TemplateCleaner.rewrite_craftjs_text!(value) { |html| absolutize.call(html) }
          end
        end
      end
    end

    # Prefixes `origin` onto each `<img>`'s root-relative `src` (`/…`, not `//…`), leaving absolute and
    # `data:` srcs untouched.
    def absolutize_img_srcs(html, origin)
      html.gsub(/<img\b[^>]*>/i) do |tag|
        tag.sub(%r{(\ssrc\s*=\s*["'])(/(?!/)[^"']*)}i) { "#{Regexp.last_match(1)}#{origin}#{Regexp.last_match(2)}" }
      end
    end

    # Mirrors `created_at` into `updated_at` for records lacking an explicit update date, so imported
    # content isn't stamped as edited-today by the deserializer. Records with a real source date keep it.
    def default_record_update_timestamps
      ref_map.records.each do |record|
        created = record.attributes['created_at']
        next if created.blank? || record.attributes['updated_at'].present?

        record.attributes['updated_at'] = created
      end
    end

    # The AppConfiguration patch derived from `01--organization.csv` — a JSON-able hash of just the fields
    # with a Go Vocal equivalent, merged into the tenant on import. `{}` when there's no organization file.
    def app_config_patch
      AppConfigMapper.new(organization_row, locale_mapper: @locale_mapper, primary_locale: @primary_locale).patch
    end

    # The YAML artifact (the product output) for the configured exports.
    delegate :to_yaml, to: :build_template

    # Builds the template and applies it to the current tenant in one shot, then assigns the deferred
    # project-moderator roles by natural key. Returns the deserializer's created-ids hash.
    def import(validate: true)
      # Round-trip through YAML to exercise the actual artifact the deserializer consumes.
      template = YAML.load(build_template.to_yaml, aliases: true)
      created = Importer.apply_template(template, import_uploads: @import_uploads, validate: validate)
      ModeratorAssigner.new.assign(moderator_assignments)
      created
    end

    # The custom `idea_status` records the {StatusMapper} created for this import (Decidim states with no
    # standard Go Vocal equivalent), for the run log. Empty until {#build_template} has run.
    def custom_statuses
      @status_resolver&.custom_status_records || []
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

    # Debates that couldn't be imported as ideas (no owning project/phase / no title).
    def skipped_debates
      @debates_extractor&.skipped || []
    end

    # Proposal follows that couldn't be imported (followed proposal or follower user not imported).
    def skipped_followers
      @followers_extractor&.skipped || []
    end

    # Proposal endorsements that couldn't be imported (endorsed proposal not imported / duplicate).
    def skipped_endorsements
      @endorsements_extractor&.skipped || []
    end

    # Comment votes that couldn't be imported (voted comment not imported / unknown value / duplicate).
    def skipped_comment_votes
      @comment_votes_extractor&.skipped || []
    end

    # Proposal notes that couldn't be imported as internal comments (noted proposal not imported / blank body).
    def skipped_proposal_notes
      @proposal_notes_extractor&.skipped || []
    end

    # Budget projects that couldn't be imported as ideas (no owning project/voting phase).
    def skipped_budget_projects
      @budget_projects_extractor&.skipped || []
    end

    # Budget orders that couldn't be imported as baskets (no voting phase / duplicate per user + phase).
    def skipped_orders
      @orders_extractor&.skipped || []
    end

    # Proposal votes that couldn't be imported as baskets (component isn't a voting phase / no imported
    # proposal among the voter's picks).
    def skipped_proposal_votes
      @proposal_votes_extractor&.skipped || []
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

    # Blog posts that couldn't be imported as static pages (e.g. unpublished drafts, no owning project).
    def skipped_blog_posts
      @blog_posts_extractor&.skipped || []
    end

    # Meetings that couldn't be imported as events (no owning project / unpublished / withdrawn / no title).
    def skipped_meetings
      @meetings_extractor&.skipped || []
    end

    # Meeting attachments that couldn't be imported as event files (meeting not imported / no URL).
    def skipped_meeting_attachments
      @meeting_attachments_extractor&.skipped || []
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

    # Natural-key project-moderator tuples for {ModeratorAssigner} (`{ 'user_unique_code' =>,
    # 'project_slug' => }`), resolved against the built ref map — call after {#build_template}. Memoised
    # so {#skipped_roles} reflects the same run.
    def moderator_assignments
      return [] unless @rows_by_model.key?(:process_roles)

      @moderator_assignments ||=
        (@process_roles_extractor = build_extractor(Extractors::ProcessRolesExtractor, :process_roles)).run
    end

    # Process user-roles that couldn't be turned into a moderator assignment (user/process not imported,
    # or project without a slug). Reflects the last {#moderator_assignments} run.
    def skipped_roles
      @process_roles_extractor&.skipped || []
    end

    private

    def run_phases
      @phase_projector = PhaseProjector.new(ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale)
      @phase_projector.run(participation_components: participation_components)
    end

    # Maps the proposals' Decidim states onto Go Vocal idea-statuses (one LLM call, see {StatusMapper}),
    # creating the `idea_status` records for the custom ones before the proposals reference them. Runs
    # only when there are proposals; the resolver copes with a missing `proposal_states` sidecar.
    def run_proposal_statuses
      return unless @rows_by_model.key?(:proposals)

      @status_resolver = ProposalStatusResolver.new(
        rows_for(:proposal_states), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      ).build!
    end

    def run_proposals
      return unless @rows_by_model.key?(:proposals)

      @proposals_extractor = Extractors::ProposalsExtractor.new(
        rows_for(:proposals), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        status_resolver: @status_resolver
      )
      @proposals_extractor.run
    end

    # Decidim accountability results → ideas in the accountability ideation phase. Runs after the phases
    # (phase exists) and categories (input topics resolve); statuses title each result's progress line.
    def run_results
      return unless @rows_by_model.key?(:results)

      @results_extractor = Extractors::ResultsExtractor.new(
        rows_for(:results), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        statuses: rows_for(:accountability_statuses)
      )
      @results_extractor.run
    end

    # Decidim debates → `Idea`s in the debates ideation phase. Runs after the phases (phase exists) and
    # before comments/followers, which reference the debate as their idea.
    def run_debates
      return unless @rows_by_model.key?(:debates)

      (@debates_extractor = build_extractor(Extractors::DebatesExtractor, :debates)).run
    end

    def run_comments
      return unless @rows_by_model.key?(:comments)

      @comments_extractor = Extractors::CommentsExtractor.new(
        rows_for(:comments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @comments_extractor.run
    end

    # Decidim budget projects → `Idea`s in the budgets component's voting phase (project + phase resolved).
    def run_budget_projects
      return unless @rows_by_model.key?(:budget_projects)

      (@budget_projects_extractor = build_extractor(Extractors::BudgetProjectsExtractor, :budget_projects)).run
    end

    # Decidim budget orders → `Basket`s (+ `BasketsIdea`s) in the voting phase (phase + budget ideas resolved).
    def run_orders
      return unless @rows_by_model.key?(:orders)

      (@orders_extractor = build_extractor(Extractors::OrdersExtractor, :orders)).run
    end

    # Decidim proposal votes → `Basket`s (+ `BasketsIdea`s) in a proposals component's single-voting phase.
    # Runs after the proposals extractor (ideas exist) and users (voters resolve).
    def run_proposal_votes
      return unless @rows_by_model.key?(:proposal_votes)

      (@proposal_votes_extractor = build_extractor(Extractors::ProposalVotesExtractor, :proposal_votes)).run
    end

    # Decidim comment votes → up/down `Reaction`s on the imported comments (comment + author resolved).
    def run_comment_votes
      return unless @rows_by_model.key?(:comment_votes)

      (@comment_votes_extractor = build_extractor(Extractors::CommentVotesExtractor, :comment_votes)).run
    end

    # Decidim proposal notes → private `InternalComment`s on the imported ideas (idea + author resolved).
    # Runs after the proposals extractor so each note's idea resolves.
    def run_proposal_notes
      return unless @rows_by_model.key?(:proposal_notes)

      (@proposal_notes_extractor = build_extractor(Extractors::ProposalNotesExtractor, :proposal_notes)).run
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

    # Decidim meetings → project-level `Event`s (project resolved). Runs after the projects extractor.
    def run_meetings
      return unless @rows_by_model.key?(:meetings)

      (@meetings_extractor = build_extractor(Extractors::MeetingsExtractor, :meetings)).run
    end

    # Decidim meeting attachments → `Files::File` attachments on the imported events (event + project
    # resolved). Runs after the meetings extractor.
    def run_meeting_attachments
      return unless @rows_by_model.key?(:meeting_attachments)

      (@meeting_attachments_extractor = build_extractor(Extractors::MeetingAttachmentsExtractor, :meeting_attachments)).run
    end

    # Decidim blog posts → project-level `StaticPage`s (project resolved). Runs before the description
    # layouts; the page ids are handed to the layout extractor, which links them in their own "Blog" section.
    def run_blog_posts
      return unless @rows_by_model.key?(:blog_posts)

      @blog_posts_extractor = build_extractor(Extractors::BlogPostsExtractor, :blog_posts)
      @blog_page_ids = @blog_posts_extractor.run.map { |page| page.attributes['id'] }
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

    # Decidim survey answers → native-survey response `Idea`s. Runs after the surveys and users extractors
    # so each response's phase, project and author resolve. The survey component rows are passed too, so the
    # extractor can parse their questionnaires to encode each answer cell by question type.
    def run_survey_responses
      return if rows_for(:survey_answers).empty?

      @survey_responses_extractor = Extractors::SurveyResponsesExtractor.new(
        rows_for(:survey_answers), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        survey_components: survey_component_rows
      )
      @survey_responses_extractor.run
    end

    # Builds a Content Builder project-description layout per project from the Decidim description, the
    # project's static pages (regular + blog) and its files. Runs last so those records (and ids) exist;
    # the blog page ids route those pages into their own "Blog" section.
    def run_description_layouts
      return unless @rows_by_model.key?(:projects)

      Extractors::DescriptionLayoutExtractor.new(
        rows_for(:projects), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale,
        include_source_url: @include_source_url, attachments: rows_for(:attachments),
        attachment_collections: rows_for(:attachment_collections), blog_page_ids: @blog_page_ids || []
      ).run
    end

    # Every rich-text HTML string {Links::Map} scans for embedded links: the `TextMultiloc` blocks of the
    # layouts (project descriptions) and the static pages' top info sections.
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
        next [] unless TemplateCleaner.craftjs_resolved_name(node) == 'TextMultiloc'

        multiloc_values(node.dig('props', 'text'))
      end
    end

    def multiloc_values(multiloc)
      multiloc.is_a?(Hash) ? multiloc.values : []
    end

    # The source Decidim host: the one passed to the creator, else the host of the processes' own URLs.
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

    # Decidim process attachments → project-level file attachments (`ProjectFile`). Runs after the projects
    # extractor so each file's `project_ref` resolves.
    def run_files
      return unless @rows_by_model.key?(:attachments)

      @files_extractor = Extractors::FilesExtractor.new(
        rows_for(:attachments), ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @files_extractor.run
    end

    # Decidim `pages` components → project-level static pages (not phases). Runs after the projects
    # extractor so each page's `project_ref` resolves.
    def run_static_pages
      return if page_component_rows.empty?

      @static_pages_extractor = Extractors::StaticPagesExtractor.new(
        page_component_rows, ref_map, locale_mapper: @locale_mapper, primary_locale: @primary_locale
      )
      @static_pages_extractor.run
    end

    # The phase-generating components fed to {PhaseProjector}: proposals/accountability → ideation, surveys
    # → native_survey, budgets → voting. Each phase spans its component's `published_at` to its last
    # activity (budgets dated purely from orders; see {PhaseProjector}). Pages become static pages instead.
    def participation_components
      proposal_components + survey_phase_components + accountability_components + budget_components +
        debate_components
    end

    def accountability_components
      dates_by_component = rows_for(:results).group_by { |row| row['decidim_component'] }
      accountability_component_rows.map do |row|
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], weight: row['weight'], method: 'ideation',
          published_at: row['published_at'], previously_published: row['previously_published'],
          end_dates: (dates_by_component[row['uid']] || []).pluck('created_at') }
      end
    end

    # Decidim debates → `ideation` phases (like proposals). Dated from the component's publication to its
    # last activity — the debates' and their comments' `created_at` (a debate's life is its discussion).
    def debate_components
      debate_dates = rows_for(:debates).group_by { |row| row['decidim_component'] }
      comment_dates = rows_for(:comments).group_by { |row| row['decidim_component'] }
      debate_component_rows.map do |row|
        ends = (debate_dates[row['uid']] || []).pluck('created_at') +
               (comment_dates[row['uid']] || []).pluck('created_at')
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], weight: row['weight'], method: 'ideation',
          published_at: row['published_at'], previously_published: row['previously_published'],
          end_dates: ends }
      end
    end

    # Decidim budgets → `voting` (budgeting) phases, dated purely from the orders (`checked_out_at`, else
    # `created_at`), not the component's publication — so `published_at` is nil and `previously_published`
    # forced true. `voting_max_total` sums the budgets' `total_budget`; a budget-less component is dropped.
    def budget_components
      dates_by_component = rows_for(:orders).group_by { |row| row['decidim_component'] }
      totals = budget_totals_by_component
      budget_component_rows.filter_map do |row|
        total = totals[row['uid']].to_i
        next unless total.positive?

        orders = dates_by_component[row['uid']] || []
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], weight: row['weight'], method: 'voting', voting_method: 'budgeting',
          voting_max_total: total, published_at: nil, previously_published: true,
          end_dates: orders.map { |order| order['checked_out_at'].presence || order['created_at'] } }
      end
    end

    # Each budgets component's total budget cap: the sum of its budgets' `total_budget`.
    def budget_totals_by_component
      rows_for(:budgets).group_by { |row| row['decidim_component'] }
        .transform_values { |budgets| budgets.sum { |budget| budget['total_budget'].to_i } }
    end

    # Proposals components → `ideation` phases, *except* those whose proposals were voted on, which become
    # `single_voting` voting phases (one vote per option) so the votes import as baskets (see
    # {Extractors::ProposalVotesExtractor}). A voted component's phase also spans its votes' dates.
    def proposal_components
      dates_by_component = rows_for(:proposals).group_by { |row| row['decidim_component'] }
      votes_by_component = rows_for(:proposal_votes).group_by { |row| row['decidim_component'] }
      proposal_component_rows.map do |row|
        uid = row['uid']
        proposal_dates = (dates_by_component[uid] || []).pluck('published_at')
        votes = votes_by_component[uid] || []
        base = { process_uid: row['decidim_participatory_process'], component_uid: uid,
                 name: row['name'], weight: row['weight'],
                 published_at: row['published_at'], previously_published: row['previously_published'] }
        if votes.any?
          base.merge(method: 'voting', voting_method: 'single_voting', voting_max_votes_per_idea: 1,
            voting_max_total: proposal_vote_limit(row), end_dates: proposal_dates + votes.pluck('created_at'))
        else
          base.merge(method: 'ideation', end_dates: proposal_dates)
        end
      end
    end

    # A proposals component's per-user vote cap from its `vote_limit` setting; nil when 0 (Decidim's
    # "unlimited"), which leaves the Go Vocal single-voting phase uncapped.
    def proposal_vote_limit(component_row)
      settings = Parsing.parse_json(component_row['settings'])
      limit = settings.is_a?(Hash) ? settings.dig('global', 'vote_limit').to_i : 0
      limit.positive? ? limit : nil
    end

    def survey_phase_components
      dates_by_component = rows_for(:survey_answers).group_by { |row| row['decidim_component'] }
      survey_component_rows.map do |row|
        # Titled by the component `name`; the questionnaire's own title/description render as an <h2>
        # heading above the phase body. Ends at its last answer.
        { process_uid: row['decidim_participatory_process'], component_uid: row['uid'],
          name: row['name'], weight: row['weight'], method: 'native_survey',
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

    # Component manifest rows whose type is `debates` (their debates live in a sibling CSV).
    def debate_component_rows
      @debate_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::DEBATES_COMPONENT }
    end

    # Component manifest rows whose type is `surveys` (their questionnaire lives in `specific_data`).
    def survey_component_rows
      @survey_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::SURVEYS_COMPONENT }
    end

    # Component manifest rows whose type is `budgets` (their budgets/projects/orders live in a subtree).
    def budget_component_rows
      @budget_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::BUDGETS_COMPONENT }
    end

    # Component manifest rows whose type is `pages` (their body lives in `specific_data`).
    def page_component_rows
      @page_component_rows ||= rows_for(:components).select { |row| row['type'] == ExportReader::PAGES_COMPONENT }
    end

    # Custom user fields seeded from the organization's `extra_user_fields` config, feeding both the
    # template (new `custom_field` records) and the users extractor (keys to copy off `extended_data`).
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

    def rows_for(model)
      @rows_by_model[model] || []
    end
  end
end
