# frozen_string_literal: true

require 'rails_helper'

describe Rake::Task do
  before(:context) do
    Rails.application.load_tasks
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
      expect { task.execute }
        .to change(EmailCampaigns::Campaign, :count)
        .by(EmailCampaigns::DeliveryService.new.campaign_types.size - 1)
    end
  end
end
