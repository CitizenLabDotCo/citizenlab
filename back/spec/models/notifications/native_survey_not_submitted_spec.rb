# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::NativeSurveyNotSubmitted do
  describe 'make_notifications_on' do
    it 'makes a notification when an input is flagged as "survey_not_submitted"' do
      create(:idea_status_proposed)
      input = create(:native_survey_response, author: create(:user))
      activity = create(:activity, item: input, action: 'survey_not_submitted')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: input.author_id,
        post: input,
        project: input.project,
        phase: input.creation_phase
      )
    end
  end
end
