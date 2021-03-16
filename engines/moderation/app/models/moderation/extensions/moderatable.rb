module Moderation
  module Extensions
    module Moderatable
      def self.included(base)
        base.has_one :moderation_status, dependent: :destroy, foreign_key: :moderatable_id, foreign_type: :moderatable_type, class_name: 'Moderation::ModerationStatus'
      end
    end
  end
end