# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailer < ApplicationMailer
    include EditableWithPreview

    def self.campaign_class
      Campaigns::AdminDigest
    end

    def self.editable_regions
      [
        define_editable_region(
          :subject_multiloc,
          default_message_key: 'subject',
          variables: ['time']
        ),
        define_editable_region(
          :title_multiloc,
          default_message_key: 'title_your_weekly_report',
          variables: ['firstName']
        ),
        define_editable_region(
          :intro_multiloc,
          type: 'html',
          default_message_key: 'text_introduction',
          variables: [],
          allow_blank_locales: true
        )
      ]
    end

    def self.preview_command(recipient: nil)
      data = preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          statistics: {
            new_inputs_increase: 1,
            new_comments_increase: 1,
            new_users_increase: 1
          },
          top_project_inputs: [
            {
              project: { url: data[:project_url], title_multiloc: data[:project_title_multiloc] },
              current_phase: nil,
              top_ideas: [
                {
                  id: '1234',
                  title_multiloc: data[:idea_title_multiloc],
                  url: data[:idea_url],
                  published_at: 1.week.ago.iso8601,
                  author_name: data[:user_display_name],
                  likes_count: 10,
                  likes_increment: 2,
                  dislikes_count: 3,
                  dislikes_increment: 1,
                  comments_count: 4,
                  comments_increment: 2
                }
              ]
            }
          ],
          successful_proposals: [
            {
              id: '1234',
              title_multiloc: data[:proposal_title_multiloc],
              url: data[:idea_url],
              published_at: 1.day.ago.iso8601,
              author_name: data[:user_display_name],
              likes_count: 12,
              comments_count: 5
            }
          ]
        },
        tracked_content: {
          idea_ids: ['1234']
        }
      }
    end

    protected

    def substitution_variables
      {
        time: formatted_todays_date,
        firstName: recipient_first_name,
        organizationName: organization_name
      }
    end
  end
end
