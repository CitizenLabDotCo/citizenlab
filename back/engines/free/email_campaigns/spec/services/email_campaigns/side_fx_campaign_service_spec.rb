# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::SideFxCampaignService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:campaign) do 
    create(
      :comment_on_your_comment_campaign,
      reply_to: 'noreply@govocal.com'
    )
  end

  describe 'after_create' do
    it "logs a 'created' action when a campaign is created" do
      expect { service.after_create(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'created', user, campaign.updated_at.to_i)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the campaign has changed" do
      campaign.update!(body_multiloc: { en: 'changed' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed', user, campaign.updated_at.to_i)
    end

    it "logs a 'reply_to_changed' action job when the reply_to has changed" do
      campaign.update!(reply_to: 'newreplyto@govocal.com')
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_reply_to', user, campaign.updated_at.to_i, payload: { change: ['noreply@govocal.com', 'newreplyto@govocal.com'] })
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the campaign is destroyed" do
      freeze_time do
        frozen_campaign = campaign.destroy
        expect { service.after_destroy(frozen_campaign, user) }
          .to enqueue_job(LogActivityJob)
      end
    end
  end
end
