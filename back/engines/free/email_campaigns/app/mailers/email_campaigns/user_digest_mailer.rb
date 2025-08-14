# frozen_string_literal: true

module EmailCampaigns
  class UserDigestMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          notifications_count: 2,
          top_ideas: [
            {
              title_multiloc: data.idea.title_multiloc,
              body_multiloc: data.idea.body_multiloc,
              author_name: data.author.display_name,
              likes_count: 7,
              dislikes_count: 0,
              comments_count: 2,
              url: data.idea.url,
              top_comments: [
                {
                  body_multiloc: data.comment.body_multiloc,
                  author_first_name: data.author.first_name,
                  author_last_name: data.author.last_name
                },
                {
                  body_multiloc: data.comment.body_multiloc,
                  author_first_name: data.author.first_name,
                  author_last_name: data.author.last_name
                }
              ]
            },
            {
              title_multiloc: data.idea.title_multiloc,
              body_multiloc: data.idea.body_multiloc,
              author_name: data.author.display_name,
              likes_count: 12,
              dislikes_count: 2,
              comments_count: 1,
              url: data.idea.url,
              top_comments: [
                {
                  body_multiloc: data.comment.body_multiloc,
                  author_first_name: data.author.first_name,
                  author_last_name: data.author.last_name
                }
              ]
            }
          ],
          successful_proposals: [
            {
              title_multiloc: data.proposal.title_multiloc,
              url: data.proposal.url,
              published_at: 1.week.ago.iso8601,
              author_name: data.author.display_name,
              likes_count: 21,
              comments_count: 6
            }
          ]
        }
      }
    end
  end
end
