# frozen_string_literal: true

module BulkImportIdeas
  class SideFxImportIdeasService
    def after_success(user, project, ideas, users)
      options = { payload: { ideas_created: ideas.count, users_created: users.count }}
      activity_object = project || Tenant.current
      LogActivityJob.perform_later activity_object, 'bulk_import_ideas_succeeded', user, ideas&.last.created_at, options
    end

    def after_failure(user, project)
      activity_object = project || Tenant.current
      LogActivityJob.perform_later activity_object, 'bulk_import_ideas_succeeded', user, Time.now.to_i
    end
  end
end
