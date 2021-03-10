# frozen_string_literal: true

module GranularPermissions
  module Patches
    module ParticipationContextService
      def posting_idea_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'posting_idea', context)
      end

      def commenting_idea_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'commenting_idea', context)
      end

      def voting_idea_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'voting_idea', context)
      end

      def cancelling_votes_disabled_reason_for_idea(idea, user)
        super || @permission_service.denied?(user, 'voting_idea', context)
      end

      def taking_survey_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'taking_survey', context)
      end

      def taking_poll_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'taking_poll', context)
      end

      def budgeting_disabled_reason_for_context(context, user)
        super || @permission_service.denied?(user, 'budgeting', context)
      end
    end
  end
end
