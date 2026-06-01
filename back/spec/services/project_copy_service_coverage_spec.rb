# frozen_string_literal: true

require 'rails_helper'

# This spec guards against silent data loss in ProjectCopyService#export (the
# in-tenant project-clone path). Unlike the tenant template serializers, which
# have a declarative DSL, ProjectCopyService is a hand-written builder of
# `@template['models'][<key>] = yml_<x>(...)` arrays. We parse the source file
# rather than executing the service: this captures conditional code paths
# without requiring a comprehensive fixture, and it stays robust against test
# data drift.
#
# Two examples:
#
#   1. Column coverage — for every model that has a `yml_<x>` method, every
#      column is exported, detected as a derived/bookkeeping column, or
#      allowlisted in IGNORED_COLUMNS. Catches "added a column but forgot to
#      add it to the yml_<x> method".
#
#   2. Model coverage — every persisted model is either covered by export or
#      listed in EXCLUDED_MODELS with a reason. Catches "added a project-scoped
#      model that should be cloned but isn't" (and forces a conscious decision
#      for every new model).
describe 'ProjectCopyService export coverage' do
  SERVICE_PATH = Rails.root.join('app/services/project_copy_service.rb').freeze

  # Real (non-derived) columns that are intentionally NOT carried over by
  # ProjectCopyService#export, keyed by model name. `# REVIEW` marks fields
  # that look like they might actually belong in the export (the bug class
  # this spec exists to catch) — allowlisted for now to keep the baseline
  # green, pending a human call.
  IGNORED_COLUMNS = {
    # AdminPublication is exported as nested `admin_publication_attributes` on
    # Project, with only `publication_status` (the rest is either derived
    # nested-set bookkeeping or tenant-wide publication scheduling state).
    # Listed here for completeness even though AdminPublication has no
    # dedicated yml_method.
    'AdminPublication' => %w[
      children_allowed first_published_at scheduled_status scheduled_at scheduled_by_id
      publication_id publication_type ordering parent_id
    ],

    'BasketsIdea' => %w[created_at updated_at], # join-table timestamps, not content

    'Comment' => %w[children_count], # rebuilt via counter cache

    'CustomField' => %w[
      logic constraints answer_visible_to other_option_text_multiloc
      min_characters max_characters
    ], # REVIEW (especially min_characters/max_characters — likely real gap)

    'CustomForm' => %w[
      fields_last_updated_at print_start_multiloc print_end_multiloc print_personal_data_fields
    ], # REVIEW (except fields_last_updated_at)

    'Event' => %w[maximum_attendees], # REVIEW

    'Idea' => %w[
      idea_status_id assignee_id assigned_at
      manual_votes_amount manual_votes_last_updated_by_id manual_votes_last_updated_at
      idea_trending_info_id
    ], # status/moderation/manual-vote operational state

    'Permission' => %w[
      verification_expiry access_denied_explanation_multiloc everyone_tracking_enabled
    ], # REVIEW (except verification_expiry)

    'Phase' => %w[
      manual_voters_amount manual_voters_last_updated_by_id manual_voters_last_updated_at
      allow_anonymous_participation voting_term_singular_multiloc voting_term_plural_multiloc
      similarity_threshold_title similarity_threshold_body
      similarity_enabled voting_filtering_enabled draft_description_multiloc
    ], # REVIEW (except manual_voters_* operational state)

    'Project' => %w[
      default_assignee_id preview_token
      header_bg_alt_text_multiloc listed track_participation_location
      first_published_at internal_role
    ], # REVIEW (except default_assignee_id, preview_token, internal_role)

    'ProjectImage' => %w[alt_text_multiloc], # REVIEW
    'EventImage' => %w[alt_text_multiloc], # REVIEW
    'IdeaImage' => %w[alt_text_multiloc], # REVIEW

    # User auth/session/role state — deliberately not exported (privacy/security)
    'User' => %w[
      roles last_active_at imported onboarding
      reset_password_token invite_status confirmation_required new_email token_expiry_key
      email_confirmed_at email_confirmation_code email_confirmation_retry_count
      email_confirmation_code_reset_count email_confirmation_code_sent_at
    ]
  }.freeze

  # Cache/derived columns with no shared concern or detectable convention, so they
  # have to be named. Kept global (not per-model) because they are pure caches that
  # are regenerated, never template content.
  REGENERATED_CACHE_COLUMNS = %w[weglot_data].freeze

  # Persisted models that intentionally have no `yml_<x>` method in ProjectCopyService,
  # keyed by reason.
  EXCLUDED_MODELS = {
    # The tenant itself and its global configuration — not project content.
    tenant_infrastructure: %w[Tenant AppConfiguration Space],

    # Analytics read models (the materialized/base-table ones; the view-backed
    # Analytics models are filtered out structurally). Derived from live data
    # and rebuilt downstream — never seeded from a project copy.
    analytics: %w[
      Analytics::DimensionDate Analytics::DimensionLocale Analytics::DimensionLocalesFactVisits
      Analytics::DimensionProjectsFactVisits Analytics::DimensionReferrerType
      Analytics::DimensionType Analytics::FactVisit
    ],

    # AI analysis, insights and embeddings — derived from user content.
    analysis: %w[
      Analysis::AdditionalCustomField Analysis::Analysis Analysis::BackgroundTask
      Analysis::CommentsSummary Analysis::HeatmapCell Analysis::Insight
      Analysis::Question Analysis::Summary Analysis::Tag Analysis::Tagging
      AuthoringAssistanceResponse EmbeddingsSimilarity
    ],

    # Tenant-wide taxonomies that aren't project-scoped. Project copy does
    # export `input_topic` (the project's own topic tree), not the global ones.
    tenant_taxonomy: %w[Area GlobalTopic DefaultInputTopic],

    # Groups / project membership — tenant-wide, not project-content.
    # `GroupsPermission` joins Group↔Permission: per-permission group lists;
    # since the groups themselves aren't carried over, the join isn't either.
    groups: %w[Group GroupsProject GroupsPermission Membership SmartGroups::Rules::CustomFieldDate],

    # Activity logs, telemetry and derived caches — runtime data, not content.
    tracking_and_caches: %w[
      Activity IdeaExposure ParticipationLocation
      ImpactTracking::Pageview ImpactTracking::Salt ImpactTracking::Session
      MachineTranslations::MachineTranslation ReportBuilder::PublishedGraphDataUnit
      Webhooks::Delivery Webhooks::Subscription
    ],

    # Per-user runtime objects regenerated through normal use.
    user_runtime: %w[Notification Onboarding::CampaignDismissal],

    # Background-job / queue infrastructure.
    jobs: %w[Jobs::Tracker Que::ActiveRecord::Model],

    # Authentication, identity, verification and anti-abuse — per-user/security
    # state, never carried over by a project copy.
    auth_and_security: %w[
      Identity Invite Verification::Verification ClaimToken EmailBan CommonPassword
      PublicApi::ApiClient IdIdCardLookup::IdCard
    ],

    # Moderation / spam / content flags — per-tenant runtime moderation state.
    moderation: %w[
      Moderation::ModerationStatus SpamReport
      FlagInappropriateContent::InappropriateContentFlag WiseVoiceFlag
    ],

    # Bulk imported metadata, including BulkImportIdeas::ProjectImport which
    # is *created by* import (not exported).
    import: %w[
      BulkImportIdeas::IdeaImport BulkImportIdeas::IdeaImportFile
      BulkImportIdeas::ProjectImport InvitesImport
    ],

    # Project folders — a project copy doesn't carry its parent folder.
    project_folders: %w[ProjectFolders::Folder ProjectFolders::File ProjectFolders::Image],

    # Idea moderation / review state — recreated on import as needed.
    idea_review: %w[IdeaStatus ProjectReview IdeaRelation IdeasTopic],

    # Survey responses — native survey responses are exported as ideas; this
    # is the (legacy/external) Surveys engine's response model.
    surveys: %w[Surveys::Response],

    # Email campaigns runtime — tenant-wide, not project-scoped.
    email_campaigns: %w[
      EmailCampaigns::Campaign EmailCampaigns::CampaignEmailCommand
      EmailCampaigns::CampaignsGroup EmailCampaigns::Consent EmailCampaigns::Delivery
      EmailCampaigns::Example EmailCampaigns::UnsubscriptionToken
      EmailSnippet
    ],

    # Reports — tenant-wide reporting state, not project content.
    reports: %w[ReportBuilder::Report],

    # Pages and the home page — tenant-wide CMS content, not project content.
    pages: %w[
      StaticPage StaticPageFile StaticPagesTopic StaticPagesGlobalTopic
      HomePage NavBarItem AreasProject AreasStaticPage IdeasInputTopic
    ],

    # Per-tenant admin moderation runtime (internal comments on ideas — not
    # part of project content surfaced to end users).
    admin_runtime: %w[InternalComment],

    # Experiment / AB-test runtime.
    experiments: %w[Experiment],

    # Representativeness reference distributions & custom-field value binning.
    representativeness: %w[CustomFieldBin UserCustomFields::Representativeness::RefDistribution],

    # Files engine — separate cross-resource attachments.
    files: %w[Files::File Files::FileAttachment Files::FilesProject Files::Preview Files::Transcript],

    # Map presets — tenant-wide map config defaults, not project-scoped.
    maps: %w[CustomMaps::MapPreset CustomMaps::LegendItem],

    # Polls anonymous responses — discardable, not exported.
    polls_responses: %w[Polls::Response Polls::ResponseOption],

    # Project descriptions - should be exported, but quite difficult to update all IDs etc
    project_descriptions: %w[ProjectDescriptionBuilder::Layout],

    # Inline nested-attribute models — exported indirectly as `_attributes`
    # on their parent. Column coverage for them is checked via IGNORED_COLUMNS
    # against the parent's nested keys.
    nested_attributes: %w[AdminPublication TextImage],

    # REVIEW: these look like they may belong in a project copy. Listed to
    # keep the baseline green pending a human decision on whether to export
    # them. `ProjectsGlobalTopic` and `Cosponsorship` are the most likely real
    # gaps; `PermissionsCustomField` is the per-permission custom-field link.
    review: %w[Cosponsorship PermissionsCustomField ProjectsGlobalTopic]
  }.freeze

  EXCLUDED_MODEL_NAMES = EXCLUDED_MODELS.values.flatten.to_set.freeze

  # Bookkeeping/cache columns detected by introspection — never template content,
  # so they're excluded globally rather than listed per model.
  # (Same logic as engines/commercial/multi_tenancy/.../serializer_coverage_spec.rb)
  def derived_columns(model)
    columns = [model.primary_key, model.inheritance_column]
    columns += model.reflect_on_all_associations(:belongs_to).select(&:polymorphic?).map(&:foreign_type)
    if model.respond_to?(:left_column_name)
      columns += [model.left_column_name, model.right_column_name, model.depth_column_name]
    end
    columns << (model.respond_to?(:slug_attribute) ? model.slug_attribute.to_s : 'slug') if model.respond_to?(:slug?) && model.slug?
    columns += %w[migrated_file_id migration_skipped_reason] if model.include?(FileMigratable)
    columns += model.column_names.grep(/_count\z/)
    columns += model.columns.select { |c| c.sql_type == 'tsvector' }.map(&:name)
    columns += model.columns.select { |c| c.sql_type.to_s.match?(/geometry|geography/) }.map(&:name)
    (columns.compact + REGENERATED_CACHE_COLUMNS).uniq
  end

  # Parse the service source file once. Returns a hash:
  #   { <model_key> => [<set of literal hash keys assigned anywhere in the yml_<x> method>] }
  # where <model_key> is the string passed to `@template['models'][<key>]`
  # (e.g. 'polls/question'). The yml method to scan is discovered from the
  # right-hand side of that assignment.
  def parse_export_source
    src = File.read(SERVICE_PATH)
    lines = src.lines

    # 1. Build export-key -> yml-method mapping. The `@template['models'][...]`
    #    pattern only appears inside `export`, so no block detection needed.
    export_to_method = {}
    src.scan(/@template\['models'\]\['([\w\/]+)'\][^=]*=\s*\S*\s*(yml_\w+)/) do |key, method|
      export_to_method[key] = method
    end

    # 2. Extract literal string keys assigned anywhere inside each yml_<x> method,
    #    and the names of any other yml_<y> methods it calls (so a method that
    #    delegates to a helper inherits the helper's keys).
    method_keys = Hash.new { |h, k| h[k] = [] }
    method_calls = Hash.new { |h, k| h[k] = [] }
    current_method = nil
    lines.each do |line|
      if (m = line.match(/^  def (yml_\w+)/))
        current_method = m[1]
      elsif current_method && line.match?(/^  end\s*$/)
        current_method = nil
      elsif current_method
        method_keys[current_method].concat(line.scan(/'(\w+)'\s*=>/).flatten)
        method_keys[current_method].concat(line.scan(/yml_\w+\['(\w+)'\]\s*=/).flatten)
        method_calls[current_method].concat(line.scan(/\byml_\w+\b/))
      end
    end

    # Resolve helper-method indirection: a yml_<x> method's covered keys are
    # its own literal keys plus those of every yml_<y> helper it calls
    # (transitively). Local vars named `yml_<x>` that happen to share a name
    # with a defined method are filtered out by the `method_keys.key?` check.
    resolved = Hash.new { |h, k| h[k] = [] }
    method_keys.each_key do |method|
      visited = Set.new
      stack = [method]
      until stack.empty?
        m = stack.pop
        next if visited.include?(m)

        visited << m
        resolved[method].concat(method_keys[m])
        method_calls[m].each { |callee| stack << callee if method_keys.key?(callee) && callee != m }
      end
    end
    resolved.each_value(&:uniq!)

    export_to_method.transform_values { |method| resolved[method] || [] }
  end

  # Translate the set of literal hash keys assigned by a yml_<x> method into
  # the set of model columns they cover.
  #
  #   '<x>_ref'         => column '<x>_id'         (polymorphic *_type is in derived_columns)
  #   'remote_<x>_url'  => column '<x>'             (CarrierWave mounted uploader)
  #   '<x>_attributes'  => skipped (nested association, not a column on this model)
  #   anything else     => exact column name
  def covered_columns_for(keys)
    keys.flat_map do |key|
      if key.end_with?('_ref')
        ["#{key.delete_suffix('_ref')}_id"]
      elsif key.start_with?('remote_') && key.end_with?('_url')
        [key.delete_prefix('remote_').delete_suffix('_url')]
      elsif key.end_with?('_attributes')
        []
      else
        [key]
      end
    end
  end

  it 'exports every column of every exported model (or explicitly ignores it)' do
    Rails.application.eager_load!
    report = {}

    parse_export_source.each do |model_key, keys|
      model = model_key.classify.safe_constantize
      next if model.nil? || !(model < ApplicationRecord)
      next unless ActiveRecord::Base.connection.tables.include?(model.table_name)

      covered = covered_columns_for(keys) + derived_columns(model) + IGNORED_COLUMNS.fetch(model.name, [])
      uncovered = model.column_names - covered
      report[model.name] = uncovered if uncovered.any?
    end

    message = report.map { |model, cols| "  #{model}: #{cols.join(', ')}" }.join("\n")
    expect(report).to(
      be_empty,
      "The following model columns are neither exported by ProjectCopyService#export, " \
      "detected as a derived/bookkeeping column, nor allowlisted in IGNORED_COLUMNS.\n" \
      "Either add them to the corresponding yml_<x> method in ProjectCopyService, " \
      "or add them to IGNORED_COLUMNS with a reason:\n#{message}"
    )
  end

  # Every model backed by a real DB table, collapsed to its STI base class.
  # DB views (`connection.tables` excludes them), table-less models, and
  # internal/auto-generated AR classes are skipped.
  def persisted_base_models
    Rails.application.eager_load!
    base_tables = ActiveRecord::Base.connection.tables.to_set
    ActiveRecord::Base.descendants
      .reject(&:abstract_class?)
      .reject { |m| m.name.to_s.start_with?('HABTM_', 'ActiveRecord::', 'ActiveStorage::') }
      .select { |m| base_tables.include?(m.table_name) }
      .reject { |m| defined_inside_job?(m) }
      .map(&:base_class)
      .uniq
  end

  # True for throwaway AR classes defined *inside* a job (e.g. a data-migration job
  # that re-maps an existing table via `self.table_name =` to bypass callbacks).
  def defined_inside_job?(model)
    namespaces = model.name.to_s.split('::')[0...-1]
    namespaces.length.downto(1).any? do |i|
      enclosing = namespaces[0...i].join('::').safe_constantize
      enclosing.is_a?(Class) && enclosing < ActiveJob::Base
    end
  end

  it 'exports every project-scoped model (or explicitly ignores it)' do
    exported_model_names = parse_export_source.keys.map { |k| k.classify }.to_set

    uncovered = persisted_base_models
      .reject { |m| exported_model_names.include?(m.name) || EXCLUDED_MODEL_NAMES.include?(m.name) }
      .map(&:name).sort

    expect(uncovered).to(
      be_empty,
      "The following persisted models are neither covered by ProjectCopyService#export " \
      "nor listed in EXCLUDED_MODELS.\nDecide whether each belongs in a project copy: " \
      "add a yml_<x> method (and wire it into ProjectCopyService#export), or add it " \
      "to EXCLUDED_MODELS with a reason:\n  #{uncovered.join("\n  ")}"
    )
  end
end
