# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Baskets < Base
      def run
        Phase.where(participation_method: 'voting').each do |phase|
          User.all.shuffle.take(rand(1..20)).each do |some_user|
            basket = Basket.create!({
              user: rand(5) == 0 ? nil : some_user, # Ensure baskets work fine without users
              participation_context: phase,
              submitted_at: phase.end_at - rand(1..3).days
            })
            chosen_ideas = phase.project.ideas.select(&:budget).shuffle.take(rand(10))
            chosen_ideas.each do |idea|
              BasketsIdea.create!({
                basket: basket,
                idea: idea,
                votes: idea.budget.nil? ? rand(1..10) : idea.budget
              })
            end
            basket.update_counts!
          end
        end
      end
    end
  end
end
