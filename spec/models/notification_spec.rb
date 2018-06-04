require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:notification)).to be_valid
    end
  end

  describe "all notification subclass factories" do
    before do
      # Make sure that we can find all notification
      # subclasses, but without enabling eager 
      # loading for the other tests.
      Cl2Back::Application.eager_load!
    end
    it "are valid" do
      Notification.descendants.each do |notification_subclass|
        if notification_subclass.descendants.empty?
          expect(build(notification_subclass.model_name.element.to_sym)).to be_valid
        end
      end
    end
  end

  describe "make_notifications_on" do
    it "makes a comment on your comment and comment on your idea notification on created comment activity" do
      idea = create(:idea)
      parent_comment = create(:comment, idea: idea)
      child_comment = create(:comment, parent: parent_comment)
      activity = create(:activity, item: child_comment, action: 'created')

      notifications = Notifications::CommentOnYourComment.make_notifications_on activity
      expect(notifications).to be_present
      notifications = Notifications::CommentOnYourIdea.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes a mentioned in comment notification on comment mentioned" do
      comment = create(:comment)
      mentioned_user = create(:user)
      activity = create(:activity, item: comment, action: 'mentioned', payload: {mentioned_user: mentioned_user.id})

      notifications = Notifications::MentionInComment.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes an idea marked as spam notification on spam report created" do
      recipient = create(:admin)
      idea = create(:idea)
      spam_report = create(:spam_report, spam_reportable: idea)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::IdeaMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes a comment marked as spam notification on spam report created" do
      recipient = create(:admin)
      comment = create(:comment)
      spam_report = create(:spam_report, spam_reportable: comment)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::CommentMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes a status change of your idea notification on spam report created" do
      recipient = create(:user)
      idea = create(:idea, author: recipient)
      activity = create(:activity, item: idea, action: 'changed_status')

      notifications = Notifications::StatusChangeOfYourIdea.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes a comment deleted by admin notification on comment marked_as_deleted" do
      recipient = create(:user)
      comment = create(:comment, author: recipient)
      activity = create(:activity, item: comment, action: 'marked_as_deleted', payload: {reason_code: 'other', other_reason: "it's just a test"})

      notifications = Notifications::CommentDeletedByAdmin.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes an invite accepted notification on invite accepted" do
      initiating_user = create(:user)
      invite = create(:invite, invitee: initiating_user)
      activity = create(:activity, item: invite, action: 'accepted')

      notifications = Notifications::InviteAccepted.make_notifications_on activity
      expect(notifications).to be_present
    end

    it "makes a project moderation rights received notification on moderator (user) project_moderation_rights_given" do
      project = create(:project)
      moderator = create(:moderator, project: project)
      activity = create(:activity, item: moderator, action: 'project_moderation_rights_given', payload: {project_id: project.id})

      notifications = Notifications::ProjectModerationRightsReceived.make_notifications_on activity
      expect(notifications).to be_present
    end
  end
end
