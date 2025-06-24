# frozen_string_literal: true

module Analysis
  class SideFxBackgroundTaskService
    include SideFxHelper
    def after_create(task, user)
      LogActivityJob.perform_later(task, 'created', user, Time.now.to_i)
    end
  end
end
