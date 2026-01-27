# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LogActivityJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'logs an activity with a GlobalID' do
      idea = create(:idea)
      user = create(:user)
      expect { job.perform(idea, 'created', user, Time.now) }.to change(Activity, :count).from(0).to(1)
    end

    it "logs a notification activity with the notification's subclass item_type" do
      notification = create(:comment_on_your_comment)
      user = create(:user)
      job.perform(notification, 'created', user, Time.now)
      expect(Activity.last.item_type).to eq notification.class.name
    end

    it 'logs an activity with a composed deleted resource' do
      idea = create(:idea)
      frozen_idea = idea.destroy
      user = create(:user)
      expect { job.perform("Idea/#{frozen_idea.id}", 'deleted', user, Time.now) }.to change(Activity, :count).from(0).to(1)
    end

    it 'logs an activity when the user is nil' do
      area = create(:area)
      job.perform(area, 'created', nil, Time.now)
      expect(Activity.last.item_type).to eq area.class.name
    end

    it "enqueues a MakeNotificationsForClassJob when there's a matching notification" do
      admin = create(:admin)
      user = create(:user)
      t = Time.now
      expect { job.perform(user, 'admin_rights_given', admin, t) }
        .to have_enqueued_job(MakeNotificationsForClassJob)
        .with do |notification_class, activity|
        expect(notification_class).to eq 'Notifications::AdminRightsReceived'
        expect(activity.item).to match({
          item: user,
          user: admin,
          action: 'admin_rights_given',
          acted_at: t
        })
      end
    end

    it 'enqueues a EmailCampaigns::TriggerOnActivityJob' do
      spam_report = create(:spam_report)
      user = create(:user)
      expect { job.perform(spam_report, 'created', user, Time.now) }.to have_enqueued_job(EmailCampaigns::TriggerOnActivityJob)
    end

    it 'enqueues a PublishActivityToRabbitJob when bunny is initialized' do
      idea = create(:idea)
      user = create(:user)
      expect { job.perform(idea, 'created', user, Time.now) }.to have_enqueued_job(PublishActivityToRabbitJob)
    end

    it 'enqueues a TrackEventJob when Analytics is initialized' do
      idea = create(:idea)
      user = create(:user)
      expect { job.perform(idea, 'created', user, Time.now) }.to have_enqueued_job(TrackEventJob)
    end

    it "doesn't enqueue a TrackEventJob when the item is a notification" do
      item = create(:notification)
      user = create(:user)
      expect { job.perform(item, 'created', user, Time.now) }.not_to have_enqueued_job(TrackEventJob)
    end

    it 'calls Webhooks::EnqueueService when there are enabled webhooks' do
      allow(Resolv).to receive(:getaddresses).with(a_string_matching(/webhook.example.com.*/)).and_return(['93.184.216.34'])

      create(:webhook_subscription)
      idea = create(:idea)

      expect_any_instance_of(Webhooks::EnqueueService).to receive(:call).with(instance_of(Activity))

      job.perform(idea, 'created', idea.author, Time.now)
    end

    it 'does not call Webhooks::EnqueueService when there are no enabled webhooks' do
      idea = create(:idea)

      expect_any_instance_of(Webhooks::EnqueueService).not_to receive(:call)

      job.perform(idea, 'created', idea.author, Time.now)
    end
  end

  describe '.perform_later' do
    context 'when the item has `#project_id` method' do
      let(:item) { create(:project) }

      it 'adds the project id to the options of the enqueued job' do
        expect(item).to receive(:project_id).and_call_original

        user = :user_sentinel
        expect { described_class.perform_later(item, 'created', user) }
          .to enqueue_job(described_class)
          .with(item, 'created', user, nil, { project_id: item.id })
      end

      context 'and the project_id is passed explicitly' do
        it 'leaves the options of the enqueued job unchanged' do
          expect(item).not_to receive(:project_id)

          user = :user_sentinel
          acted_at = :acted_at_sentinel
          options = { payload: 'payload', project_id: 'some-arbitrary-id' }

          expect { described_class.perform_later(item, 'created', user, acted_at, options) }
            .to enqueue_job(described_class).with(item, 'created', user, acted_at, options)
        end
      end
    end

    context 'when the item does not have `project_id` method' do
      let(:item) { create(:invite) }

      it 'leaves the options of the enqueued job unchanged' do
        expect { described_class.perform_later(item, 'created', nil, payload: 'payload') }
          .to enqueue_job(described_class).with(item, 'created', nil, payload: 'payload')
      end
    end
  end

  describe '.perform_now' do
    context 'when the item has `#project_id` method' do
      let(:item) { create(:project) }

      it 'adds the project id to the options' do
        user = :user_sentinel

        expect(item).to receive(:project_id).and_call_original
        expect_any_instance_of(described_class)
          .to receive(:run)
          .with(item, 'created', user, nil, project_id: item.id)

        described_class.perform_now(item, 'created', user)
      end

      context 'and the project_id is passed explicitly' do
        it 'leaves the options unchanged' do
          user = nil
          acted_at = Time.zone.now

          expect_any_instance_of(described_class)
            .to receive(:run)
            .with(item, 'created', user, acted_at, payload: 'payload', project_id: 'some-arbitrary-id')

          described_class.perform_now(item, 'created', user, acted_at, payload: 'payload', project_id: 'some-arbitrary-id')
        end
      end
    end

    context 'when the item does not have `project_id` method' do
      let(:item) { create(:invite) }

      it 'leaves the options unchanged' do
        expect_any_instance_of(described_class)
          .to receive(:run)
          .with(item, 'created', nil, payload: 'payload')

        described_class.perform_now(item, 'created', nil, payload: 'payload')
      end
    end
  end

  describe 'logging of project_id' do
    where(:model_class) do
      [
        AreasProject,
        Basket,
        Comment,
        ContentBuilder::Layout,
        CustomField,
        CustomFieldOption,
        CustomForm,
        CustomMaps::MapConfig,
        Event,
        FlagInappropriateContent::InappropriateContentFlag,
        FlagInappropriateContent::Notifications::InappropriateContentFlagged,
        GroupsProject,
        Idea,
        IdeaAssignment::Notifications::IdeaAssignedToYou,
        InputTopic,
        Moderation::Moderation,
        Moderation::ModerationStatus,
        Notification,
        Notifications::AdminRightsReceived,
        Notifications::CommentDeletedByAdmin,
        Notifications::CommentMarkedAsSpam,
        Notifications::CommentOnYourComment,
        Notifications::CommentOnIdeaYouFollow,
        Notifications::IdeaMarkedAsSpam,
        Notifications::InviteAccepted,
        Notifications::MarkedAsSpam,
        Notifications::MentionInComment,
        Notifications::MentionInOfficialFeedback,
        Notifications::OfficialFeedbackOnIdeaYouFollow,
        Notifications::ProjectFolderModerationRightsReceived,
        Notifications::ProjectModerationRightsReceived,
        Notifications::ProjectPhaseStarted,
        Notifications::ProjectPhaseUpcoming,
        Notifications::ProjectPublished,
        Notifications::StatusChangeOnIdeaYouFollow,
        Notifications::ThresholdReachedForAdmin,
        OfficialFeedback,
        Phase,
        Polls::Option,
        Polls::Question,
        Polls::Response,
        Project,
        ProjectFile,
        ProjectImage,
        ProjectsGlobalTopic,
        SpamReport,
        Surveys::Response,
        Volunteering::Cause,
        Volunteering::Volunteer,
        Reaction
      ]
    end

    with_them do
      it "expects #{params[:model_class]} instances to respond to #project_id" do
        expect(model_class.new).to respond_to(:project_id)
      end
    end
  end
end
