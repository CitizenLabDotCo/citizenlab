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

  PARTICIPATION_METHODS = ParticipationMethod::Base.all_methods.map(&:method_str).freeze
  VOTING_METHODS        = %w[budgeting multiple_voting single_voting].freeze
  PRESENTATION_MODES    = %w[card map].freeze
  REACTING_METHODS      = %w[unlimited limited].freeze
  INPUT_TERMS           = %w[idea question contribution project issue option proposal initiative petition].freeze
  FALLBACK_INPUT_TERM = 'idea'
  CAMPAIGNS = [:project_phase_started].freeze

  attribute :reacting_dislike_enabled, :boolean, default: -> { disliking_enabled_default }

  belongs_to :project

  has_one :custom_form, as: :participation_context, dependent: :destroy # native_survey only

  has_many :baskets, dependent: :destroy
  has_many :permissions, as: :permission_scope, dependent: :destroy
  has_many :ideas_phases, dependent: :destroy
  has_many :ideas, through: :ideas_phases
  has_many :reactions, through: :ideas
  has_many :text_images, as: :imageable, dependent: :destroy
  accepts_nested_attributes_for :text_images
  has_many :phase_files, -> { order(:ordering) }, dependent: :destroy
  has_many :jobs_trackers, -> { where(context_type: 'Phase') }, class_name: 'Jobs::Tracker', as: :context, dependent: :destroy
  belongs_to :manual_voters_last_updated_by, class_name: 'User', optional: true

  before_validation :sanitize_description_multiloc
  before_validation :strip_title
  before_validation :set_participation_method_defaults, on: :create
  before_validation :set_presentation_mode, on: :create
  before_save :reload_participation_method, if: :will_save_change_to_participation_method?

  before_destroy :remove_notifications # Must occur before has_many :notifications (see https://github.com/rails/rails/issues/5205)
  has_many :notifications, dependent: :nullify

  validates :project, presence: true
  validates :title_multiloc, presence: true, multiloc: { presence: true }
  validates :description_multiloc, multiloc: { presence: false, html: true }
  validates :campaigns_settings, presence: true
  validates :start_at, presence: true
  validates :prescreening_enabled, inclusion: { in: [true, false] }
  validate :validate_end_at
  validate :validate_previous_blank_end_at
  validate :validate_start_at_before_end_at
  validate :validate_no_other_overlapping_phases
  validate :validate_campaigns_settings_keys_and_values
  validates :manual_voters_amount, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }
  # This is a counter cache column, but it was too complex to implement it with counter_culture. It's
  # therefore updated manually by calling update_manual_votes_count! through the idea sidefx service.
  validates :manual_votes_count, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }

  validates :survey_popup_frequency, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true

  validates :participation_method, inclusion: { in: PARTICIPATION_METHODS }

  with_options if: ->(phase) { phase.pmethod.supports_public_visibility? } do
    validates :presentation_mode, inclusion: { in: PRESENTATION_MODES }
    validates :presentation_mode, presence: true
    validates :similarity_enabled, inclusion: { in: [true, false] }
    validates :similarity_threshold_title, :similarity_threshold_body, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }
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

  with_options if: ->(phase) { phase.pmethod.supports_automated_statuses? } do
    validates :expire_days_limit, presence: true, numericality: { only_integer: true, greater_than: 0 }
    validates :reacting_threshold, presence: true, numericality: { only_integer: true, greater_than: 1 }
  end

  validates :ideas_order, inclusion: { in: ->(phase) { phase.pmethod.allowed_ideas_orders } }, allow_nil: true
  validates :allow_anonymous_participation, inclusion: { in: [true, false] }

  # voting?
  with_options if: :voting? do
    validates :voting_method, presence: true, inclusion: { in: VOTING_METHODS }
    validates :voting_term_singular_multiloc, multiloc: { presence: false }
    validates :voting_term_plural_multiloc, multiloc: { presence: false }
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
  validates :voting_max_votes_per_idea,
    numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: :voting_max_total,
                    if: %i[voting? voting_max_total],
                    allow_nil: true }

  scope :starting_on, lambda { |date|
    where(start_at: date)
  }

  # any type of native_survey phase
  with_options if: ->(phase) { phase.pmethod.supports_survey_form? } do
    validates :native_survey_title_multiloc, presence: true, multiloc: { presence: true }
    validates :native_survey_button_multiloc, presence: true, multiloc: { presence: true }
  end

  validate :validate_phase_participation_method

  scope :published, lambda {
    joined = includes(project: { admin_publication: :parent })
    joined.where(
      projects: {
        admin_publications: {
          publication_status: 'published',
          parents_admin_publications: { publication_status: 'published' }
        }
      }
    ).or(
      joined.where(
        projects: {
          admin_publications: {
            publication_status: 'published',
            parent_id: nil
          }
        }
      )
    )
  }

  def ends_before?(date)
    return false if end_at.blank?

    end_at.iso8601 < date.to_date.iso8601
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

  def voting_term_singular_multiloc_with_fallback
    MultilocService.new.i18n_to_multiloc('voting_method.default_voting_term_singular').merge(
      voting_term_singular_multiloc || {}
    )
  end

  def voting_term_plural_multiloc_with_fallback
    MultilocService.new.i18n_to_multiloc('voting_method.default_voting_term_plural').merge(
      voting_term_plural_multiloc || {}
    )
  end

  def started?
    start_at <= Time.zone.now
  end

  # Used for validations (which are hard to delegate through the participation method)
  def voting?
    participation_method == 'voting'
  end

  # @return [ParticipationMethod::Base]
  def pmethod
    reload_participation_method if !@pmethod
    @pmethod
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

  private

  def sanitize_description_multiloc
    service = SanitizationService.new
    self.description_multiloc = service.sanitize_multiloc(
      description_multiloc,
      %i[title alignment list decoration link image video]
    )
    self.description_multiloc = service.remove_multiloc_empty_trailing_tags(description_multiloc)
    self.description_multiloc = service.linkify_multiloc(description_multiloc)
  end

  def validate_end_at
    return if end_at.present? || TimelineService.new.last_phase?(self)

    errors.add(:end_at, message: 'cannot be blank unless it is the last phase')
  end

  # If a previous phase has a blank end_at, update it and validate that the end date is 2 days after
  def validate_previous_blank_end_at
    previous_phase = TimelineService.new.previous_phase(self)
    if previous_phase && previous_phase.end_at.blank?
      if start_at < (previous_phase.start_at + 2.days)
        errors.add(:start_at, message: 'must be 2 days after the start of the last phase')
      else
        previous_phase.update!(end_at: (start_at - 1.day))
        @previous_phase_end_at_updated = true
      end
    end
  end

  def validate_campaigns_settings_keys_and_values
    return if campaigns_settings.blank?

    campaigns_settings.each do |key, value|
      errors.add(:campaigns_settings, :invalid_key, message: 'invalid key') unless CAMPAIGNS.include?(key.to_sym)
      next if Utils.boolean? value

      errors.add(:campaigns_settings, :invalid_value, message: 'invalid value')
    end
  end

  def validate_start_at_before_end_at
    return unless start_at.present? && end_at.present? && start_at > end_at

    errors.add(:start_at, :after_end_at, message: 'is after end_at')
  end

  def validate_no_other_overlapping_phases
    ts = TimelineService.new
    ts.other_project_phases(self).each do |other_phase|
      next unless ts.overlaps?(self, other_phase)

      errors.add(:base, :has_other_overlapping_phases,
        message: 'has other phases which overlap in start and end date')
    end
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

  def reload_participation_method
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

  def set_presentation_mode
    self.presentation_mode ||= 'card'
  end

  # Delegate any rules specific to a method to the participation method itself
  def validate_phase_participation_method
    pmethod.validate_phase
  end
end

Phase.include(Analysis::Patches::Phase)
Phase.include(ReportBuilder::Patches::Phase)
