# frozen_string_literal: true

module Insights
  module Views
    class CreateService
      include Pundit

      attr_reader :current_user

      def initialize(current_user, params)
        @current_user = current_user

        @params = params.dup.to_h.tap do |p|
          data_sources = p.delete(:data_sources)
          raise ArgumentError, 'At least one data source must be provided' if data_sources.blank?

          # Since Project is the only supported origin_type for now, we use it as the
          # default and make the origin_type attribute optional.
          p[:data_sources_attributes] = data_sources.map { |ds| { 'origin_type' => 'Project', **ds } }
        end
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
        Insights::CategoryImporter.new.import(view, @current_user.locale)

        view_inputs = InputsFinder.new(view).execute
        Insights::ProcessedFlagsService.new.set_processed(view_inputs, [view.id])

        LogActivityJob.perform_later(view, 'created', @current_user, view.created_at.to_i)
      end
    end
  end
end
