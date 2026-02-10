# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notification do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:notification)).to be_valid
    end
  end

  describe 'all notification subclass factories' do
    it 'are valid' do
      NotificationService.new.notification_classes.each do |notification_subclass|
        expect(build(notification_subclass.model_name.element.to_sym)).to be_valid
      end
    end
  end

  describe 'make_notifications_on' do
    it 'makes a comment on your comment and comment on idea you follow notification on created comment activity' do
      idea = create(:idea)
      parent_comment = create(:comment, idea: idea)
      child_comment = create(:comment, parent: parent_comment, idea: idea)
      create(:follower, followable: idea)
      activity = create(:activity, item: child_comment, action: 'created')

      notifications = Notifications::CommentOnYourComment.make_notifications_on activity
      expect(notifications).to be_present
      notifications = Notifications::CommentOnIdeaYouFollow.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a mentioned in comment notification on comment mentioned' do
      comment = create(:comment)
      mentioned_user = create(:user)
      activity = create(:activity, item: comment, action: 'mentioned', payload: { mentioned_user: mentioned_user.id })

      notifications = Notifications::MentionInComment.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes an idea marked as spam notification on spam report created' do
      create(:admin)
      idea = create(:idea)
      spam_report = create(:spam_report, spam_reportable: idea)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::IdeaMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a comment marked as spam notification on spam report created' do
      create(:admin)
      comment = create(:comment)
      spam_report = create(:spam_report, spam_reportable: comment)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::CommentMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a status change on idea you follow notification on status changed' do
      idea = create(:idea)
      create(:follower, followable: idea)
      activity = create(:activity, item: idea, action: 'changed_status')

      notifications = Notifications::StatusChangeOnIdeaYouFollow.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a comment deleted by admin notification on comment marked_as_deleted' do
      recipient = create(:user)
      comment = create(:comment, author: recipient)
      activity = create(:activity, item: comment, action: 'marked_as_deleted', payload: { reason_code: 'other', other_reason: "it's just a test" })

      notifications = Notifications::CommentDeletedByAdmin.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes an invite accepted notification on invite accepted' do
      initiating_user = create(:user)
      invite = create(:invite, invitee: initiating_user)
      activity = create(:activity, item: invite, action: 'accepted')

      notifications = Notifications::InviteAccepted.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a project moderation rights received notification on moderator (user) project_moderation_rights_given' do
      project = create(:project)
      moderator = create(:project_moderator, projects: [project])
      activity = create(:activity, item: moderator, action: 'project_moderation_rights_given',
        payload: { project_id: project.id })

      notifications = Notifications::ProjectModerationRightsReceived.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes project_folder_moderation_rights_received notifications on user project_folder_moderation_rights_received' do
      folder = create(:project_folder)
      create(:admin)
      user = create(:user)
      activity = create(:activity, item: user, action: 'project_folder_moderation_rights_received', payload: { project_folder_id: folder.id })

      notifications = Notifications::ProjectFolderModerationRightsReceived.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to contain_exactly(user.id)
    end
  end

  it 'deleting a comment also deletes notifications requiring that comment' do
    comment = create(:comment)
    create(:comment_on_idea_you_follow, comment: comment)
    count = described_class.count
    comment.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting a idea also deletes notifications requiring that idea' do
    idea = create(:idea)
    notification = create(:comment_on_idea_you_follow, idea: idea)
    idea.destroy!

    expect { described_class.find(notification.id) }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'deleting an idea status also deletes notifications requiring that idea status' do
    idea_status = create(:idea_status)
    create(:status_change_on_idea_you_follow, idea_status: idea_status)
    count = described_class.count
    idea_status.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting an invite also deletes notifications requiring that invite' do
    invite = create(:invite)
    create(:invite_accepted, invite: invite)
    count = described_class.count
    invite.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting an official feedback also deletes notifications requiring that official feedback' do
    official_feedback = create(:official_feedback)
    create(:official_feedback_on_idea_you_follow, official_feedback: official_feedback)
    count = described_class.count
    official_feedback.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting a phase also deletes notifications requiring that phase' do
    phase = create(:phase)
    create(:project_phase_started, phase: phase)
    count = described_class.count
    phase.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting a project also deletes notifications requiring that project' do
    project = create(:project)
    create(:project_moderation_rights_received, project: project)
    count = described_class.count
    project.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting a spam report also deletes notifications requiring that spam report' do
    spam_report = create(:spam_report)
    create(:comment_marked_as_spam, spam_report: spam_report)
    count = described_class.count
    spam_report.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting the recipient of a notification also deletes notifications of that recipient' do
    recipient = create(:user)
    create(:project_phase_started, recipient: recipient)
    count = described_class.count
    recipient.destroy!
    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting initiating user also deletes notifications requiring the initiator' do
    u = create(:admin)
    n1 = create(:invite_accepted, initiating_user: u)
    n2 = create(:comment_deleted_by_admin, initiating_user: u)
    u.destroy!

    expect { described_class.find(n1.id) }.to raise_error(ActiveRecord::RecordNotFound)
    expect(described_class.find(n2.id)).to be_present
  end

  it 'deleting a folder also deletes notifications referencing to it' do
    folder = create(:project_folder)
    create(:project_folder_moderation_rights_received, project_folder: folder)
    count = described_class.count
    folder.destroy!

    expect(described_class.count).to eq(count - 1)
  end

  it 'deleting a basket also deletes notifications referencing it' do
    basket = create(:basket)
    create(:voting_basket_submitted, basket: basket)
    create(:voting_basket_not_submitted, basket: basket)
    count = described_class.count
    basket.destroy!

    expect(described_class.count).to eq(count - 2)
  end
end
