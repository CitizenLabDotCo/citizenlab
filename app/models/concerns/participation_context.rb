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

  # rubocop:disable Metrics/BlockLength
  included do
    has_many :baskets, as: :participation_context, dependent: :destroy
    has_many :permissions, as: :permission_scope, dependent: :destroy

    # for timeline projects, the phases are the participation contexts, so nothing applies
    with_options unless: :timeline_project? do
      validate :ideas_allowed_in_participation_method
      validates :participation_method, inclusion: { in: PARTICIPATION_METHODS }

      with_options if: :ideation? do
        validates :presentation_mode, presence: true
      end

      with_options if: :budgeting? do
        validates :max_budget, presence: true
      end

      with_options if: :ideation_or_budgeting? do
        validates :voting_enabled, boolean: true
        validates :posting_enabled, boolean: true
        validates :presentation_mode,
                  inclusion: { in: PRESENTATION_MODES }, allow_nil: true
        validates :voting_method, presence: true, inclusion: { in: VOTING_METHODS }
        validates :commenting_enabled, boolean: true
        validates :voting_limited_max,
                  presence: true,
                  numericality: { only_integer: true, greater_than: 0 },
                  if: %i[ideation? voting_limited?]
        validates :ideas_order, inclusion: { in: IDEAS_ORDERS }, allow_nil: true
        validates :input_term, inclusion: { in: INPUT_TERMS }

        before_validation :set_ideas_order
        before_validation :set_input_term
      end

      before_validation :set_participation_method, on: :create
      before_validation :set_presentation_mode, on: :create
    end
  end
  # rubocop:enable Metrics/BlockLength

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

  def voting_limited?
    voting_method == 'limited'
  end

  def voting_unlimited?
    voting_method == 'unlimited'
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

  def ideas_allowed_in_participation_method
    return unless !can_contain_ideas? && ideas.present?

    errors.add(
      :base,
      :cannot_contain_ideas,
      ideas_count: ideas.size,
      message: 'cannot contain ideas with the current participation context'
    )
  end

  def set_ideas_order
    self.ideas_order ||= 'trending'
  end

  def set_input_term
    self.input_term ||= 'idea'
  end
end
