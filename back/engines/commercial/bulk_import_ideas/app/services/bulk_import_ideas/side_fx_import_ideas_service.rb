# frozen_string_literal: true

module BulkImportIdeas
  class SideFxImportIdeasService
    def after_success(user)
      LogActivityJob.perform_later Tenant.current, 'bulk_import_ideas_succeeded', user, Time.now.to_i
    end

    def after_failure(user)
      LogActivityJob.perform_later Tenant.current, 'bulk_import_ideas_failed', user, Time.now.to_i
    end
  end
end
