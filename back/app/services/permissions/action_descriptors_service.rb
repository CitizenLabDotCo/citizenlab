# frozen_string_literal: true

module Permissions
  class ActionDescriptorsService
    def initialize
      @permissions_service = Permissions::PermissionsService.new
    end

    def initiative_action_descriptors(user)
      posting_disabled_reason = @permissions_service.denied_reason_for_user(user, 'posting_initiative')
      commenting_disabled_reason = @permissions_service.denied_reason_for_user(user, 'commenting_initiative')
      reacting_disabled_reason = @permissions_service.denied_reason_for_user(user, 'reacting_initiative')

      descriptors = {
        posting_initiative: { disabled_reason: posting_disabled_reason },
        commenting_initiative: { disabled_reason: commenting_disabled_reason },
        reacting_initiative: { disabled_reason: reacting_disabled_reason }
      }

      descriptors.each { |_, desc| desc[:enabled] = !desc[:disabled_reason] }
      descriptors[:comment_reacting_initiative] = descriptors[:commenting_initiative]
      descriptors[:cancelling_initiative_reactions] = descriptors[:reacting_initiative]
      descriptors
    end

    def project_action_descriptors(project, user)
      posting_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'posting_idea'
      commenting_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'commenting_idea'
      reacting_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'reacting_idea'
      liking_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'reacting_idea', reaction_mode: 'up'
      disliking_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'reacting_idea', reaction_mode: 'down'
      annotating_document_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'annotating_document'
      taking_survey_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'taking_survey'
      taking_poll_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'taking_poll'
      voting_disabled_reason = @permissions_service.denied_reason_for_project project, user, 'voting'
      {
        posting_idea: {
          enabled: !posting_disabled_reason,
          disabled_reason: posting_disabled_reason,
          future_enabled: posting_disabled_reason && @permissions_service.future_enabled_phase(project, user, 'posting_idea')&.start_at
        },
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason
        },
        reacting_idea: {
          enabled: !reacting_disabled_reason,
          disabled_reason: reacting_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason
          }
        },
        comment_reacting_idea: {
          # You can react if you can comment.
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason
        },
        annotating_document: {
          enabled: !annotating_document_disabled_reason,
          disabled_reason: annotating_document_disabled_reason
        },
        taking_survey: {
          enabled: !taking_survey_disabled_reason,
          disabled_reason: taking_survey_disabled_reason
        },
        taking_poll: {
          enabled: !taking_poll_disabled_reason,
          disabled_reason: taking_poll_disabled_reason
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason
        }
      }
    end

    def idea_action_descriptors(idea, user)
      commenting_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'commenting_idea')
      liking_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')
      disliking_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')
      cancelling_reactions_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'reacting_idea')
      voting_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'voting')
      comment_reacting_disabled_reason = @permissions_service.denied_reason_for_idea(idea, user, 'commenting_idea')

      {
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason,
          future_enabled: commenting_disabled_reason && @permissions_service.future_enabled_phase(idea.project, user, 'commenting_idea')&.start_at
        },
        reacting_idea: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason,
          cancelling_enabled: !cancelling_reactions_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason,
            future_enabled: liking_disabled_reason && @permissions_service.future_enabled_phase(idea.project, user, 'reacting_idea', reaction_mode: 'up')&.start_at
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason,
            future_enabled: disliking_disabled_reason && @permissions_service.future_enabled_phase(idea.project, user, 'reacting_idea', reaction_mode: 'down')&.start_at
          }
        },
        comment_reacting_idea: {
          enabled: !comment_reacting_disabled_reason,
          disabled_reason: comment_reacting_disabled_reason,
          future_enabled: comment_reacting_disabled_reason && @permissions_service.future_enabled_phase(idea.project, user, 'commenting_idea')&.start_at
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason,
          future_enabled: voting_disabled_reason && @permissions_service.future_enabled_phase(idea.project, user, 'voting')&.start_at
        }
      }
    end
  end
end
