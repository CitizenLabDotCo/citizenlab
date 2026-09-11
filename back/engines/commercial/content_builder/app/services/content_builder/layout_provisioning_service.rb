# frozen_string_literal: true

module ContentBuilder
  # Gives every project and folder the Content Builder layout it renders from, used
  # by the SideFx creation/copy hook and the after-template hook.
  #
  # A folder gets a `project_folder_description` layout, authored in the description
  # builder. A project gets a `project_page` layout, authored in the project page
  # builder.
  class LayoutProvisioningService
    FOLDER_LAYOUT_CODE = 'project_folder_description'

    def provision_for(buildable)
      ensure_on_content_builder!(buildable)
    end

    # Ensures every project and folder in the current tenant has its layout. A failure
    # on one buildable is reported and skipped rather than aborting tenant creation.
    def provision_all!
      Project.find_each { |project| safely_ensure_on_content_builder(project) }
      ProjectFolders::Folder.find_each { |folder| safely_ensure_on_content_builder(folder) }
    end

    # Gives a custom page its layout. A failure on one page is reported and skipped
    # rather than aborting tenant creation.
    def provision_all_custom_pages!
      StaticPage.find_each { |static_page| safely_ensure_custom_page(static_page) }
    end

    def ensure_on_content_builder!(buildable)
      return ensure_project_page!(buildable) if buildable.is_a?(Project)

      ensure_folder_description!(buildable)
    end

    # The standard folder layout: title, description, published-projects widget. The
    # description is optional so importers can seed one they carried in themselves.
    def default_folder_craftjs_json(folder, description_multiloc = {})
      craftjs = ContentBuilder::Craftjs::DefaultLayoutService.new
        .default_layout(folder)
        .deep_stringify_keys
      craftjs['TEXT']['props']['text'] = description_multiloc if description_multiloc.present?
      craftjs
    end

    def ensure_custom_page!(static_page)
      return unless static_page.custom? && !static_page.project_scoped?
      return if ContentBuilder::Layout.exists?(content_buildable: static_page, code: CustomPageLayoutService::CODE)

      create_layout!(static_page, CustomPageLayoutService::CODE, CustomPageLayoutService.new.craftjs_json_for(static_page))
    end

    private

    def ensure_folder_description!(folder)
      raise ArgumentError, "Unsupported buildable: #{folder.class.name}" unless folder.is_a?(ProjectFolders::Folder)

      existing = ContentBuilder::Layout.find_by(content_buildable: folder, code: FOLDER_LAYOUT_CODE)

      if existing
        existing.update!(enabled: true, craftjs_json: default_folder_craftjs_json(folder)) unless existing.enabled
      else
        create_layout!(folder, FOLDER_LAYOUT_CODE, default_folder_craftjs_json(folder))
      end
    end

    def ensure_project_page!(project)
      return if ContentBuilder::Layout.exists?(content_buildable: project, code: ProjectPageLayoutService::CODE)

      create_layout!(project, ProjectPageLayoutService::CODE, ProjectPageLayoutService.new.craftjs_json_for(project))
    end

    # NB: create via Layout (not buildable.content_builder_layouts) so the
    # polymorphic content_buildable_type is set — the has_many lacks `as:`, and a
    # NULL type is invisible to the controller's find_by!.
    def create_layout!(buildable, code, craftjs_json)
      ContentBuilder::Layout.create!(
        content_buildable: buildable,
        code: code,
        enabled: true,
        craftjs_json: craftjs_json
      )
    end

    def safely_ensure_custom_page(static_page)
      ensure_custom_page!(static_page)
    rescue StandardError => e
      ErrorReporter.report(e, extra: { static_page_id: static_page.id })
    end

    def safely_ensure_on_content_builder(buildable)
      ensure_on_content_builder!(buildable)
    rescue StandardError => e
      ErrorReporter.report(e, extra: { buildable_type: buildable.class.name, buildable_id: buildable.id })
    end
  end
end
