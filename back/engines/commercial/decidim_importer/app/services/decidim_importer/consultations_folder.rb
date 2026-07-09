# frozen_string_literal: true

module DecidimImporter
  # Post-import step (runs in the target tenant, after the template has been applied): gathers every
  # top-level project — i.e. one not already in a folder/group — into a new "Consultations" folder,
  # gives that folder a Content Builder layout whose `Selection` widget lists those projects plus the
  # (group) folders, and adds the folder to the navigation bar.
  #
  # It runs after the import rather than in the template because the `Selection` widget references
  # `AdminPublication` ids, which are generated during deserialization and can't be preset in the
  # template (Rails drops `id` from nested `admin_publication_attributes`). Idempotent: re-running
  # reuses the existing folder, moves any remaining top-level projects, and rebuilds the layout/nav item.
  class ConsultationsFolder
    FOLDER_TITLE = 'Consultations'
    FOLDER_SLUG = 'consultations'
    LAYOUT_CODE = 'project_folder_description'
    FRAME_ID = 'e2e-content-builder-frame'

    def run
      folder = find_or_create_folder
      moved = move_top_level_projects_into(folder)
      build_layout(folder)
      add_to_nav_bar(folder)
      { folder: folder, moved_projects: moved }
    end

    private

    def find_or_create_folder
      ProjectFolders::Folder.find_by(slug: FOLDER_SLUG) ||
        ProjectFolders::Folder.create!(
          title_multiloc: title_multiloc,
          admin_publication_attributes: { publication_status: 'published' }
        )
    end

    def title_multiloc
      AppConfiguration.instance.settings('core', 'locales').index_with { FOLDER_TITLE }
    end

    # Every project not already inside a folder (its admin publication has no parent) moves under the
    # folder. Captured before moving, since reparenting sets their `parent_id`. Returns the moved projects.
    def move_top_level_projects_into(folder)
      projects = Project.joins(:admin_publication).where(admin_publications: { parent_id: nil }).to_a
      projects.each { |project| project.update!(folder_id: folder.id) }
      projects
    end

    # The folder's `project_folder_description` layout with a single `Selection` widget listing the
    # admin publications of the folder's projects, then of the (group) folders. Reused if it exists.
    def build_layout(folder)
      layout = ContentBuilder::Layout.find_or_initialize_by(content_buildable: folder, code: LAYOUT_CODE)
      layout.update!(enabled: true, craftjs_json: craftjs(folder))
    end

    def craftjs(folder)
      {
        'ROOT' => {
          'type' => 'div', 'nodes' => ['selection'], 'props' => { 'id' => FRAME_ID }, 'custom' => {},
          'hidden' => false, 'isCanvas' => true, 'displayName' => 'div', 'linkedNodes' => {}
        },
        'selection' => {
          'type' => { 'resolvedName' => 'Selection' }, 'nodes' => [],
          'props' => { 'titleMultiloc' => folder.title_multiloc, 'adminPublicationIds' => admin_publication_ids(folder) },
          'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
          'displayName' => 'Selection', 'linkedNodes' => {}
        }
      }
    end

    # The folder's projects' admin publication ids, followed by every other (group) folder's.
    def admin_publication_ids(folder)
      project_ids = folder.admin_publication.children
        .where(publication_type: 'Project').order(:ordering).pluck(:id)
      folder_ids = AdminPublication
        .where(publication_type: 'ProjectFolders::Folder').where.not(publication_id: folder.id)
        .order(:ordering).pluck(:id)
      (project_ids + folder_ids).map(&:to_s)
    end

    def add_to_nav_bar(folder)
      folder.nav_bar_item || NavBarItem.create!(code: 'custom', project_folder: folder)
    end
  end
end
