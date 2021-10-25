# frozen_string_literal: true

#
# Mixin for user participation in a model.
#
# ==== Usage (models only)
#
#     include ParticipationContext
#
module ParticipationContext
  extend ActiveSupport::Concern
  include Surveys::SurveyParticipationContext
  include Polls::PollParticipationContext
  include Volunteering::VolunteeringParticipationContext

  PARTICIPATION_METHODS = %w[information ideation survey budgeting poll volunteering].freeze
  PRESENTATION_MODES    = %w[card map].freeze
  VOTING_METHODS        = %w[unlimited limited].freeze
  IDEAS_ORDERS          = %w[trending random popular -new new].freeze
  INPUT_TERMS           = %w[idea question contribution project issue option].freeze

  included do
    has_many :baskets, as: :participation_context, dependent: :destroy
    has_many :permissions, as: :permission_scope, dependent: :destroy

    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :timeline_project? do
      validates :participation_method, inclusion: { in: PARTICIPATION_METHODS }

      before_validation :set_participation_method, on: :create
      before_validation :set_presentation_mode, on: :create

      # ideation? or budgeting?
      with_options if: :ideation_or_budgeting? do
        validates :presentation_mode,
                  inclusion: { in: PRESENTATION_MODES }, allow_nil: true

        validates :posting_enabled, inclusion: { in: [ true, false ] }
        validates :commenting_enabled, inclusion: { in: [ true, false ] }
        validates :voting_enabled, inclusion: { in: [ true, false ] }
        validates :upvoting_method, presence: true, inclusion: { in: VOTING_METHODS }
        validates :downvoting_enabled, inclusion: { in: [ true, false ] }
        validates :downvoting_method, presence: true, inclusion: { in: VOTING_METHODS }
        
        validates :ideas_order, inclusion: { in: IDEAS_ORDERS }, allow_nil: true
        validates :input_term, inclusion: { in: INPUT_TERMS }

        before_validation :set_ideas_order
        before_validation :set_input_term
      end
      validates :upvoting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[ideation_or_budgeting? upvoting_limited?]
      validates :downvoting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[ideation_or_budgeting? downvoting_limited?]

      # ideation?
      with_options if: :ideation? do
        validates :presentation_mode, presence: true
      end

      # budgeting?
      with_options if: :budgeting? do
        validates :min_budget, presence: true
        validates :max_budget, presence: true
      end
      validates_numericality_of :min_budget, 
        greater_than_or_equal_to: 0, less_than_or_equal_to: :max_budget, 
        if: %i[budgeting? max_budget]
      validates_numericality_of :max_budget, 
        greater_than_or_equal_to: :min_budget, 
        if: %i[budgeting? min_budget]
    end
  end

  def ideation_or_budgeting?
    ideation? || budgeting?
  end

  def ideation?
    participation_method == 'ideation'
  end

  def information?
    participation_method == 'information'
  end

  def budgeting?
    participation_method == 'budgeting'
  end

  def can_contain_ideas?
    ideation? || budgeting?
  end

  def upvoting_limited?
    upvoting_method == 'limited'
  end

  def downvoting_limited?
    downvoting_method == 'limited'
  end

  def votes
    Vote.where(votable: ideas)
  end

  def participation_context?
    !timeline_project?
  end

  private

  def timeline_project?
    self.class == Project && timeline?
  end

  def set_participation_method
    self.participation_method ||= 'ideation'
  end

  def set_presentation_mode
    self.presentation_mode ||= 'card'
  end

  def set_ideas_order
    self.ideas_order ||= 'trending'
  end

  def set_input_term
    self.input_term ||= 'idea'
  end
end
