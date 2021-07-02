# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class ClassificationTasksController
        def create
          Insights::CreateClassificationTasksJob.perform_later(
            inputs: inputs,
            categories: categories,
            view: view
          )

          head :accepted
        end

        # @return [Insights::View]
        def view
          @view ||= authorize(
            View.includes(:scope).find(params.require(:view_id)),
            :destroy?
          )
        end

        # @return [Array<Idea>, nil]
        def inputs
          @inputs ||= view.scope.ideas.find(params[:inputs]) if params.key?(:inputs)
        end

        # @return [Array<Insights::Category>, nil]
        def categories
          @categories ||= view.categories.find(params[:categories]) if params.key?(:categories)
        end
      end
    end
  end
end
