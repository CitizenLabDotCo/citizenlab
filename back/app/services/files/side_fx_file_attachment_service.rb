# frozen_string_literal: true

module Files
  class SideFxFileAttachmentService < BaseSideFxService
    def before_create(file_attachment, current_user)
      # We permit creation of files_files records before creation of an associated project (i.e. in project create/edit form).
      # So we create the association here if needed, by creating a files_projects record if it doesn't already exist.
      return if file_attachment.attachable_type != 'Project' || file_attachment.attachable_id.nil

      files_project = Files::FilesProject.find_by(file: file_attachment.file, project_id: file_attachment.attachable_id)

      unless files_project
        Files::FilesProject.create!(file: file_attachment.file, project_id: file_attachment.attachable_id)
      end
    end

    private

    def resource_name
      :'files/file_attachment'
    end
  end
end
