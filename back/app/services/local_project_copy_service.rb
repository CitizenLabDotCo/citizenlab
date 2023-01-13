# frozen_string_literal: true

# Copies a project within a tenant.
class LocalProjectCopyService
  def copy(source_project)
    new_title_multiloc = add_suffix_to_title(source_project.title_multiloc)

    options = {
      local_copy: true,
      include_ideas: false,
      anonymize_users: false,
      new_title_multiloc: new_title_multiloc,
      timeline_start_at: Time.now.to_s,
      new_publication_status: 'draft'
    }

    template = AdminApi::ProjectCopyService.new.export source_project, **options
    folder_id = ProjectFolders::Folder.find(source_project.folder_id) if source_project.folder_id
    import_details = AdminApi::ProjectCopyService.new.import(template, folder: folder_id)

    Project.find(import_details.first.id)
  end

  private

  def add_suffix_to_title(multiloc)
    title_suffix_multiloc = MultilocService.new.i18n_to_multiloc('project_copy.title_suffix')
    multiloc.each { |k, v| multiloc[k] = "#{v} - #{title_suffix_multiloc[k]}" }
  end
end
