# frozen_string_literal: true

module AdminApi
  class DemoTasksController < AdminApiController
    skip_around_action :switch_tenant

    ALLOWED_TASKS = %w[
      demos:update_dashboard_data
      demos:redistribute_idea_statuses
      demos:seed_community_monitor
      demos:seed_native_survey_responses
      demos:translate_missing_locales
      demos:update_ideas_titles_and_bodies
      demos:update_comments_bodies
      demos:update_authors_of_comments_or_ideas
      demos:create_ideas_topics
    ].freeze

    def create
      task_name = params[:task_name]
      task_args = params[:task_args] || []

      unless ALLOWED_TASKS.include?(task_name)
        render json: { error: "Task '#{task_name}' is not allowed" }, status: :unprocessable_entity
        return
      end

      Rails.application.load_tasks unless Rake::Task.task_defined?(task_name)

      task = Rake::Task[task_name]
      task.reenable
      task.invoke(*task_args)

      render json: { status: 'ok', task: task_name }, status: :ok
    rescue RuntimeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
