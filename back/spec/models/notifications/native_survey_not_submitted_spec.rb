# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::NativeSurveyNotSubmitted do
  describe 'make_notifications_on' do
    it 'makes a notification when an idea is flagged as "survey_not_submitted"' do
      idea = create(:native_survey_response, author: create(:user))
      activity = create(:activity, item: idea, action: 'survey_not_submitted')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: idea.author_id,
        post: idea,
        project: idea.project,
        phase: idea.creation_phase
      )
    end
  end
end
