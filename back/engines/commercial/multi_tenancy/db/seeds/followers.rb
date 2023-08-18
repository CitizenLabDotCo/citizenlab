# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Followers < Base
      def run
        Project.not_draft.each do |project|
          User.not_invited.order(Arel.sql('RANDOM()')).limit(rand(9)).each do |user|
            project.followers.create(user: user)
          end
        end
      end
    end
  end
end
