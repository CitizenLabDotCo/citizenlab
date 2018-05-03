require 'active_support/concern'

module ParticipationContext
  extend ActiveSupport::Concern

  PARTICIPATION_METHODS = %w(information ideation survey)
  VOTING_METHODS = %w(unlimited limited)
  PRESENTATION_MODES = %w(card map)
  SURVEY_SERVICES = %w(typeform survey_monkey)

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
        ideation.validates :presentation_mode, presence: true, inclusion: {in: PRESENTATION_MODES}
      end
      with_options if: :survey? do |survey|
        survey.validates :survey_embed_url, presence: true
        survey.validates :survey_service, presence: true, inclusion: {in: SURVEY_SERVICES}
        survey.validates :survey_embed_url, if: [:survey?, :typeform?], format: { 
          with: /\Ahttps:\/\/.*\.typeform\.com\/to\/.*\z/,
          message: "Not a valid Typeform embed URL"
        }
        survey.validates :survey_embed_url, if: [:survey?, :survey_monkey?], format: { 
          with: /\Ahttps:\/\/widget\.surveymonkey\.com\/collect\/website\/js\/.*\.js\z/,
          message: "Not a valid SurveyMonkey embed URL"
        }
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

  def set_presentation_mode
    self.presentation_mode ||= 'card'
  end

  def typeform?
    self.survey_service == 'typeform'
  end

  def survey_monkey?
    self.survey_service == 'survey_monkey'
  end

end