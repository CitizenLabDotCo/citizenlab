# frozen_string_literal: true

module Ideas
  class CopyService
    def copy(ideas, dest_phase, _current_user)
      check_ideas!(ideas)

      proposed_idea_status = IdeaStatus.find_by(code: 'proposed')

      new_ids = ideas.map do |idea|
        copy = idea.dup.tap do |i|
          i.project = dest_phase.project
          i.phases = [dest_phase]
          i.publication_status = 'published'
          i.idea_status = proposed_idea_status

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

          i.save!
        end

        # Preserving the original timestamps. This isn’t strictly necessary, but it seems
        # like the right thing to do. This could be reconsidered in the future.
        copy.update_columns(
          updated_at: idea.updated_at,
          created_at: idea.created_at
        )
      end

      Idea.where(id: new_ids)
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

    class IdeaCopyNotAllowedError < ArgumentError; end
  end
end
