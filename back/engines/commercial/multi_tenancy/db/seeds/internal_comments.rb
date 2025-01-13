# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class InternalComments < Base
      def run
        idea = Idea.first
        admins = User.admin

        if idea && admins.first
          parent = InternalComment.create!(
            body: 'We should bring this input to the next executive meeting.',
            author: admins.first,
            idea: idea
          )
          if admins.second
            InternalComment.create!(body: '+1 to this!', author: admins.second, idea: idea, parent: parent)
          end
        end
      end
    end
  end
end
