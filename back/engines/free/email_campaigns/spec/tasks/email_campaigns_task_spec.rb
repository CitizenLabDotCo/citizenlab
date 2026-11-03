# frozen_string_literal: true

require 'rails_helper'

describe Rake::Task do
  before(:context) do
    load_rake_tasks_if_not_loaded
  end

  let(:task) { described_class[task_name] }

  describe ':schedule_email_campaigns' do
    let(:task_name) { 'email_campaigns:schedule_email_campaigns' }

    it 'enqueues a TriggerOnScheduleJob for every tenant' do
      time = Time.now

      travel_to(time) do
        expect { task.execute }
          .to have_enqueued_job(EmailCampaigns::TriggerOnScheduleJob)
          .with(time.to_i)
          .exactly(Tenant.count).times
      end
    end
  end

  describe ':assure_campaign_records' do
    let(:task_name) { 'email_campaigns:assure_campaign_records' }

    it 'creates the missing campaign records' do
      delivery_service = EmailCampaigns::DeliveryService.new

      # A set difference, not size arithmetic: `manual_campaign_types` is
      # feature-independent, so it can name types absent from `campaign_types`.
      instantiatable = delivery_service.campaign_types - delivery_service.manual_campaign_types

      expect { task.execute }
        .to change(EmailCampaigns::Campaign, :count)
        .by(instantiatable.size)
    end
  end
end
