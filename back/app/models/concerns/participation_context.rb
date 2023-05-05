# frozen_string_literal: true

#
# Mixin for user participation in a model.
#
# ==== Usage (models only)
#
#     include ParticipationContext
#
# rubocop:disable Metrics/ModuleLength
module ParticipationContext
  extend ActiveSupport::Concern
  include Surveys::SurveyParticipationContext
  include Polls::PollParticipationContext
  include Volunteering::VolunteeringParticipationContext

  PARTICIPATION_METHODS = %w[information ideation survey budgeting poll volunteering native_survey document_annotation].freeze
  PRESENTATION_MODES    = %w[card map].freeze
  POSTING_METHODS       = %w[unlimited limited].freeze
  VOTING_METHODS        = %w[unlimited limited].freeze
  IDEAS_ORDERS          = %w[trending random popular -new new].freeze
  IDEAS_ORDERS_BUDGETING_EXCLUDE = %w[trending popular].freeze
  INPUT_TERMS           = %w[idea question contribution project issue option].freeze
  DEFAULT_INPUT_TERM    = 'idea'

  included do
    has_many :baskets, as: :participation_context, dependent: :destroy
    has_many :permissions, as: :permission_scope, dependent: :destroy
    has_one :custom_form, as: :participation_context, dependent: :destroy

    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :timeline_project? do
      validates :participation_method, inclusion: { in: PARTICIPATION_METHODS }
      validate :validate_participation_method_change, on: :update

      before_validation :set_participation_method, on: :create
      before_validation :set_participation_method_defaults, on: :create
      before_validation :set_presentation_mode, on: :create

      # ideation? or budgeting?
      with_options if: :can_contain_ideas? do
        validates :presentation_mode,
          inclusion: { in: PRESENTATION_MODES }, allow_nil: true

        validates :posting_enabled, inclusion: { in: [true, false] }
        validates :posting_method, presence: true, inclusion: { in: POSTING_METHODS }
        validates :commenting_enabled, inclusion: { in: [true, false] }
        validates :voting_enabled, inclusion: { in: [true, false] }
        validates :upvoting_method, presence: true, inclusion: { in: VOTING_METHODS }
        validates :downvoting_enabled, inclusion: { in: [true, false] }
        validates :downvoting_method, presence: true, inclusion: { in: VOTING_METHODS }
        validates :ideas_order, inclusion: { in: IDEAS_ORDERS }, allow_nil: true
        validates :input_term, inclusion: { in: INPUT_TERMS }

        before_validation :set_ideas_order
        before_validation :set_input_term
      end
      validates :posting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_input? posting_limited?]
      validates :upvoting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_ideas? upvoting_limited?]
      validates :downvoting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_ideas? downvoting_limited?]

      # ideation?
      with_options if: :ideation? do
        validates :presentation_mode, presence: true
      end

      # budgeting?
      with_options if: :budgeting? do
        validates :min_budget, presence: true
        validates :max_budget, presence: true
        # validates :ideas_order, exclusion: { in: IDEAS_ORDERS_BUDGETING_EXCLUDE }, allow_nil: true
      end
      validates :min_budget,
        numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: :max_budget,
                        if: %i[budgeting? max_budget] }
      validates :max_budget,
        numericality: { greater_than_or_equal_to: :min_budget,
                        if: %i[budgeting? min_budget] }
    end
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

  def can_contain_input?
    can_contain_ideas? || native_survey?
  end

  def posting_limited?
    posting_method == 'limited'
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

  def native_survey?
    participation_method == 'native_survey'
  end

  private

  def timeline_project?
    instance_of?(Project) && timeline?
  end

  def set_participation_method
    self.participation_method ||= 'ideation'
  end

  def set_participation_method_defaults
    Factory.instance.participation_method_for(self).assign_defaults_for_participation_context
  end

  def set_presentation_mode
    self.presentation_mode ||= 'card'
  end

  def set_ideas_order
    self.ideas_order ||= budgeting? ? 'random' : 'trending'
  end

  def set_input_term
    self.input_term ||= DEFAULT_INPUT_TERM
  end

  def validate_participation_method_change
    return unless participation_method_changed?

    return if participation_method_was != 'native_survey' && participation_method != 'native_survey'

    errors.add :participation_method, :change_not_permitted, message: 'change is not permitted'
  end
end
# rubocop:enable Metrics/ModuleLength
