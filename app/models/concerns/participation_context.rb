require 'active_support/concern'

module ParticipationContext
  extend ActiveSupport::Concern
  include Surveys::SurveyParticipationContext
  include Polls::PollParticipationContext
  include Volunteering::VolunteeringParticipationContext

  PARTICIPATION_METHODS = %w(information ideation survey budgeting poll volunteering)
  VOTING_METHODS = %w(unlimited limited)
  PRESENTATION_MODES = %w(card map)

  included do
    has_many :baskets, as: :participation_context, dependent: :destroy
    has_many :permissions, as: :permittable, dependent: :destroy

    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :is_timeline_project? do
      validates :participation_method, presence: true, inclusion: {in: PARTICIPATION_METHODS}
      validate :ideas_allowed_in_participation_method

      with_options if: :ideation? do |ideation|
        ideation.validates :posting_enabled, inclusion: {in: [true, false]}
        ideation.validates :commenting_enabled, inclusion: {in: [true, false]}
        ideation.validates :voting_enabled, inclusion: {in: [true, false]}
        ideation.validates :voting_method, presence: true, inclusion: {in: VOTING_METHODS}
        ideation.validates :voting_limited_max, presence: true, numericality: {only_integer: true, greater_than: 0}, if: [:ideation?, :voting_limited?]
        ideation.validates :presentation_mode, presence: true, inclusion: {in: PRESENTATION_MODES}
      end

      with_options if: :budgeting? do |budgeting|
        budgeting.validates :max_budget, presence: true
        budgeting.validates :posting_enabled, inclusion: {in: [true, false]}
        budgeting.validates :commenting_enabled, inclusion: {in: [true, false]}
        budgeting.validates :voting_enabled, inclusion: {in: [true, false]}
        budgeting.validates :voting_method, presence: true, inclusion: {in: VOTING_METHODS}
        budgeting.validates :voting_limited_max, presence: true, numericality: {only_integer: true, greater_than: 0}, if: [:ideation?, :voting_limited?]
        budgeting.validates :presentation_mode, presence: true, inclusion: {in: PRESENTATION_MODES}
      end

      before_validation :set_participation_method, on: :create
      before_validation :set_presentation_mode, on: :create
    end
  end

  class_methods do
  end


  def ideation?
    self.participation_method == 'ideation'
  end

  def information?
    self.participation_method == 'information'
  end

  def budgeting?
    self.participation_method == 'budgeting'
  end

  def can_contain_ideas?
    ideation? || budgeting?
  end

  def voting_limited?
    self.voting_method == 'limited'
  end

  def voting_unlimited?
    self.voting_method == 'unlimited'
  end

  def votes
    Vote.where(votable: ideas)
  end

  def is_participation_context?
    not is_timeline_project?
  end

  
  private
  
  def is_timeline_project?
    self.class == Project && self.timeline? 
  end

  def set_participation_method
    self.participation_method ||= 'ideation'
  end

  def set_presentation_mode
    self.presentation_mode ||= 'card'
  end

  def ideas_allowed_in_participation_method
    if !can_contain_ideas? && ideas.present?
      errors.add(:base, :cannot_contain_ideas, ideas_count: ideas.size, message: 'cannot contain ideas with the current participation context')
    end
  end

end