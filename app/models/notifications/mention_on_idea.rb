module Notifications
  class MentionOnIdea < ::Notification
    
    belongs_to :user
    belongs_to :idea

    validates :user_id, presence: true
    validates :idea_id, presence: true
  end
end