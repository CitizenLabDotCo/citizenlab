# frozen_string_literal: true

module Insights
  module Views
    class CreateService
      include Pundit

      attr_reader :current_user

      def initialize(current_user, params)
        @current_user = current_user
        @params = params.dup
      end

      def execute
        view = Insights::View.new(@params)
        authorize(view, :create?)

        after_create(view) if view.save
        view
      end

      private

      def after_create(view)
        Insights::CreateTnaTasksJob.perform_later(view)
        Insights::DetectCategoriesJob.perform_later(view) # [TODO] feature-flag to only detect for premium
        Insights::TopicImportService.new.copy_assignments(view, @current_user)
        Insights::ProcessedFlagsService.new.set_processed(view.scope.ideas, [view.id])
        LogActivityJob.perform_later(view, 'created', @current_user, view.created_at.to_i)
      end
    end
  end
end
