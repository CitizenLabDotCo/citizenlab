# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Baskets < Base
      def run
        Phase.where(participation_method: 'budgeting').each do |phase|
          User.all.shuffle.take(rand(1..20)).each do |some_user|
            chosen_ideas = phase.project.ideas.select(&:budget).shuffle.take(rand(10))
            Basket.create!({
              user: some_user,
              participation_context: phase,
              ideas: chosen_ideas
            })
          end
        end
      end
    end
  end
end
