# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    SUPPORTED_REACTION_MODES = %w[up].freeze

    def self.method_str
      'proposals'
    end

    def assign_defaults_for_phase
      super
      phase.reacting_dislike_enabled = false
      phase.expire_days_limit ||= 90
      phase.reacting_threshold ||= 300
      phase.prescreening_enabled ||= false
    end

    def budget_in_form?(_)
      false
    end

    def cosponsors_in_form?
      true
    end

    def validate_phase; end

    def supported_email_campaigns
      super + %w[cosponsor_of_your_idea invitation_to_cosponsor_idea]
    end

    def supports_automated_statuses?
      true
    end

    def supports_serializing?(attribute)
      %i[expire_days_limit reacting_threshold].include?(attribute)
    end

    def supports_serializing_input?(attribute)
      %i[expires_at reacting_threshold].include?(attribute)
    end

    def transitive?
      false
    end

    def use_reactions_as_votes?
      true
    end

    def add_autoreaction_to_inputs?
      true
    end

    def default_input_term
      'proposal'
    end

    def participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        posting_idea: participation_ideas_submitted,
        commenting_idea: participation_idea_comments,
        reacting_idea: participation_idea_reactions
      }
    end

    private

    def participation_ideas_submitted
      end_time = phase.end_at ? phase.end_at.end_of_day : Time.current.end_of_day
      ideas = phase.ideas
        .transitive(false)
        .where.not(submitted_at: nil)
        .where(<<~SQL.squish, phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
          AND ideas.publication_status IN ('published', 'submitted')
        SQL
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.submitted_at, # analytics_fact_participations uses created_at, so maybe we should use that here too?
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.author&.custom_field_values || {}
        }
      end
    end

    def proposed_budget_in_form?
      false
    end
  end
end
