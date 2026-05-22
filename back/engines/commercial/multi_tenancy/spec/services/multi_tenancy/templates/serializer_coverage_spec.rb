# frozen_string_literal: true

require 'rails_helper'

# This spec guards against silent data loss in tenant template export/import
# (and tenant cloning). Each templated model has a serializer under
# MultiTenancy::Templates::Serializers. There are two examples:
#
#   1. Column coverage — for every model that HAS a serializer, every column is
#      serialized, detected as a derived/bookkeeping column, or allowlisted in
#      IGNORED_COLUMNS. Catches "added a column but forgot to serialize it".
#
#   2. Model coverage — every persisted model either HAS a serializer or is listed
#      in EXCLUDED_MODELS with a reason. Catches "added a model that should be
#      templated but isn't" (and forces a conscious decision for every new model).
#
# Two layers of exclusion (for example 1):
#   - `derived_columns` (below) drops bookkeeping/cache columns that are never
#     content (primary keys, STI discriminators, polymorphic `*_type`, nested-set
#     `lft`/`rgt`/`depth`, counter caches, slugs, geo points, search vectors, ...).
#     These are detected by introspection so they never need per-model listing.
#   - IGNORED_COLUMNS holds the remaining *real* columns a model deliberately does
#     not template (operational/auth state, etc.). Because the derived layer
#     handles the noise, anything left here is a genuine, reviewable decision.
describe 'Tenant template serializer coverage' do
  # Real (non-derived) columns that are intentionally not carried over by the
  # tenant serializers, keyed by model name. Every entry is a deliberate product
  # decision; `# REVIEW` marks fields that look like they might actually belong in
  # the template (the bug class this spec exists to catch) — allowlisted for now to
  # keep the baseline green, pending a human call. See TAN-7832.
  IGNORED_COLUMNS = {
    'AdminPublication' => %w[
      children_allowed first_published_at scheduled_status scheduled_at scheduled_by_id
    ], # publication scheduling / operational state
    'Area' => %w[custom_field_option_id include_in_onboarding], # REVIEW
    'CustomField' => %w[hidden logic], # REVIEW
    'CustomForm' => %w[
      fields_last_updated_at print_start_multiloc print_end_multiloc print_personal_data_fields
    ], # REVIEW (except fields_last_updated_at)
    'DefaultInputTopic' => %w[parent_id], # flat list; default topics carry no hierarchy
    'Event' => %w[
      address_1 address_2_multiloc online_link attend_button_multiloc using_url maximum_attendees
    ], # REVIEW
    'GlobalTopic' => %w[include_in_onboarding], # REVIEW
    'Idea' => %w[
      assignee_id assigned_at
      manual_votes_amount manual_votes_last_updated_by_id manual_votes_last_updated_at
    ], # moderation / manual-vote operational state
    'Permission' => %w[
      verification_expiry access_denied_explanation_multiloc everyone_tracking_enabled
      user_fields_in_form user_data_collection
    ], # REVIEW (except verification_expiry)
    'Phase' => %w[
      manual_voters_amount manual_voters_last_updated_by_id manual_voters_last_updated_at
      allow_anonymous_participation voting_term_singular_multiloc voting_term_plural_multiloc
      similarity_threshold_title similarity_threshold_body survey_popup_frequency
      similarity_enabled voting_filtering_enabled available_views draft_description_multiloc
    ], # REVIEW (except manual_voters_* operational state)
    'Project' => %w[
      default_assignee_id preview_token
      header_bg_alt_text_multiloc listed track_participation_location live_auto_input_topics_enabled
    ], # REVIEW (except default_assignee_id, preview_token)
    'ProjectImage' => %w[alt_text_multiloc], # REVIEW
    'EventImage' => %w[alt_text_multiloc], # REVIEW
    'User' => %w[
      roles last_active_at imported onboarding
      reset_password_token invite_status confirmation_required block_end_at new_email token_expiry_key
      email_confirmed_at email_confirmation_code email_confirmation_retry_count
      email_confirmation_code_reset_count email_confirmation_code_sent_at
    ], # auth/session/role state — deliberately not templated (privacy/security)
    'EmailCampaigns::Campaign' => %w[
      reply_to schedule title_multiloc intro_multiloc button_text_multiloc
    ], # REVIEW
    'ProjectFolders::Folder' => %w[header_bg_alt_text_multiloc], # REVIEW
    'ProjectFolders::Image' => %w[alt_text_multiloc], # REVIEW
    'ReportBuilder::Report' => %w[year quarter community_monitor] # REVIEW
  }.freeze

  # Cache/derived columns with no shared concern or detectable convention, so they
  # have to be named. Kept global (not per-model) because they are pure caches that
  # are regenerated, never template content.
  REGENERATED_CACHE_COLUMNS = %w[weglot_data].freeze

  # Persisted models that intentionally have no tenant serializer, keyed by reason
  EXCLUDED_MODELS = {
    # The tenant itself and its global configuration — not in-tenant content.
    tenant_infrastructure: %w[Tenant AppConfiguration],

    # Analytics read models (the materialized/base-table ones; the view-backed
    # Analytics models are filtered out structurally). Derived from live data and
    # rebuilt downstream — never seeded from a template.
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

    # Generated or imported participation content
    participation: %w[IdeaRelation Surveys::Response],

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

    # Authentication, identity, verification and anti-abuse — per-user / security
    # state, deliberately not templated.
    auth_and_security: %w[
      Identity Invite Verification::Verification ClaimToken EmailBan CommonPassword
      PublicApi::ApiClient IdIdCardLookup::IdCard
    ],

    # Moderation / spam / content flags — per-tenant runtime moderation state.
    moderation: %w[
      Moderation::ModerationStatus SpamReport
      FlagInappropriateContent::InappropriateContentFlag WiseVoiceFlag
    ],

    # Bulk imported metadata
    import: %w[
      BulkImportIdeas::IdeaImport BulkImportIdeas::IdeaImportFile
      BulkImportIdeas::ProjectImport InvitesImport
    ],

    # Email-campaign runtime (deliveries, consents, queued commands, examples).
    email_runtime: %w[
      EmailCampaigns::CampaignEmailCommand
      EmailCampaigns::Delivery EmailCampaigns::Example
    ],

    # Experiment / AB-test runtime.
    experiments: %w[Experiment],

    # Representativeness reference distributions & custom-field value binning (analytics).
    representativeness: %w[CustomFieldBin UserCustomFields::Representativeness::RefDistribution],

    # Files
    files: %w[Files::File Files::FileAttachment Files::FilesProject Files::Preview Files::Transcript],

    # REVIEW: these look like they may belong in tenant templates. Listed to keep
    # the baseline green pending a human decision on whether to serialize them.
    # What even is EmailSnippet??? Very old model
    review: %w[
      EmailCampaigns::Consent
      EmailCampaigns::CampaignsGroup
      CustomFieldMatrixStatement
      EmailSnippet
      ProjectReview
    ]
  }.freeze

  EXCLUDED_MODEL_NAMES = EXCLUDED_MODELS.values.flatten.to_set.freeze

  # Bookkeeping/cache columns detected by introspection — never template content,
  # so they're excluded globally rather than listed per model.
  def derived_columns(model)
    columns = [model.primary_key, model.inheritance_column]

    # Polymorphic `*_type` columns — reconstructed alongside the matching `*_ref`.
    columns += model.reflect_on_all_associations(:belongs_to).select(&:polymorphic?).map(&:foreign_type)

    # Nested-set bookkeeping (awesome_nested_set) — rebuilt on insert.
    if model.respond_to?(:left_column_name)
      columns += [model.left_column_name, model.right_column_name, model.depth_column_name]
    end

    # Slug — regenerated from title/name via the Sluggable concern.
    columns << (model.respond_to?(:slug_attribute) ? model.slug_attribute.to_s : 'slug') if model.respond_to?(:slug?) && model.slug?

    # File-migration bookkeeping (FileMigratable concern).
    columns += %w[migrated_file_id migration_skipped_reason] if model.include?(FileMigratable)

    # Counter caches (`*_count`) and full-text search vectors (`*_tsvector`).
    columns += model.column_names.grep(/_count\z/)
    columns += model.columns.select { |c| c.sql_type == 'tsvector' }.map(&:name)

    # Derived geo columns (PostGIS point/geometry) — computed from the `*_geojson` value.
    columns += model.columns.select { |c| c.sql_type.to_s.match?(/geometry|geography/) }.map(&:name)

    (columns.compact + REGENERATED_CACHE_COLUMNS).uniq
  end

  def serializer_classes
    Rails.application.eager_load!
    MultiTenancy::Templates::Serializers::Base.descendants
  end

  def model_for(serializer_class)
    serializer_class.name.delete_prefix('MultiTenancy::Templates::Serializers::').safe_constantize
  end

  def covered_columns(serializer_class)
    refs = serializer_class.reference_attributes.to_a.map { |r| "#{r}_id" }
    values = serializer_class.value_attributes.to_a.map { |a| a.name.to_s }
    (refs + values).uniq
  end

  it 'serialized every column of every templated model (or explicitly ignores it)' do
    report = {}

    serializer_classes.each do |serializer_class|
      model = model_for(serializer_class)
      next if model.nil? || !(model < ApplicationRecord)
      next unless model.table_exists?

      ignored = covered_columns(serializer_class) + derived_columns(model) + IGNORED_COLUMNS.fetch(model.name, [])
      uncovered = model.column_names - ignored

      report[model.name] = uncovered if uncovered.any?
    end

    message = report.map { |model, cols| "  #{model}: #{cols.join(', ')}" }.join("\n")
    expect(report).to(
      be_empty,
      "The following model columns are neither serialized, detected as a derived/" \
      "bookkeeping column, nor allowlisted in IGNORED_COLUMNS.\nEither add them to " \
      "the corresponding tenant serializer AND add a corresponding spec to tenant_serializer_spec.rb, " \
      "or add them to IGNORED_COLUMNS with a reason:\n#{message}"
    )
  end

  # Every model backed by a real DB table, collapsed to its STI base class (the unit
  # at which a serializer is defined). DB views (`connection.tables` excludes them),
  # table-less models, and internal/auto-generated AR classes are all skipped — a
  # view holds no data of its own, so it can never be templated.
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
  # These aren't domain models — the real model owning the table is enumerated
  # separately — so they're skipped structurally rather than allowlisted by name.
  def defined_inside_job?(model)
    namespaces = model.name.to_s.split('::')[0...-1]
    namespaces.length.downto(1).any? do |i|
      enclosing = namespaces[0...i].join('::').safe_constantize
      enclosing.is_a?(Class) && enclosing < ActiveJob::Base
    end
  end

  # Mirrors TenantSerializer's lookup (`Serializers.const_get(record_class.name)`),
  # but with inherit=false so top-level constants (e.g. ::Tenant) don't leak in.
  def serializer_defined_for?(model)
    MultiTenancy::Templates::Serializers.const_get(model.name, false).is_a?(Class)
  rescue NameError
    false
  end

  it 'serializes every persisted model (or explicitly ignores it)' do
    uncovered = persisted_base_models
      .reject { |m| serializer_defined_for?(m) || EXCLUDED_MODEL_NAMES.include?(m.name) }
      .map(&:name).sort

    expect(uncovered).to(
      be_empty,
      "The following persisted models are neither covered by a tenant serializer " \
      "nor listed in EXCLUDED_MODELS.\nDecide whether each belongs in tenant templates: " \
      "add a serializer (and wire it into TenantSerializer#serialize_models), or add it " \
      "to EXCLUDED_MODELS with a reason:\n  #{uncovered.join("\n  ")}"
    )
  end
end
