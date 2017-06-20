module Notifications
  class MentionOnComment < Notification
    
    belongs_to :user
    belongs_to :idea
    belongs_to :comment

    validates :user_id, presence: true
    validates :idea_id, presence: true
    validates :comment_id, presence: true
  end
end