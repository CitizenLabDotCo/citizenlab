# frozen_string_literal: true

module EmailCampaigns
  class ModeratorDigestMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        project_title: event&.project_title,
        firstName: recipient_first_name,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      @recipient = recipient
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          project_id: data.project.id,
          project_title: localize_for_recipient(data.project.title_multiloc),
          statistics: {
            new_ideas_increase: 1,
            new_comments_increase: 2,
            new_participants_increase: 3
          },
          top_ideas: [
            {
              id: data.idea.id,
              title_multiloc: data.idea.title_multiloc,
              url: data.idea.url,
              published_at: (Time.now - 1.week).iso8601,
              author_name: data.author.display_name,
              likes_count: 10,
              likes_increment: 4,
              dislikes_count: 7,
              dislikes_increment: 3,
              comments_count: 5,
              comments_increment: 2
            }
          ],
          has_new_ideas: true,
          successful_proposals: [
            {
              id: data.proposal.id,
              title_multiloc: data.proposal.title_multiloc,
              url: data.proposal.url,
              published_at: (Time.now - 3.days).iso8601,
              author_name: data.author.display_name,
              likes_count: 24,
              comments_count: 13
            }
          ]
        },
        tracked_content: {
          idea_ids: [data.idea.id, data.proposal.id]
        }
      }
    end

    private

    helper_method :change_ideas, :change_comments, :change_users

    def increase_from(statistic)
      return 0 if statistic.increase.zero?

      ((statistic.increase - statistic.past_increase) / statistic.increase.to_f * 100).round
    end

    def change_ideas
      @change_ideas ||= increase_from(event.statistics.activities.new_ideas)
    end

    def change_comments
      @change_comments ||= increase_from(event.statistics.activities.new_comments)
    end

    def change_users
      @change_users ||= increase_from(event.statistics.users.new_participants)
    end
  end
end
