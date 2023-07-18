# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Followers < Base
      def run
        Project.not_draft.each do |project|
          User.order(Arel.sql('RANDOM()')).limit(rand(0..8)).each do |user|
            project.followers.create(user: user)
          end
        end
      end
    end
  end
end
