# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Delete new idea/initiative/comment for admin notifications'
  task delete_admin_new_content_notifications: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        types = ['Notifications::NewIdeaForAdmin', 'Notifications::NewCommentForAdmin',
          'Notifications::NewInitiativeForAdmin']
        # We first have to clear the types of the removed notifications,
        # otherwise Rails will try to load the model subtype, try to
        # find the corresponding model and fail.
        Notification.where(type: types).update_all(type: nil)
        Notification.where(type: nil).destroy_all
      end
    end
  end

  desc 'Delete official feedback and status change notifications after merging'
  task delete_feedback_status_notifications: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        types = [
          'Notifications::OfficialFeedbackOnCommentedIdea',
          'Notifications::OfficialFeedbackOnCommentedInitiative',
          'Notifications::OfficialFeedbackOnReactedIdea',
          'Notifications::OfficialFeedbackOnReactedInitiative',
          'Notifications::OfficialFeedbackOnYourIdea',
          'Notifications::OfficialFeedbackOnYourInitiative',
          'Notifications::StatusChangeOnCommentedIdea',
          'Notifications::StatusChangeOnCommentedInitiative',
          'Notifications::StatusChangeOnReactedIdea',
          'Notifications::StatusChangeOnReactedInitiative',
          'Notifications::StatusChangeOfYourIdea',
          'Notifications::StatusChangeOfYourInitiative'
        ]
        # We first have to clear the types of the removed notifications,
        # otherwise Rails will try to load the model subtype, try to
        # find the corresponding model and fail.
        Notification.where(type: types).update_all(type: nil)
        Notification.where(type: nil).destroy_all
      end
    end
  end

  desc 'Delete comment notifications after merging'
  task delete_comment_notifications: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        types = [
          'Notifications::CommentOnYourIdea',
          'Notifications::CommentOnYourInitiative'
        ]
        # We first have to clear the types of the removed notifications,
        # otherwise Rails will try to load the model subtype, try to
        # find the corresponding model and fail.
        Notification.where(type: types).update_all(type: nil)
        Notification.where(type: nil).destroy_all
      end
    end
  end

  desc 'Delete notifications with deleted required relationships'
  task delete_invalid_notifications: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.tr('.', '_')) do
        notifications = Notification.where(initiating_user_id: nil)
        notifications = notifications.or(Notification.where(comment_id: nil))
        notifications = notifications.or(Notification.where(post_id: nil))
        notifications = notifications.or(Notification.where(project_id: nil))
        notifications = notifications.or(Notification.where(phase_id: nil))
        notifications = notifications.or(Notification.where(invite_id: nil))
        notifications = notifications.or(Notification.where(official_feedback_id: nil))
        notifications = notifications.or(Notification.where(spam_report_id: nil))
        notifications = notifications.or(Notification.where(post_status_id: nil))
        notifications.reject(&:valid?).each(&:destroy!)
      end
    end
  end
end
