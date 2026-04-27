# frozen_string_literal: true

# == Schema Information
#
# Table name: phases
#
#  id                               :uuid             not null, primary key
#  project_id                       :uuid
#  title_multiloc                   :jsonb
#  description_multiloc             :jsonb
#  start_at                         :date
#  end_at                           :date
#  created_at                       :datetime         not null
#  updated_at                       :datetime         not null
#  participation_method             :string           default("ideation"), not null
#  submission_enabled               :boolean          default(TRUE)
#  commenting_enabled               :boolean          default(TRUE)
#  reacting_enabled                 :boolean          default(TRUE), not null
#  reacting_like_method             :string           default("unlimited"), not null
#  reacting_like_limited_max        :integer          default(10)
#  survey_embed_url                 :string
#  survey_service                   :string
#  presentation_mode                :string           default("card")
#  voting_max_total                 :integer
#  poll_anonymous                   :boolean          default(FALSE), not null
#  reacting_dislike_enabled         :boolean          default(FALSE), not null
#  ideas_count                      :integer          default(0), not null
#  ideas_order                      :string
#  input_term                       :string           default("idea")
#  voting_min_total                 :integer          default(0)
#  reacting_dislike_method          :string           default("unlimited"), not null
#  reacting_dislike_limited_max     :integer          default(10)
#  allow_anonymous_participation    :boolean          default(FALSE), not null
#  document_annotation_embed_url    :string
#  voting_method                    :string
#  voting_max_votes_per_idea        :integer
#  voting_term_singular_multiloc    :jsonb
#  voting_term_plural_multiloc      :jsonb
#  baskets_count                    :integer          default(0), not null
#  votes_count                      :integer          default(0), not null
#  campaigns_settings               :jsonb
#  native_survey_title_multiloc     :jsonb
#  native_survey_button_multiloc    :jsonb
#  expire_days_limit                :integer
#  reacting_threshold               :integer
#  prescreening_enabled             :boolean          default(FALSE), not null
#  autoshare_results_enabled        :boolean          default(TRUE)
#  manual_votes_count               :integer          default(0), not null
#  manual_voters_amount             :integer
#  manual_voters_last_updated_by_id :uuid
#  manual_voters_last_updated_at    :datetime
#  vote_term                        :string           default("vote")
#
# Indexes
#
#  index_phases_on_manual_voters_last_updated_by_id  (manual_voters_last_updated_by_id)
#  index_phases_on_project_id                        (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (manual_voters_last_updated_by_id => users.id)
#  fk_rails_...  (project_id => projects.id)
#
class Phase < ApplicationRecord
  include Polls::PollPhase
  include Surveys::SurveyPhase
  include Volunteering::VolunteeringPhase
  include DocumentAnnotation::DocumentAnnotationPhase
  include Files::FileAttachable

  PRESCREENING_MODES = %w[flagged_only all].freeze
  PARTICIPATION_METHODS = ParticipationMethod::Base.all_methods.map(&:method_str).freeze
  VOTING_METHODS        = %w[budgeting multiple_voting single_voting].freeze
  PRESENTATION_MODES    = %w[card map feed].freeze
  REACTING_METHODS      = %w[unlimited limited].freeze
  INPUT_TERMS           = %w[idea question contribution project issue option proposal initiative petition comment response suggestion topic post story].freeze
  FALLBACK_INPUT_TERM   = 'idea'
  VOTE_TERMS            = %w[vote point token credit percent]
  MIN_DURATION          = 1.day

  attribute :reacting_dislike_enabled, :boolean, default: -> { disliking_enabled_default }

  has_many_text_images from: :description_multiloc, as: :text_images
  has_many_text_images from: :draft_description_multiloc, as: :draft_description_text_images
  accepts_nested_attributes_for :text_images

  belongs_to :project

  has_one :custom_form, as: :participation_context, dependent: :destroy # native_survey only

  has_many :baskets, dependent: :destroy
  has_many :permissions, as: :permission_scope, dependent: :destroy
  has_many :ideas_phases, dependent: :destroy
  has_many :ideas, through: :ideas_phases
  has_many :reactions, through: :ideas
  has_many :phase_files, -> { order(:ordering) }, dependent: :destroy
  has_many :jobs_trackers, -> { where(context_type: 'Phase') }, class_name: 'Jobs::Tracker', as: :context, dependent: :destroy
  belongs_to :manual_voters_last_updated_by, class_name: 'User', optional: true

  before_validation :sanitize_description_multiloc
  before_validation :sanitize_draft_description_multiloc
  before_validation :strip_title
  before_validation :set_participation_method_defaults, on: :create
  before_validation :set_participation_method_defaults_on_method_change, on: :update
  before_validation :set_presentation_mode, on: :create
  before_save :close_previous_open_phase # see also Phase#validate_previous_phase_can_be_closed
  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :draft_description_multiloc, multiloc: { presence: false, html: true }
  validates :start_at, presence: true
  validate :validate_end_at
  validate :validate_duration
  validate :validate_previous_phase_can_be_closed # see also Phase#close_previous_open_phase
  validate :validate_no_other_overlapping_phases
  validates :manual_voters_amount, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }
  # This is a counter cache column, but it was too complex to implement it with counter_culture. It's
  # therefore updated manually by calling update_manual_votes_count! through the idea sidefx service.
  validates :manual_votes_count, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }

  validates :survey_popup_frequency, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true

  validates :participation_method, inclusion: { in: PARTICIPATION_METHODS }
  validates :prescreening_mode, inclusion: { in: PRESCREENING_MODES }, allow_nil: true
  validate :validate_prescreening_mode, if: :prescreening_mode_changed?

  with_options if: ->(phase) { phase.pmethod.supports_public_visibility? } do
    validates :presentation_mode, inclusion: { in: PRESENTATION_MODES }
    validates :presentation_mode, presence: true
    validates :similarity_enabled, inclusion: { in: [true, false] }
    validates :similarity_threshold_title, :similarity_threshold_body, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }
    validate :validate_available_views
  end

  validates :submission_enabled, inclusion: { in: [true, false] }, if: lambda { |phase|
    phase.pmethod.supports_submission?
  }

  with_options if: ->(phase) { phase.pmethod.supports_commenting? } do
    validates :commenting_enabled, inclusion: { in: [true, false] }
  end

  with_options if: ->(phase) { phase.pmethod.supports_reacting? } do
    validates :reacting_enabled, inclusion: { in: [true, false] }
    validates :reacting_like_method, presence: true, inclusion: { in: REACTING_METHODS }
    validates :reacting_dislike_enabled, inclusion: { in: [true, false] }
    validates :reacting_dislike_method, presence: true, inclusion: { in: REACTING_METHODS }
  end

  with_options if: ->(phase) { phase.pmethod.supports_reacting? && phase.reacting_like_limited? } do
    validates :reacting_like_limited_max, presence: true, numericality: { only_integer: true, greater_than: 0 }
  end

  with_options if: ->(phase) { phase.pmethod.supports_reacting? && phase.reacting_dislike_limited? } do
    validates :reacting_dislike_limited_max, presence: true, numericality: { only_integer: true, greater_than: 0 }
  end

  with_options if: ->(phase) { phase.pmethod.supports_input_term? } do
    validates :input_term, inclusion: { in: INPUT_TERMS }
  end

  with_options if: ->(phase) { phase.pmethod.supports_vote_term? } do
    validates :vote_term, inclusion: { in: VOTE_TERMS }
  end

  with_options if: ->(phase) { phase.pmethod.supports_automated_statuses? } do
    validates :expire_days_limit, presence: true, numericality: { only_integer: true, greater_than: 0 }
    validates :reacting_threshold, presence: true, numericality: { only_integer: true, greater_than: 1 }
  end

  validates :ideas_order, inclusion: { in: ->(phase) { phase.pmethod.allowed_ideas_orders } }, allow_nil: true

  # ONLY USED FOR IDEATION
  validates :allow_anonymous_participation, inclusion: { in: [true, false] }

  # voting?
  with_options if: :voting? do
    validates :voting_method, presence: true, inclusion: { in: VOTING_METHODS }
    validates :autoshare_results_enabled, inclusion: { in: [true, false] }
  end

  validates :voting_min_total,
    numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: :voting_max_total,
                    if: %i[voting? voting_max_total],
                    allow_nil: true }
  validates :voting_max_total,
    numericality: { greater_than_or_equal_to: :voting_min_total,
                    if: %i[voting? voting_min_total],
                    allow_nil: true }
  validates :voting_min_selected_options,
    numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: :voting_max_total,
                    if: %i[voting? voting_max_total],
                    allow_nil: false }
  validates :voting_max_votes_per_idea,
    numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: :voting_max_total,
                    if: %i[voting? voting_max_total],
                    allow_nil: true }
  validates :voting_filtering_enabled, inclusion: { in: [true, false] }

  # any type of native_survey phase
  with_options if: ->(phase) { phase.pmethod.supports_survey_form? } do
    validates :native_survey_title_multiloc, presence: true, multiloc: { presence: true }
    validates :native_survey_button_multiloc, presence: true, multiloc: { presence: true }
  end

  validate :validate_no_inputs_on_participation_method_change, on: :update
  validate :validate_phase_participation_method

  scope :published, lambda {
    published_admin_pubs = AdminPublication.published.where(parent_id: nil)
      .or(AdminPublication.published.where(parent_id: AdminPublication.published))
    published_projects = Project.where(admin_publication: published_admin_pubs)
    where(project: published_projects)
  }

  scope :current, lambda {
    now = Time.zone.now
    where('start_at <= ? AND (end_at IS NULL OR end_at > ?)', now, now)
  }

  def ends_before?(time)
    end_at.present? && end_at <= time
  end

  def permission_scope
    self
  end

  def previous_phase_end_at_updated?
    @previous_phase_end_at_updated || false
  end

  def custom_form_persisted?
    custom_form.present?
  end

  def reacting_like_limited?
    reacting_like_method == 'limited'
  end

  def reacting_dislike_limited?
    reacting_dislike_method == 'limited'
  end

  def started?
    start_at <= Time.zone.now
  end

  def start_date
    start_at&.to_date
  end

  def end_date
    return unless end_at

    date = end_at.to_date
    end_at.seconds_since_midnight.zero? ? date - 1.day : date
  end

  # Used for validations (which are hard to delegate through the participation method)
  def voting?
    participation_method == 'voting'
  end

  def ideation?
    participation_method == 'ideation'
  end

  def pmethod
    @pmethod = case participation_method
    when 'information'
      ParticipationMethod::Information.new(self)
    when 'ideation'
      ParticipationMethod::Ideation.new(self)
    when 'proposals'
      ParticipationMethod::Proposals.new(self)
    when 'native_survey'
      ParticipationMethod::NativeSurvey.new(self)
    when 'community_monitor_survey'
      ParticipationMethod::CommunityMonitorSurvey.new(self)
    when 'document_annotation'
      ParticipationMethod::DocumentAnnotation.new(self)
    when 'survey'
      ParticipationMethod::Survey.new(self)
    when 'voting'
      ParticipationMethod::Voting.new(self)
    when 'poll'
      ParticipationMethod::Poll.new(self)
    when 'volunteering'
      ParticipationMethod::Volunteering.new(self)
    when 'common_ground'
      ParticipationMethod::CommonGround.new(self)
    else
      ParticipationMethod::None.new
    end
  end

  def set_manual_voters(amount, user)
    return if amount == manual_voters_amount

    self.manual_voters_amount = amount
    self.manual_voters_last_updated_by = user if user
    self.manual_voters_last_updated_at = Time.now
  end

  def update_manual_votes_count!
    reload
    update!(manual_votes_count: ideas.filter_map(&:manual_votes_amount).sum)
  end

  # If 'disable_disliking' is NOT enabled, then disliking will always be set to enabled on creation and cannot be changed
  # Otherwise disliking is disabled on creation but can be changed in phase settings
  def self.disliking_enabled_default
    !AppConfiguration.instance.feature_activated?('disable_disliking')
  end

  def feed_enabled?
    available_views&.include?('feed')
  end

  def prescreening_enabled? = prescreening_mode.present?
  def prescreening_flagged_only? = prescreening_mode == 'flagged_only'
  def prescreening_all? = prescreening_mode == 'all'

  private

  def validate_prescreening_mode
    return if prescreening_mode.nil?

    prescreening_flag = participation_method == 'proposals' ? 'prescreening' : 'prescreening_ideation'

    # Any prescreening mode requires the prescreening feature to be enabled.
    unless AppConfiguration.instance.feature_activated?(prescreening_flag)
      errors.add(:prescreening_mode, "requires the #{prescreening_flag} feature to be enabled")
      return
    end

    # 'flagged_only' mode requires the flag_inappropriate_content feature to be enabled.
    return unless prescreening_mode == 'flagged_only'
    return if AppConfiguration.instance.feature_activated?('flag_inappropriate_content')

    errors.add(:prescreening_mode, 'requires the flag_inappropriate_content feature to be enabled')
  end

  def sanitize_description_multiloc
    self.description_multiloc = sanitize_html_multiloc(description_multiloc)
  end

  def sanitize_draft_description_multiloc
    return if draft_description_multiloc.blank?

    self.draft_description_multiloc = sanitize_html_multiloc(draft_description_multiloc)
  end

  def validate_end_at
    return if end_at.present? || TimelineService.new.last_phase?(self)

    errors.add(:end_at, message: 'cannot be blank unless it is the last phase')
  end

  def validate_duration
    return unless start_at.present? && end_at.present? && (end_at - start_at) < MIN_DURATION

    errors.add(:base, :duration_too_short, message: "must be at least #{MIN_DURATION.in_hours} hours")
  end

  def validate_no_other_overlapping_phases
    ts = TimelineService.new
    ts.other_project_phases(self).each do |other_phase|
      # Skip open-ended phases that start before this phase as they have their own
      # validation. See Phase#validate_previous_phase_can_be_closed
      next if other_phase.end_at.nil? && other_phase.start_at < start_at
      next unless ts.overlaps?(self, other_phase)

      errors.add(:base, :has_other_overlapping_phases,
        message: "overlaps with Phase##{other_phase.id}")
    end
  end

  def validate_previous_phase_can_be_closed
    previous_phase = TimelineService.new.previous_phase(self)
    return unless previous_phase && previous_phase.end_at.nil?

    previous_phase.end_at = start_at
    return if previous_phase.valid?

    previous_phase.errors.each { |error| errors.add(:previous_phase, error.full_message) }
  end

  def close_previous_open_phase
    previous_phase = TimelineService.new.previous_phase(self)
    return unless previous_phase && previous_phase.end_at.nil?

    previous_phase.update!(end_at: start_at)
    @previous_phase_end_at_updated = true
  end

  def strip_title
    return unless title_multiloc&.any?

    title_multiloc.each do |key, value|
      title_multiloc[key] = value.strip
    end
  end

  def remove_notifications
    notifications.each do |notification|
      unless notification.update phase: nil
        notification.destroy!
      end
    end
  end

  def set_participation_method_defaults
    pmethod.assign_defaults_for_phase
  end

  def set_participation_method_defaults_on_method_change
    return unless participation_method_changed?

    pmethod.assign_defaults_for_phase
  end

  def set_presentation_mode
    self.presentation_mode ||= 'card'
    self.available_views = ['card'] if available_views.blank?
    self.available_views |= [presentation_mode] unless available_views.include?(presentation_mode)
  end

  def validate_available_views
    if available_views.blank? || !available_views.is_a?(Array)
      errors.add(:available_views, :blank, message: 'must be a non-empty array')
      return
    end

    unless available_views.all? { |v| PRESENTATION_MODES.include?(v) }
      errors.add(:available_views, :invalid, message: 'contains invalid view modes')
      return
    end

    unless available_views.include?('card')
      errors.add(:available_views, :invalid, message: 'must include card view')
      return
    end

    unless available_views.include?(presentation_mode)
      errors.add(:available_views, :invalid, message: 'must include the default presentation mode')
    end
  end

  def validate_no_inputs_on_participation_method_change
    return if !participation_method_changed?
    return if !id

    if Idea.exists?(creation_phase_id: id) || IdeasPhase.exists?(phase_id: id)
      errors.add(
        :participation_method,
        :has_inputs,
        message: 'cannot change the participation method when there are inputs in the phase'
      )
    end
  end

  # Delegate any rules specific to a method to the participation method itself
  def validate_phase_participation_method
    pmethod.validate_phase
  end

  def sanitize_html_multiloc(multiloc)
    service = SanitizationService.new
    multiloc = service.sanitize_multiloc(
      multiloc,
      %i[title alignment list decoration link image video]
    )
    multiloc = service.remove_multiloc_empty_trailing_tags(multiloc)
    service.linkify_multiloc(multiloc)
  end
end

Phase.include(Analysis::Patches::Phase)
Phase.include(ReportBuilder::Patches::Phase)
Phase.include(EmailCampaigns::Extensions::Phase)
