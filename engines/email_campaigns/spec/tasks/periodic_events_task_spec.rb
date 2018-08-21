require "rails_helper"

describe "rake periodic_events" do
  before(:context) do
    Rails.application.load_tasks
  end

  let(:task_name) { "periodic_events:schedule_email_campaigns" }
  let(:task) { Rake::Task[task_name]}

  describe(':schedule_email_campaigns') do
    it "enqueues a TriggerOnScheduleJob for every tenant" do
      t = Time.now
      travel_to(t) do
        tenant = create(:tenant)

        expect{task.execute}
          .to have_enqueued_job(EmailCampaigns::TriggerOnScheduleJob)
          .with(t.to_i)
          .exactly(2).times
      end
    end
  end
end
