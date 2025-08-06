# frozen_string_literal: true

module AdminApi
  class CopyProjectJob < ApplicationJob
    perform_retries(false)

    # We use YAML to pass the template data to the job to be able to preserve the internal
    # references (that are encoded with anchors and aliases in the YAML) that are used to
    # represent associations between the different models. If we were to use a hash,
    # those links would be lost during the serialization-deserialization of job arguments.
    # @param [String] template_yaml
    # @param [String, NilClass] folder_id
    def run(template_yaml, folder_id = nil, local_creator = nil)
      check_in_tenant!
      folder = ProjectFolders::Folder.find(folder_id) if folder_id
      template = ::MultiTenancy::Templates::Utils.parse_yml(template_yaml)
      ProjectCopyService.new.import(template, folder: folder, local_creator: local_creator)

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
