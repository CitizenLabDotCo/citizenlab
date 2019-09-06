module Notifications
  class StatusChangeOnCommentedInitiative < Notification
    
    belongs_to :post_status, polymorphic: true
    belongs_to :post, polymorphic: true
    belongs_to :initiating_user, class_name: 'User', optional: true

    validates :initiative_status, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'Initiative' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on commented initiative'
    

    def self.make_notifications_on activity
      initiative = activity.item

      if initiative.present?
        User.joins(:comments).where(comments: {post: initiative}).distinct.ids.map do |recipient_id|
          if recipient_id != initiative.author_id
            self.new(
              recipient_id: recipient_id,
              initiating_user_id: activity.user_id,
              post: initiative,
              project_id: initiative.project_id,
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

