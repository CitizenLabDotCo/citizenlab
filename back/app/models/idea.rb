# frozen_string_literal: true

# == Schema Information
#
# Table name: ideas
#
#  id                              :uuid             not null, primary key
#  title_multiloc                  :jsonb
#  body_multiloc                   :jsonb
#  publication_status              :string
#  published_at                    :datetime
#  project_id                      :uuid
#  author_id                       :uuid
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#  likes_count                     :integer          default(0), not null
#  dislikes_count                  :integer          default(0), not null
#  location_point                  :geography        point, 4326
#  location_description            :string
#  comments_count                  :integer          default(0), not null
#  idea_status_id                  :uuid
#  slug                            :string
#  budget                          :integer
#  baskets_count                   :integer          default(0), not null
#  official_feedbacks_count        :integer          default(0), not null
#  assignee_id                     :uuid
#  assigned_at                     :datetime
#  proposed_budget                 :integer
#  custom_field_values             :jsonb            not null
#  creation_phase_id               :uuid
#  author_hash                     :string
#  anonymous                       :boolean          default(FALSE), not null
#  internal_comments_count         :integer          default(0), not null
#  votes_count                     :integer          default(0), not null
#  followers_count                 :integer          default(0), not null
#  submitted_at                    :datetime
#  manual_votes_amount             :integer
#  manual_votes_last_updated_by_id :uuid
#  manual_votes_last_updated_at    :datetime
#  neutral_reactions_count         :integer          default(0), not null
#
# Indexes
#
#  index_ideas_on_author_hash                      (author_hash)
#  index_ideas_on_author_id                        (author_id)
#  index_ideas_on_idea_status_id                   (idea_status_id)
#  index_ideas_on_location_point                   (location_point) USING gist
#  index_ideas_on_manual_votes_last_updated_by_id  (manual_votes_last_updated_by_id)
#  index_ideas_on_project_id                       (project_id)
#  index_ideas_on_slug                             (slug) UNIQUE
#  index_ideas_search                              (((to_tsvector('simple'::regconfig, COALESCE((title_multiloc)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((body_multiloc)::text, ''::text))))) USING gin
#
# Foreign Keys
#
#  fk_rails_...  (assignee_id => users.id)
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (creation_phase_id => phases.id)
#  fk_rails_...  (idea_status_id => idea_statuses.id)
#  fk_rails_...  (manual_votes_last_updated_by_id => users.id)
#  fk_rails_...  (project_id => projects.id)
#
class Idea < ApplicationRecord
  include PgSearch::Model
  include GeoJsonHelpers
  include AnonymousParticipation
  extend OrderAsSpecified

  PUBLICATION_STATUSES = %w[draft submitted published].freeze
  SUBMISSION_STATUSES = %w[submitted published].freeze

  slug from: proc { |idea| idea.participation_method_on_creation.generate_slug(idea) }

  belongs_to :author, class_name: 'User', optional: true
  belongs_to :project, touch: true
  belongs_to :creation_phase, class_name: 'Phase', optional: true
  belongs_to :idea_status, optional: true

  counter_culture :idea_status, touch: true
  counter_culture(
    :project,
    column_name: proc { |idea| idea.publication_status == 'published' ? 'ideas_count' : nil },
    column_names: {
      ['ideas.publication_status = ?', 'published'] => 'ideas_count'
    },
    touch: true
  )

  counter_culture(
    :project,
    column_name: 'comments_count',
    delta_magnitude: proc { |idea| idea.comments_count }
  )

  # Must appear before before_destroy
  before_save :convert_wkt_geo_custom_field_values_to_geojson
  after_update :fix_comments_count_on_projects

  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :manual_votes_last_updated_by, class_name: 'User', optional: true

  has_many :activities, as: :item

  has_many :comments, dependent: :destroy
  has_many :internal_comments, dependent: :destroy

  has_many :reactions, as: :reactable, dependent: :destroy
  has_many :likes, -> { where(mode: 'up') }, as: :reactable, class_name: 'Reaction', inverse_of: :reactable
  has_many :dislikes, -> { where(mode: 'down') }, as: :reactable, class_name: 'Reaction', inverse_of: :reactable
  has_one :user_reaction, ->(user_id) { where(user_id: user_id) }, as: :reactable, class_name: 'Reaction', inverse_of: :reactable

  has_many :spam_reports, as: :spam_reportable, class_name: 'SpamReport', dependent: :destroy

  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  has_many :ideas_topics, dependent: :destroy
  has_many :topics, -> { order(:ordering) }, through: :ideas_topics
  has_many :ideas_phases, dependent: :destroy
  has_many :phases, through: :ideas_phases, after_add: :update_phase_counts, after_remove: :update_phase_counts
  has_many :baskets_ideas, dependent: :destroy
  has_many :baskets, through: :baskets_ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  has_many :followers, as: :followable, dependent: :destroy
  has_many :official_feedbacks, dependent: :destroy

  has_many :cosponsorships, dependent: :destroy
  has_many :cosponsors, through: :cosponsorships, source: :user

  has_many :idea_images, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_many :idea_files, -> { order(:ordering) }, dependent: :destroy, inverse_of: :idea
  has_one :idea_trending_info
  has_many :embeddings_similarities, as: :embeddable, dependent: :destroy
  has_many :authoring_assistance_responses, dependent: :destroy

  has_many :related_ideas, through: :related_idea_associations
  has_many :related_idea_associations, class_name: 'RelatedIdea', dependent: :destroy

  accepts_nested_attributes_for :text_images, :idea_images, :idea_files

  with_options unless: :draft? do |post|
    post.before_validation :strip_title
    post.after_validation :set_submitted_at, if: ->(record) { record.submitted_or_published? && record.publication_status_changed? }
    post.after_validation :set_published_at, if: ->(record) { record.published? && record.publication_status_changed? }
    post.after_validation :set_assigned_at, if: ->(record) { record.assignee_id && record.assignee_id_changed? }
  end

  validates :publication_status, presence: true, inclusion: { in: PUBLICATION_STATUSES }

  validates :title_multiloc, presence: true, multiloc: { presence: true }, if: :title_multiloc_required?
  validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }, if: :body_multiloc_required?
  validates :proposed_budget, numericality: { greater_than_or_equal_to: 0, if: :proposed_budget }

  validate :validate_creation_phase
  validate :not_published_in_non_public_status
  validates :manual_votes_amount, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }

  # validates :custom_field_values, json: {
  #   schema: :schema_for_validation,
  # }

  with_options unless: :draft? do
    validates :idea_status, presence: true
    validates :project, presence: true
    before_validation :assign_defaults
    before_validation :sanitize_body_multiloc, if: :body_multiloc
  end

  pg_search_scope :search_by_all,
    against: %i[title_multiloc body_multiloc custom_field_values slug],
    using: { tsearch: { prefix: true } }

  pg_search_scope :restricted_search,
    against: %i[title_multiloc body_multiloc slug],
    using: { tsearch: { prefix: true } }

  pg_search_scope :search_any_word,
    against: %i[title_multiloc body_multiloc],
    using: { tsearch: { any_word: true } }

  # Note from: https://github.com/Casecommons/pg_search
  # > Searching through associations
  # > It is possible to search columns on associated models. Note that if you do this,
  # > it will be impossible to speed up searches with database indexes. However, it
  # > is supported as a quick way to try out cross-model searching.

  scope :with_some_topics, (proc do |topics|
    ideas = joins(:ideas_topics).where(ideas_topics: { topic: topics })
    where(id: ideas)
  end)

  scope :in_phase, (proc do |phase_id|
    joins(:ideas_phases)
      .where(ideas_phases: { phase_id: phase_id })
  end)

  scope :with_project_publication_status, (proc do |publication_status|
    joins(project: [:admin_publication])
      .where(projects: { admin_publications: { publication_status: publication_status } })
  end)

  scope :order_new, ->(direction = :desc) { order(published_at: direction) }
  scope :order_random, lambda { |user|
    hash_part_for_today_and_user = Time.zone.today.to_s + user&.id.to_s
    order(Arel.sql("md5(concat(#{table_name}.id, '#{hash_part_for_today_and_user}'))"))
  }
  scope :order_author_name, lambda { |direction = :desc|
    includes(:author).order('users.first_name' => direction, 'users.last_name' => direction)
  }

  scope :order_popular, ->(direction = :desc) { order(Arel.sql("(likes_count - dislikes_count) #{direction}, ideas.id")) }
  # based on https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d

  scope :order_status, lambda { |direction = :desc|
    joins(:idea_status)
      .order("idea_statuses.ordering #{direction}, ideas.id")
  }

  scope :activity_after, lambda { |time_ago|
    ideas = left_joins(:comments, :reactions)
      .where('ideas.updated_at >= ? OR comments.updated_at >= ? OR reactions.created_at >= ?', time_ago, time_ago, time_ago)
    where(id: ideas)
  }

  scope :feedback_needed, lambda {
    scope = joins(:idea_status)
    scope.where(idea_statuses: { code: 'proposed' })
      .where('ideas.id NOT IN (SELECT DISTINCT(idea_id) FROM official_feedbacks)')
      .or(scope.where(idea_statuses: { code: 'threshold_reached' }))
  }

  scope :publicly_visible, lambda {
    where_pmethod(&:supports_public_visibility?)
  }

  scope :transitive, lambda { |transitive = true|
    transitive ? where(creation_phase: nil) : where.not(creation_phase: nil)
  }

  scope :native_survey, -> { where(creation_phase: Phase.where(participation_method: 'native_survey')) } # TODO: Delete
  scope :draft_surveys, lambda { # TODO: Delete
    native_survey.where(publication_status: 'draft')
  }

  # Equivalent to pmethod.supports_survey_form?
  scope :supports_survey, -> { where(creation_phase: Phase.where(participation_method: %w[native_survey community_monitor_survey])) }

  # Filters out all the ideas for which the ParticipationMethod responds truety
  # to the given block. The block receives the ParticipationMethod object as an
  # argument
  def self.where_pmethod(&)
    all_pmethods = ParticipationMethod::Base.all_methods.map { |m| m.new(nil) }
    truety_pmethods = all_pmethods.select(&)
    truety_method_strs = truety_pmethods.map { |pmethod| pmethod.class.method_str }
    result = where(creation_phase: Phase.where(participation_method: truety_method_strs))
    if truety_pmethods.find(&:transitive?)
      result.or(where(creation_phase: nil))
    else
      result
    end
  end

  scope :with_status_code, lambda { |code|
    joins(:idea_status).where(idea_statuses: { code: code })
  }

  # Is the performance of this code okay? We currently have no other data source for status changes
  scope :with_status_transitioned_after, lambda { |time|
    idea_ids = Activity.where(item_type: 'Idea', action: 'changed_status', created_at: time..).pluck(:item_id)
    where(id: idea_ids)
  }

  scope :with_bounding_box, (proc do |coordinates|
    x1, y1, x2, y2 = JSON.parse(coordinates)
    where('ST_Intersects(ST_MakeEnvelope(?, ?, ?, ?), location_point)', x1, y1, x2, y2)
  end)

  scope :draft, -> { where(publication_status: 'draft') }
  scope :published, -> { where publication_status: 'published' }
  scope :submitted_or_published, -> { where publication_status: SUBMISSION_STATUSES }

  def just_submitted?
    # It would be better to foresee separate endpoints for submission,
    # rather than relying on Rails dirty to detect publication.
    from, to = publication_status_previous_change
    SUBMISSION_STATUSES.exclude?(from) && SUBMISSION_STATUSES.include?(to)
  end

  def just_published?
    # It would be better to foresee separate endpoints for publication,
    # rather than relying on Rails dirty to detect publication.
    from, to = publication_status_previous_change
    from != 'published' && to == 'published'
  end

  def will_be_submitted?
    from, to = publication_status_change
    from != 'submitted' && to == 'submitted'
  end

  def will_be_published?
    # It would be better to foresee separate endpoints for publication,
    # rather than relying on Rails dirty to detect publication.
    from, to = publication_status_change
    from != 'published' && to == 'published'
  end

  def consultation_context
    creation_phase || project
  end

  def creation_phase_with_fallback
    # This method could be used for migrating existing data when
    # we would want to set the creation_phase for all existing
    # ideation inputs.
    creation_phase || phases.first || project.phases.where(participation_method: 'ideation').first || project.phases.first
  end

  def custom_form
    consultation_context.custom_form || CustomForm.new(participation_context: consultation_context)
  end

  def input_term
    if participation_method_on_creation.transitive?
      transitive_input_term
    else
      creation_phase.input_term
    end
  end

  def participation_method_on_creation
    consultation_context.pmethod
  end

  def assign_defaults
    participation_method_on_creation.assign_defaults self
  end

  def total_votes(phase)
    Factory.instance.voting_method_for(phase).votes_for_idea(self) + (manual_votes_amount || 0)
  end

  def set_manual_votes(amount, user)
    return if amount == manual_votes_amount

    self.manual_votes_amount = amount
    self.manual_votes_last_updated_by = user if user
    self.manual_votes_last_updated_at = Time.now
  end

  def draft?
    publication_status == 'draft'
  end

  def submitted_or_published?
    SUBMISSION_STATUSES.include? publication_status
  end

  def published?
    publication_status == 'published'
  end

  def score
    likes_count - dislikes_count
  end

  def author_name
    @author_name ||= author&.full_name
  end

  private

  def schema_for_validation
    fields = participation_method_on_creation.custom_form.custom_fields
    multiloc_schema = JsonSchemaGeneratorService.new.generate_for fields
    multiloc_schema.values.first
  end

  def title_multiloc_required?
    !draft? && participation_method_on_creation.built_in_title_required?
  end

  def body_multiloc_required?
    !draft? && participation_method_on_creation.built_in_body_required?
  end

  def sanitize_body_multiloc
    service = SanitizationService.new
    self.body_multiloc = service.sanitize_multiloc(
      body_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.body_multiloc = service.remove_multiloc_empty_trailing_tags(body_multiloc)
    self.body_multiloc = service.linkify_multiloc(body_multiloc)
  end

  def fix_comments_count_on_projects
    return unless project_id_previously_changed?

    Comment.counter_culture_fix_counts only: [%i[idea project]]
  end

  def update_phase_counts(_)
    IdeasPhase.counter_culture_fix_counts only: %i[phase]
    phases.select { |p| p.participation_method == 'voting' }.each do |phase|
      # NOTE: this does not get called when removing a phase - but phase counts are not actually used
      Basket.update_counts(phase)
    end
  end

  def validate_creation_phase
    return unless creation_phase

    if creation_phase.project_id != project_id
      errors.add(
        :creation_phase,
        :invalid_project,
        message: 'The creation phase must be a phase of the input\'s project'
      )
      return
    end

    if participation_method_on_creation.transitive?
      errors.add(
        :creation_phase,
        :invalid_participation_method,
        message: 'The creation phase cannot be set for transitive participation methods'
      )
    end
  end

  def not_published_in_non_public_status
    return if !published?
    return if !idea_status || idea_status.public_post?

    errors.add(
      :publication_status,
      :invalid_status,
      message: 'Inputs can only be published in public statuses'
    )
  end

  # The FE sends geographic values as wkt strings, since GeoJSON often includes nested arrays
  # which are not supported by Rails strong params.
  # This method converts the wkt strings for geographic values (e.g. for point, line, polygon, etc.) to GeoJSON.
  #
  # RGeo gem & wkt strings:
  # https://github.com/rgeo/rgeo/blob/52d42407769d9fb5267e328ed4023db013f2b7d5/Spatial_Programming_With_RGeo.md?plain=1#L521-L528
  def convert_wkt_geo_custom_field_values_to_geojson
    return if custom_field_values.blank?

    geo_cf_keys = custom_form
      &.custom_fields.to_a
      .select { |field| field.input_type.in? CustomField::GEOGRAPHIC_INPUT_TYPES }
      .map(&:key)

    custom_field_values.slice(*geo_cf_keys).each do |key, value|
      custom_field_values[key] = wkt_string_to_geojson(value) if value.is_a?(String)
    end
  end

  def transitive_input_term
    current_phase_input_term || last_past_phase_input_term || first_future_phase_input_term || Phase::FALLBACK_INPUT_TERM
  end

  def current_phase_input_term
    current_phase = TimelineService.new.current_phase project
    current_phase.input_term if current_phase&.pmethod&.supports_input_term?
  end

  def last_past_phase_input_term
    past_phases = TimelineService.new.past_phases(project).select { |phase| phase_ids.include? phase.id }
    past_phases_with_input_term = past_phases.select do |phase|
      phase.pmethod.supports_input_term?
    end
    past_phases_with_input_term.last&.input_term
  end

  def first_future_phase_input_term
    future_phases = TimelineService.new.future_phases(project).select { |phase| phase_ids.include? phase.id }
    future_phases_with_input_term = future_phases.select do |phase|
      phase.pmethod.supports_input_term?
    end
    future_phases_with_input_term.first&.input_term
  end

  def strip_title
    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def set_submitted_at
    self.submitted_at ||= Time.zone.now
  end

  def set_published_at
    self.published_at ||= Time.zone.now
  end

  def set_assigned_at
    self.assigned_at ||= Time.zone.now
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update idea: nil
        notification.destroy!
      end
    end
  end
end

Idea.include(SmartGroups::Concerns::ValueReferenceable)
Idea.include(FlagInappropriateContent::Concerns::Flaggable)
Idea.include(Moderation::Concerns::Moderatable)
Idea.include(MachineTranslations::Concerns::Translatable)
Idea.include(IdeaAssignment::Extensions::Idea)
Idea.include(IdeaCustomFields::Extensions::Idea)
Idea.include(Analysis::Patches::Idea)
Idea.include(BulkImportIdeas::Patches::Idea)
