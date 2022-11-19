# frozen_string_literal: true

module RakeHelper
  def load_rake_tasks_if_not_loaded
    Rails.application.load_tasks if Rake::Task.tasks.empty?
  end
end
