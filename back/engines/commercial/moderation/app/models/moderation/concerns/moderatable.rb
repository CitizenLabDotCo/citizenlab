require 'active_support/concern'

module Moderation
  module Concerns
    module Moderatable
      extend ActiveSupport::Concern

      included do
        has_one :moderation_status, dependent: :destroy, foreign_key: :moderatable_id, foreign_type: :moderatable_type, as: :moderatable, class_name: 'Moderation::ModerationStatus'
      end
    end
  end
end