require 'active_support/concern'

module ParticipationContext
  extend ActiveSupport::Concern

  PARTICIPATION_METHODS = %w(information ideation survey)
  VOTING_METHODS = %w(unlimited limited)

  included do
    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :is_timeline_project? do
      validates :participation_method, presence: true, inclusion: {in: PARTICIPATION_METHODS}

      with_options if: :ideation? do |ideation|
        ideation.validates :posting_enabled, inclusion: {in: [true, false]}
        ideation.validates :commenting_enabled, inclusion: {in: [true, false]}
        ideation.validates :voting_enabled, inclusion: {in: [true, false]}
        ideation.validates :voting_method, presence: true, inclusion: {in: VOTING_METHODS}
        ideation.validates :voting_limited_max, presence: true, numericality: {only_integer: true, greater_than: 0}, if: [:ideation?, :voting_limited?]
      end
      with_options if: :survey? do |survey|
        survey.validates :survey_id, presence: true
      end

      before_validation :set_participation_method, on: :create
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

  def survey?
    self.participation_method == 'survey'
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

end