# frozen_string_literal: true

module AdminApi
  class CopyProjectJob < ApplicationJob
    perform_retries(false)

    # We use YAML to pass the template data to the job to be able to preserve the internal
    # references (that are encoded with anchors and aliases in the YAML) that are used to
    # represent associations between the different models. If we were to use a hash,
    # those links would be lost during the serialization-deserialization of job arguments.
    def run(template_yaml, moderator_id, folder_id = nil)
      check_in_tenant!
      folder = ProjectFolders::Folder.find(folder_id) if folder_id
      moderator = User.find(moderator_id)
      template = ::MultiTenancy::Templates::Utils.parse_yml(template_yaml)
      project = ProjectCopyService.new.import(template, folder: folder)
      SideFxProjectService.new.after_create(project, moderator)

      # Wait before destroying the job record to allow clients to poll the job status via
      # the API.
      destroy_in(15.minutes)
    end

    private

    def check_in_tenant!
      Tenant.current
    rescue ActiveRecord::RecordNotFound
      raise "#{self.class.name} must be run in the context of a tenant."
    end
  end
end
