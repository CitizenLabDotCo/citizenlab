# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module Project
      VISIBLE_TOS = %w[public groups admins].freeze

      def self.included(base)
        base.class_eval do
          validates :visible_to, presence: true, inclusion: { in: VISIBLE_TOS }
          before_validation :set_visible_to, on: :create
        end
      end

      def set_visible_to
        self.visible_to ||= 'public'
      end
    end
  end
end
