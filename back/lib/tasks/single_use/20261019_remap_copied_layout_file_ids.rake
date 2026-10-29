# frozen_string_literal: true

# Points project page file widgets at the project's own files (TAN-8825).
#
# Copying a project copies its files, but the copied page kept the source files' IDs in its
# FileAttachment widgets. The page then shows the source project's file, and breaks when that
# file is deleted. New copies are remapped by ProjectCopyService; this task fixes the pages
# copied before that.
#
# A referenced file that belongs to another project is matched to the page's project file with
# the same name and size. A file with no match, more than one, or no known size is reported and
# left alone. References to files that no longer exist, or that belong to no project, are left
# alone too.
#
#   rake single_use:remap_copied_layout_file_ids                     # dry run, all tenants
#   rake 'single_use:remap_copied_layout_file_ids[execute]'          # remap, all tenants
#   rake 'single_use:remap_copied_layout_file_ids[execute,foo.com]'  # remap, one tenant
namespace :single_use do
  desc "Point copied project pages' file widgets at the project's own files. Dry run unless passed 'execute'."
  task :remap_copied_layout_file_ids, %i[execute host] => [:environment] do |_t, args|
    TenantScript.run(
      'remap_copied_layout_file_ids',
      args: args,
      description: "remapping copied project pages' file widgets"
    ) do |tenant, script|
      ContentBuilder::Layout
        .where(content_buildable_type: 'Project')
        .with_widget_type('FileAttachment')
        .includes(:content_buildable)
        .find_each do |layout|
          project = layout.content_buildable
          next unless project

          project_files = project.files.to_a
          foreign_files = Files::File
            .where(id: layout.referenced_file_ids - project_files.map(&:id))
            .where(id: Files::FilesProject.where.not(project_id: project.id).select(:file_id))
          context = { tenant: tenant.host, project_id: project.id, layout_id: layout.id }

          file_id_mapping = foreign_files.each_with_object({}) do |file, mapping|
            file_context = context.merge(file_id: file.id, file_name: file.name)
            if file.size.nil?
              script.reporter.add_error('unknown file size: not remapped', context: file_context)
              next
            end

            matches = project_files.select { |f| f.name == file.name && f.size == file.size }
            if matches.size == 1
              mapping[file.id] = matches.first.id
              script.reporter.add_change(file.id, matches.first.id, context: file_context)
            else
              script.reporter.add_error("#{matches.size} matching files in the project: not remapped", context: file_context)
            end
          end

          layout.remap_file_ids!(file_id_mapping) if script.execute? && file_id_mapping.any?
        end
    end
  end
end
