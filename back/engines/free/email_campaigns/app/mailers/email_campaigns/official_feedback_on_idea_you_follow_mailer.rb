# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnIdeaYouFollowMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc]
    end

    def substitution_variables
      {
        input_title: localize_for_recipient(event&.idea_title_multiloc),
        feedback_author_name: localize_for_recipient(event&.official_feedback_author_multiloc),
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          official_feedback_author_multiloc: data.initiator.display_name_multiloc, # TODO: Maybe organisation name here? eg 'City of Plattsburgh Official'
          official_feedback_body_multiloc: data.comment.body_multiloc,
          official_feedback_url: data.idea.url,
          idea_published_at: Time.zone.today.prev_week.iso8601,
          idea_title_multiloc: data.idea.title_multiloc,
          idea_body_multiloc: data.idea.body_multiloc,
          idea_author_name: data.author.display_name,
          unfollow_url: data.idea.url, # TODO: Check what this should be - live version appears to not have this - is it broken?
          input_term: 'idea'
        }
      }
    end

    private

    helper_method :author_name

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end
  end
end
