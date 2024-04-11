# frozen_string_literal: true

require 'rails_helper'

describe 'rake email_campaigns' do
  before do
    load_rake_tasks_if_not_loaded
  end

  let(:task) { Rake::Task[task_name] }

  describe ':schedule_email_campaigns' do
    let(:task_name) { 'email_campaigns:schedule_email_campaigns' }

    it 'enqueues a TriggerOnScheduleJob for every tenant' do
      t = Time.zone.now
      travel_to(t) do
        create(:tenant)

        expect { task.execute }
          .to have_enqueued_job(EmailCampaigns::TriggerOnScheduleJob)
          .with(t.to_i)
          .exactly(Tenant.count).times
      end
    end
  end

  describe ':assure_campaign_records' do
    let(:task_name) { 'email_campaigns:assure_campaign_records' }

    it 'creates the missing campaign records' do
      delivery_service = EmailCampaigns::DeliveryService.new

      expect { task.execute }
        .to change(EmailCampaigns::Campaign, :count)
        .by(delivery_service.campaign_types.size - delivery_service.manual_campaign_types.size)
    end
  end
end
