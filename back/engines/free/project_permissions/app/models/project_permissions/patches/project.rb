# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module Project
      VISIBLE_TOS = %w[public groups admins].freeze

      def self.included(base)
        base.class_eval do
          validates :visible_to, presence: true, inclusion: { in: VISIBLE_TOS }
        end
      end
    end
  end
end
