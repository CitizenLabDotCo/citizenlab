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
  include DocumentAnnotation::DocumentAnnotationParticipationContext
  include Polls::PollParticipationContext
  include Surveys::SurveyParticipationContext
  include Volunteering::VolunteeringParticipationContext

  PARTICIPATION_METHODS = %w[information ideation survey voting poll volunteering native_survey document_annotation].freeze
  VOTING_METHODS        = %w[budgeting multiple_voting single_voting].freeze
  PRESENTATION_MODES    = %w[card map].freeze
  POSTING_METHODS       = %w[unlimited limited].freeze
  REACTING_METHODS      = %w[unlimited limited].freeze
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

      # ideation? or voting?
      with_options if: :can_contain_ideas? do
        validates :presentation_mode,
          inclusion: { in: PRESENTATION_MODES }, allow_nil: true

        validates :posting_enabled, inclusion: { in: [true, false] }
        validates :posting_method, presence: true, inclusion: { in: POSTING_METHODS }
        validates :commenting_enabled, inclusion: { in: [true, false] }
        validates :reacting_enabled, inclusion: { in: [true, false] }
        validates :reacting_like_method, presence: true, inclusion: { in: REACTING_METHODS }
        validates :reacting_dislike_enabled, inclusion: { in: [true, false] }
        validates :reacting_dislike_method, presence: true, inclusion: { in: REACTING_METHODS }
        validates :input_term, inclusion: { in: INPUT_TERMS }

        before_validation :set_input_term
      end
      validates :ideas_order, inclusion: {
        in: lambda do |pc|
          Factory.instance.participation_method_for(pc).allowed_ideas_orders
        end
      }, allow_nil: true
      validates :posting_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_input? posting_limited?]
      validates :reacting_like_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_ideas? reacting_like_limited?]
      validates :reacting_dislike_limited_max, presence: true,
        numericality: { only_integer: true, greater_than: 0 },
        if: %i[can_contain_ideas? reacting_dislike_limited?]
      validates :allow_anonymous_participation, inclusion: { in: [true, false] }

      # ideation?
      with_options if: :ideation? do
        validates :presentation_mode, presence: true
      end

      # voting?
      with_options if: :voting? do
        validates :voting_method, presence: true, inclusion: { in: VOTING_METHODS }
        validate :validate_voting
        validates :voting_term_singular_multiloc, multiloc: { presence: false }
        validates :voting_term_plural_multiloc, multiloc: { presence: false }
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
    end
  end

  def ideation?
    participation_method == 'ideation'
  end

  def information?
    participation_method == 'information'
  end

  def voting?
    participation_method == 'voting'
  end

  def can_contain_ideas?
    ideation? || voting?
  end

  def can_contain_input?
    can_contain_ideas? || native_survey?
  end

  def posting_limited?
    posting_method == 'limited'
  end

  def reacting_like_limited?
    reacting_like_method == 'limited'
  end

  def reacting_dislike_limited?
    reacting_dislike_method == 'limited'
  end

  def reactions
    Reaction.where(reactable: ideas)
  end

  def participation_context?
    !timeline_project?
  end

  def native_survey?
    participation_method == 'native_survey'
  end

  def phase?
    instance_of?(Phase)
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

  def set_input_term
    self.input_term ||= DEFAULT_INPUT_TERM
  end

  def validate_participation_method_change
    return unless participation_method_changed?

    return if participation_method_was != 'native_survey' && participation_method != 'native_survey'

    errors.add :participation_method, :change_not_permitted, message: 'change is not permitted'
  end

  def validate_voting
    Factory.instance.voting_method_for(self).validate_participation_context
  end
end
# rubocop:enable Metrics/ModuleLength
