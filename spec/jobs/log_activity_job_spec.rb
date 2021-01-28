require 'rails_helper'

RSpec.describe LogActivityJob, type: :job do

  subject(:job) { LogActivityJob.new }

  describe '#perform' do
    it "logs an activity with a GlobalID" do
      idea = create(:idea)
      user = create(:user)
      expect{job.perform(idea, "created", user, Time.now)}.to change{Activity.count}.from(0).to(1)
    end

    it "logs a notification activity with the notification's subclass item_type" do
      notification = create(:comment_on_your_comment)
      user = create(:user)
      job.perform(notification, "created", user, Time.now)
      expect(Activity.last.item_type).to eq notification.class.name
    end

    it "logs an activity with a composed deleted resource" do
      idea = create(:idea)
      frozen_idea = idea.destroy
      user = create(:user)
      expect{job.perform("Idea/#{frozen_idea.id}", "deleted", user, Time.now)}.to change{Activity.count}.from(0).to(1)
    end

    it "logs an activity when the user is nil" do
      area = create(:area)
      job.perform(area, "created", nil, Time.now)
      expect(Activity.last.item_type).to eq area.class.name
    end

    it "enqueues a MakeNotificationsForClassJob when there's a matching notification" do
      admin = create(:admin)
      user = create(:user)
      t = Time.now
      expect{job.perform(user, "admin_rights_given", admin, t)}
        .to have_enqueued_job(MakeNotificationsForClassJob)
        .with do |notification_class, activity|
          expect(notification_class).to eq 'Notifications::AdminRightsReceived'
          expect(activity.item).to match ({
            item: user,
            user: admin,
            action: 'admin_rights_given',
            acted_at: t
          })
        end
    end

    it "enqueues a EmailCampaigns::TriggerOnActivityJob" do
      spam_report = create(:spam_report)
      user = create(:user)
      expect{job.perform(spam_report, "created", user, Time.now)}.to have_enqueued_job(EmailCampaigns::TriggerOnActivityJob)
    end

    it "enqueues a PublishActivityToRabbitJob when bunny is initialized" do
      idea = create(:idea)
      user = create(:user)
      expect{job.perform(idea, "created", user, Time.now)}.to have_enqueued_job(PublishActivityToRabbitJob)
    end

    it "enqueues a TrackEventJob when Analytics is initialized" do
      idea = create(:idea)
      user = create(:user)
      expect{job.perform(idea, "created", user, Time.now)}.to have_enqueued_job(TrackEventJob)
    end

    it "doesn't enqueue a TrackEventJob when the item is a notification" do
      item = create(:notification)
      user = create(:user)
      expect{job.perform(item, 'created', user, Time.now)}.not_to have_enqueued_job(TrackEventJob)
    end

  end
end
