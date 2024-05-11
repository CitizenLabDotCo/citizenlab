# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::SideFxCampaignService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:campaign) { create(:manual_project_participants_campaign, project: project) }

  describe 'after_send' do
    it 'includes correct project_id for ManualProjectParticipants campaign' do
      expect { service.after_send(campaign, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(campaign, 'sent', user, campaign.created_at.to_i, project_id: project.id)
    end
  end
end
