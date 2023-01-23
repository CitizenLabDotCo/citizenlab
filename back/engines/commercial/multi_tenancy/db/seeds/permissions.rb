# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Permissions < Base
      def run
        Permission.all.shuffle.take(rand(1..10)).each do |permission|
          permitted_by = if permission.action == 'taking_survey'
            %w[everyone users groups admins_moderators]
          else
            %w[users groups admins_moderators]
          end.sample
          permission.permitted_by = permitted_by
          if permitted_by == 'groups'
            permission.groups = Group.all.shuffle.take(rand(5))
          end
          permission.save!
        end
      end
    end
  end
end
