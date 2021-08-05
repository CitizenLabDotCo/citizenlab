# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notification, type: :model do
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
    it 'makes a comment on your comment and comment on your idea notification on created comment activity' do
      idea = create(:idea)
      parent_comment = create(:comment, post: idea)
      child_comment = create(:comment, parent: parent_comment)
      activity = create(:activity, item: child_comment, action: 'created')

      notifications = Notifications::CommentOnYourComment.make_notifications_on activity
      expect(notifications).to be_present
      notifications = Notifications::CommentOnYourIdea.make_notifications_on activity
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
      recipient = create(:admin)
      idea = create(:idea)
      spam_report = create(:spam_report, spam_reportable: idea)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::IdeaMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a comment marked as spam notification on spam report created' do
      recipient = create(:admin)
      comment = create(:comment)
      spam_report = create(:spam_report, spam_reportable: comment)
      activity = create(:activity, item: spam_report, action: 'created')

      notifications = Notifications::CommentMarkedAsSpam.make_notifications_on activity
      expect(notifications).to be_present
    end

    it 'makes a status change of your idea notification on spam report created' do
      recipient = create(:user)
      idea = create(:idea, author: recipient)
      activity = create(:activity, item: idea, action: 'changed_status')

      notifications = Notifications::StatusChangeOfYourIdea.make_notifications_on activity
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

    it 'makes project_phase_started notifications for members of the project group' do
      phase = create(:active_phase)
      project = phase.project
      project.visible_to = 'groups'
      project.groups << create(:group)
    end

    it 'makes project_phase_started notifications on phase started' do
      phase = create(:active_phase)
      project = phase.project
      project.visible_to = 'groups'
      project.groups << create(:group)

      # members
      user = create(:user, email: 'user1@example.com', manual_groups: [project.groups.first])
      _admin = create(:admin, email: 'admin@example.com', manual_groups: [project.groups.first])
      # non-members
      _other_user = create(:admin)
      _other_admin = create(:user, email: 'user2@example.com')

      activity = create(:activity, item: phase, action: 'started')

      notifications = Notifications::ProjectPhaseStarted.make_notifications_on(activity)
      expect(notifications.map(&:recipient_id)).to match_array [user.id]
    end
  end

  it 'deleting a comment also deletes notifications requiring that comment' do
    comment = create(:comment)
    notification = create(:comment_on_your_idea, comment: comment)
    count = Notification.count
    comment.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting a post also deletes notifications requiring that post' do
    post = create(:idea)
    notification = create(:comment_on_your_idea, post: post)
    post.destroy!

    expect { described_class.find(notification.id) }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it 'deleting an idea status also deletes notifications requiring that idea status' do
    idea_status = create(:idea_status)
    notification = create(:status_change_of_your_idea, post_status: idea_status)
    count = Notification.count
    idea_status.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting an initiative status also deletes notifications requiring that initiative status' do
    initiative_status = create(:initiative_status)
    notification = create(:status_change_of_your_initiative, post_status: initiative_status)
    count = Notification.count
    initiative_status.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting an invite also deletes notifications requiring that invite' do
    invite = create(:invite)
    notification = create(:invite_accepted, invite: invite)
    count = Notification.count
    invite.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting an official feedback also deletes notifications requiring that official feedback' do
    official_feedback = create(:official_feedback)
    notification = create(:official_feedback_on_your_idea, official_feedback: official_feedback)
    count = Notification.count
    official_feedback.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting a phase also deletes notifications requiring that phase' do
    phase = create(:phase)
    create(:project_phase_started, phase: phase)
    count = Notification.count
    phase.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting a project also deletes notifications requiring that project' do
    project = create(:project)
    create(:project_moderation_rights_received, project: project)
    count = Notification.count
    project.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting a spam report also deletes notifications requiring that spam report' do
    spam_report = create(:spam_report)
    create(:comment_marked_as_spam, spam_report: spam_report)
    count = Notification.count
    spam_report.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting the recipient of a notification also deletes notifications of that recipient' do
    recipient = create(:user)
    create(:project_phase_started, recipient: recipient)
    count = Notification.count
    recipient.destroy!
    expect(Notification.count).to eq (count - 1)
  end

  it 'deleting initiating user also deletes notifications requiring the initiator' do
    u = create(:admin)
    n1 = create(:invite_accepted, initiating_user: u)
    n2 = create(:comment_deleted_by_admin, initiating_user: u)
    u.destroy!

    expect { described_class.find(n1.id) }.to raise_error(ActiveRecord::RecordNotFound)
    expect(described_class.find(n2.id)).to be_present
  end
end
