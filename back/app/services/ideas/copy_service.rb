# frozen_string_literal: true

module Ideas
  class CopyService
    def copy(ideas, dest_phase, _current_user)
      check_ideas!(ideas)

      proposed_idea_status = IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')
      transitive_pmethod = dest_phase.pmethod.transitive?
      summary = CopySummary.new

      ideas.each do |idea|
        copy = idea.dup.tap do |i|
          i.project = dest_phase.project
          i.phases = [dest_phase]
          i.publication_status = 'published'
          i.idea_status = proposed_idea_status
          i.creation_phase = transitive_pmethod ? nil : dest_phase

          # We discard the custom field values because they are tied to the custom form
          # model, which is specific to the source participation context. In the future,
          # this could be improved by supporting a way to map source fields to
          # corresponding fields in the destination custom form.
          i.custom_field_values = {}

          i.slug = nil
          i.assignee_id = nil
          i.assigned_at = nil

          # Manual votes are not copied over (for consistency, since we don't copy votes).
          i.manual_votes_amount = 0
          i.manual_votes_last_updated_at = nil
          i.manual_votes_last_updated_by_id = nil

          # The following associations are not copied over:
          # Reactions, baskets, comments, internal comments, official feedback, followers
          # votes.
          i.likes_count = 0
          i.dislikes_count = 0
          i.neutral_reactions_count = 0

          i.baskets_count = 0
          i.votes_count = 0
          i.followers_count = 0

          i.comments_count = 0
          i.internal_comments_count = 0
          i.official_feedbacks_count = 0
        end

        Idea.transaction do
          copy.save!(touch: false)
          copy.related_ideas << idea
        end
      rescue StandardError => e
        summary.errors[idea.id] = e # rubocop:disable Rails/DeprecatedActiveModelErrorsMethods
      ensure
        summary.count += 1
      end

      summary
    end

    private

    def check_ideas!(ideas)
      ideas = Idea.where(id: ideas)

      if ideas.draft.exists?
        raise IdeaCopyNotAllowedError, :cannot_copy_draft_ideas
      end

      if ideas.native_survey.exists?
        raise IdeaCopyNotAllowedError, :cannot_copy_native_survey_responses
      end
    end

    class CopySummary
      attr_accessor :count, :errors

      def initialize(count: 0, errors: {})
        @count = count
        @errors = errors
      end
    end

    class IdeaCopyNotAllowedError < ArgumentError; end
  end
end
