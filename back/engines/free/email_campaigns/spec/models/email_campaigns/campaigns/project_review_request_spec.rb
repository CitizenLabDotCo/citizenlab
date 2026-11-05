# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectReviewRequest do
  describe 'ProjectReviewRequest Campaign default factory' do
    it 'is valid' do
      expect(build(:project_review_request_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:project_review_request_campaign) }
    let(:notification) { create(:project_review_request) }
    let(:activity) { create(:activity, item: notification, action: 'created') }

    it 'generates the correct commands' do
      commands = campaign.generate_commands(
        recipient: notification.recipient,
        activity: activity
      )

      expect(commands).to be_an(Array)
      expect(commands.size).to eq(1)
      expect(commands[0][:event_payload]).to eq(
        admin_project_url: "http://example.org/admin/projects/#{notification.project_review.project_id}",
        project_description_multiloc: notification.project_review.project.description_preview_multiloc,
        project_title_multiloc: notification.project_review.project.title_multiloc,
        requester_name: notification.project_review.requester.first_name
      )
    end
  end

  describe 'filters' do
    let(:campaign) { create(:project_review_request_campaign) }
    let(:notification) { create(:project_review_request) }
    let(:activity) { create(:activity, item: notification, action: 'created') }

    it 'is sent if the review is still pending' do
      expect(campaign.filter_pending_request(activity: activity)).to be true
    end

    it 'is not sent if the review has been approved' do
      notification.project_review.approve!(create(:admin))
      expect(campaign.filter_pending_request(activity: activity)).to be false
    end
  end
end
