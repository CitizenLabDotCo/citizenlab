# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::SideFxCampaignService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:campaign) do
    create(
      :comment_on_your_comment_campaign,
      enabled: true,
      reply_to: 'noreply@govocal.com',
      body_multiloc: { 'en' => 'Initial body' },
      subject_multiloc: { 'en' => 'Initial subject' },
      title_multiloc: { 'en' => 'Initial title' },
      intro_multiloc: { 'en' => 'Initial intro' },
      button_text_multiloc: { 'en' => 'Initial button text' }
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
      campaign.update!(body_multiloc: { 'en' => 'changed' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed', user, campaign.updated_at.to_i)
    end

    it "logs a 'enabled_changed' action job when the enabled has changed" do
      campaign.update!(enabled: false)
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_enabled', user, campaign.updated_at.to_i, payload: { change: [true, false] })
    end

    it "logs a 'reply_to_changed' action job when the reply_to has changed" do
      campaign.update!(reply_to: 'newreplyto@govocal.com')
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_reply_to', user, campaign.updated_at.to_i, payload: { change: ['noreply@govocal.com', 'newreplyto@govocal.com'] })
    end

    it "logs a 'body_multiloc_changed' action job when the body_multiloc has changed" do
      campaign.update!(body_multiloc: { 'en' => 'Changed body' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_body_multiloc', user, campaign.updated_at.to_i, payload: { change: [{ 'en' => 'Initial body' }, { 'en' => 'Changed body' }] })
    end

    it "logs a 'subject_multiloc_changed' action job when the subject_multiloc has changed" do
      campaign.update!(subject_multiloc: { 'en' => 'Changed subject' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_subject_multiloc', user, campaign.updated_at.to_i, payload: { change: [{ 'en' => 'Initial subject' }, { 'en' => 'Changed subject' }] })
    end

    it "logs a 'title_multiloc_changed' action job when the title_multiloc has changed" do
      campaign.update!(title_multiloc: { 'en' => 'Changed title' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_title_multiloc', user, campaign.updated_at.to_i, payload: { change: [{ 'en' => 'Initial title' }, { 'en' => 'Changed title' }] })
    end

    it "logs a 'intro_multiloc_changed' action job when the intro_multiloc has changed" do
      campaign.update!(intro_multiloc: { 'en' => 'Changed intro' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_intro_multiloc', user, campaign.updated_at.to_i, payload: { change: [{ 'en' => 'Initial intro' }, { 'en' => 'Changed intro' }] })
    end

    it "logs a 'button_text_multiloc_changed' action job when the button_text_multiloc has changed" do
      campaign.update!(button_text_multiloc: { 'en' => 'Changed button text' })
      expect { service.after_update(campaign, user) }
        .to enqueue_job(LogActivityJob)
        .with(campaign, 'changed_button_text_multiloc', user, campaign.updated_at.to_i, payload: { change: [{ 'en' => 'Initial button text' }, { 'en' => 'Changed button text' }] })
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
