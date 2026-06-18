# frozen_string_literal: true

require 'rails_helper'

# This spec guards against silent data loss in tenant template export/import
# Each templated model has a serializer under
# MultiTenancy::Templates::Serializers. There are two examples:
#
#   1. Column coverage — for every model that HAS a serializer, every column is
#      serialized, detected as a derived/bookkeeping column, or allowlisted in
#      `ignored_columns`. Catches "added a column but forgot to serialize it".
#
#   2. Model coverage — every persisted model either HAS a serializer or is listed
#      in `excluded_models` with a reason. Catches "added a model that should be
#      templated but isn't" (and forces a conscious decision for every new model).
#
# Two layers of exclusion (for example 1):
#   - `derived_columns` (below) drops bookkeeping/cache columns that are never
#     content (primary keys, STI discriminators, polymorphic `*_type`, nested-set
#     `lft`/`rgt`/`depth`, counter caches, slugs, geo points, search vectors, ...).
#     These are detected by introspection so they never need per-model listing.
#   - `ignored_columns` holds the remaining *real* columns a model deliberately does
#     not template (operational/auth state, etc.). Because the derived layer
#     handles the noise, anything left here is a genuine, reviewable decision.

describe 'Tenant template serializer coverage' do # rubocop:disable RSpec/DescribeClass
  # Real (non-derived) columns that are intentionally not carried over by the
  # tenant serializers, keyed by model name. Every entry is a deliberate product
  # decision; `# REVIEW` marks fields that look like they might actually belong in
  # the template (the bug class this spec exists to catch) — allowlisted for now to
  # keep the baseline green, pending a human call. See TAN-7832.
  let(:ignored_columns) do
    {
      'AdminPublication' => %w[
        children_allowed
        first_published_at
        scheduled_at
        scheduled_by_id
        scheduled_status
      ], # publication scheduling / operational state

      'CustomField' => %w[
        logic
      ], # Logic cannot be easily serialized

      'CustomForm' => %w[
        fields_last_updated_at
      ], # bookkeeping timestamp; the form's print settings are serialized

      'DefaultInputTopic' => %w[
        parent_id
      ], # flat list; default topics carry no hierarchy

      'Idea' => %w[
        assigned_at
        assignee_id
        manual_votes_amount
        manual_votes_last_updated_at
        manual_votes_last_updated_by_id
      ], # moderation / manual-vote operational state

      'Phase' => %w[
        manual_voters_amount
        manual_voters_last_updated_at
        manual_voters_last_updated_by_id
      ], # manual-vote operational state

      'Project' => %w[
        default_assignee_id
        preview_token
      ], # admin reference / regenerated token

      'User' => %w[
        block_end_at
        confirmation_required
        email_confirmed_at
        imported
        invite_status
        last_active_at
        new_email
        onboarding
        reset_password_token
        roles
        token_expiry_key
      ] # auth/session/role state — deliberately not templated (privacy/security)
    }.freeze
  end

  # Persisted models that intentionally have no tenant serializer, keyed by reason
  let(:excluded_models) do
    {
      # The tenant itself and its global configuration — not in-tenant content.
      tenant_infrastructure: %w[
        AppConfiguration
        Tenant
      ],

      # Analytics read models (the materialized/base-table ones; the view-backed
      # Analytics models are filtered out structurally). Derived from live data and
      # rebuilt downstream — never seeded from a template.
      analytics: %w[
        Analytics::DimensionDate
        Analytics::DimensionLocale
        Analytics::DimensionLocalesFactVisits
        Analytics::DimensionProjectsFactVisits
        Analytics::DimensionReferrerType
        Analytics::DimensionType
        Analytics::FactVisit
      ],

      # AI analysis, insights and embeddings — derived from user content.
      analysis: %w[
        Analysis::AdditionalCustomField
        Analysis::Analysis
        Analysis::BackgroundTask
        Analysis::CommentsSummary
        Analysis::HeatmapCell
        Analysis::Insight
        Analysis::Question
        Analysis::Summary
        Analysis::Tag
        Analysis::Tagging
        AuthoringAssistanceResponse
        EmbeddingsSimilarity
      ],

      # Generated or imported participation content
      participation: %w[
        IdeaRelation
        Surveys::Response
      ],

      # Activity logs, telemetry and derived caches — runtime data, not content.
      tracking_and_caches: %w[
        Activity
        IdeaExposure
        ImpactTracking::Pageview
        ImpactTracking::Salt
        ImpactTracking::Session
        MachineTranslations::MachineTranslation
        ParticipationLocation
        ReportBuilder::PublishedGraphDataUnit
        Webhooks::Delivery
        Webhooks::Subscription
      ],

      # Per-user runtime objects regenerated through normal use.
      user_runtime: %w[
        Notification
        Onboarding::CampaignDismissal
      ],

      # Background-job / queue infrastructure.
      jobs: %w[
        Jobs::Tracker
        Que::ActiveRecord::Model
      ],

      # Authentication, identity, verification and anti-abuse — per-user / security
      # state, deliberately not templated.
      auth_and_security: %w[
        ClaimToken
        CommonPassword
        Confirmation
        CustomIdMethods::IdCardLookup::IdCard
        Doorkeeper::AccessGrant
        Doorkeeper::AccessToken
        EmailBan
        Identity
        Invite
        PublicApi::ApiClient
        Verification::Verification
      ],

      # Moderation / spam / content flags — per-tenant runtime moderation state.
      moderation: %w[
        FlagInappropriateContent::InappropriateContentFlag
        Moderation::ModerationStatus
        SpamReport
        WiseVoiceFlag
      ],

      # Bulk imported metadata
      import: %w[
        BulkImportIdeas::IdeaImport
        BulkImportIdeas::IdeaImportFile
        BulkImportIdeas::ProjectImport
        InvitesImport
      ],

      # Email-campaign runtime (deliveries, consents, queued commands, examples).
      email_runtime: %w[
        EmailCampaigns::CampaignEmailCommand
        EmailCampaigns::Delivery
        EmailCampaigns::Example
      ],

      # Experiment / AB-test runtime.
      experiments: %w[
        Experiment
      ],

      # Representativeness reference distributions & custom-field value binning (analytics).
      representativeness: %w[
        CustomFieldBin
        UserCustomFields::Representativeness::RefDistribution
      ],

      # Files
      files: %w[
        Files::File
        Files::FileAttachment
        Files::FilesProject
        Files::Preview
        Files::Transcript
      ],

      # REVIEW: these look like they may belong in tenant templates. Listed to keep
      # the baseline green pending a human decision on whether to serialize them.
      review: %w[
        EmailCampaigns::CampaignsGroup
        EmailCampaigns::Consent
        ProjectReview
        ProjectsGlobalTopic
      ]
    }.freeze
  end
  let(:excluded_model_names) { excluded_models.values.flatten.to_set.freeze }

  # Cache/derived columns excluded from coverage checks across ALL models.
  # `*_count` matches any column ending in `_count`
  let(:ignored_cache_columns) do
    %w[
      *_count
      weglot_data
    ].freeze
  end

  def cache_columns_for(model)
    model.column_names.select do |col|
      ignored_cache_columns.any? { |pat| pat.start_with?('*') ? col.end_with?(pat[1..]) : col == pat }
    end
  end

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

    # Full-text search vectors (`*_tsvector`) — sql_type-detected.
    columns += model.columns.select { |c| c.sql_type == 'tsvector' }.map(&:name)

    # Derived geo columns (PostGIS point/geometry) — computed from the `*_geojson` value.
    columns += model.columns.select { |c| c.sql_type.to_s.match?(/geometry|geography/) }.map(&:name)

    # Name-based caches (counter caches `*_count`, weglot translation caches, ...).
    (columns.compact + cache_columns_for(model)).uniq
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

      ignored = covered_columns(serializer_class) + derived_columns(model) + ignored_columns.fetch(model.name, [])
      uncovered = model.column_names - ignored

      report[model.name] = uncovered if uncovered.any?
    end

    message = report.map { |model, cols| " - #{model}: #{cols.join(', ')}" }.join("\n")
    expect(report).to(
      be_empty,
      "The following model columns are neither neither serialized in a template nor added to `ignored_columns` in this spec.\n#{message}"
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
      .reject { |m| defined_inside_throwaway?(m) }
      .map(&:base_class)
      .uniq
  end

  # True for throwaway AR classes defined *inside* a job or migration (e.g. a
  # data-migration job/migration that re-maps an existing table via
  # `self.table_name =` to bypass callbacks). These aren't domain models — the
  # real model owning the table is enumerated separately — so they're skipped
  # structurally rather than allowlisted by name.
  def defined_inside_throwaway?(model)
    namespaces = model.name.to_s.split('::')[0...-1]
    namespaces.length.downto(1).any? do |i|
      enclosing = namespaces[0...i].join('::').safe_constantize
      enclosing.is_a?(Class) && (enclosing < ActiveJob::Base || enclosing < ActiveRecord::Migration)
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
      .reject { |m| serializer_defined_for?(m) || excluded_model_names.include?(m.name) }
      .map(&:name).sort

    message = uncovered.map { |name| " - #{name}" }.join("\n")
    expect(uncovered).to(
      be_empty,
      "The following persisted models are neither neither serialized in a template nor added to `excluded_models` in this spec.\n#{message}"
    )
  end

  # Stale-entry guard: catches `ignored_columns` rows where the model has been
  # renamed/removed, the column no longer exists, OR the column is in fact
  # serialized/derived (redundant entry that pretends a real gap exists).
  it 'has no stale or redundant entries in `ignored_columns`' do
    Rails.application.eager_load!
    problems = []

    ignored_columns.each do |model_name, columns|
      model = model_name.safe_constantize
      unless model.is_a?(Class) && model < ActiveRecord::Base
        problems << "#{model_name}: not an ActiveRecord model"
        next
      end

      serializer = begin
        MultiTenancy::Templates::Serializers.const_get(model_name, false)
      rescue NameError
        nil
      end
      covered = (serializer ? covered_columns(serializer) : []).to_set
      derived = derived_columns(model).to_set
      actual = model.column_names.to_set

      columns.each do |col|
        if actual.exclude?(col)
          problems << "#{model_name}: '#{col}' is not a column on the model"
        elsif covered.include?(col)
          problems << "#{model_name}: '#{col}' is already serialized (remove from `ignored_columns`)"
        elsif derived.include?(col)
          problems << "#{model_name}: '#{col}' is a derived/bookkeeping column (remove from `ignored_columns`)"
        end
      end
    end

    expect(problems).to(
      be_empty,
      "Stale or redundant `ignored_columns` entries:\n#{problems.map { |p| " - #{p}" }.join("\n")}"
    )
  end

  # Stale-entry guard: catches `excluded_models` rows where the model has been
  # renamed/removed, OR where the model actually has a tenant serializer
  # (redundant entry).
  it 'has no stale or redundant entries in `excluded_models`' do
    Rails.application.eager_load!
    problems = []

    excluded_model_names.each do |model_name|
      model = model_name.safe_constantize
      unless model.is_a?(Class) && model < ActiveRecord::Base
        problems << "#{model_name}: not an ActiveRecord model"
        next
      end

      if serializer_defined_for?(model)
        problems << "#{model_name}: has a tenant serializer (remove from `excluded_models`)"
      end
    end

    expect(problems).to(
      be_empty,
      "Stale or redundant `excluded_models` entries:\n#{problems.map { |p| " - #{p}" }.join("\n")}"
    )
  end
end
