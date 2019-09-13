module Notifications
  class StatusChangeOnVotedInitiative < Notification

    validates :post_status, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'Initiative' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on voted initiative'


    def self.make_notifications_on activity
      initiative = activity.item

      if initiative.present?
        comment_author_ids = User.joins(:comments).where(comments: {post: initiative}).distinct.ids
        User.joins(:votes).where(votes: {votable: initiative}).distinct.ids.map do |recipient_id|
          if !(comment_author_ids + [initiative.author_id]).include?(recipient_id)
            self.new(
              recipient_id: recipient_id,
              initiating_user_id: activity.user_id,
              post: initiative,
              post_status: initiative.initiative_status
            )
          end
        end
      else
        []
      end.compact
    end

  end
end

