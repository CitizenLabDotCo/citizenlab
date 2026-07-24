# frozen_string_literal: true

module DecidimImporter
  # Post-import step (runs in the target tenant, after the template has been applied): gathers every
  # top-level project — i.e. one not already in a folder/group — into a new "Consultations" folder,
  # gives every folder (Consultations, Assemblies and the imported group folders) the standard folder
  # description layout plus a homepage preview description, adds a widget to the Consultations folder
  # linking out to the other folders (except Assemblies), and rebuilds the navigation bar down to Home
  # plus the Consultations and Assemblies folders.
  #
  # It runs after the import rather than in the template because folder layouts and the nav bar
  # reference ids that only exist once the template is applied. Idempotent: re-running reuses the
  # existing folder, moves any remaining top-level projects, and leaves already-built layouts,
  # previews and nav items in place.
  class ConsultationsFolder
    FOLDER_TITLE = 'Consultations'
    FOLDER_SLUG = 'consultations'
    # The Assemblies folder is created during the import (its title comes from
    # {ExportReader::ASSEMBLIES_FOLDER_TITLE}), so we locate it by the slug that title slugifies to.
    ASSEMBLIES_FOLDER_SLUG = 'assemblies'
    FOLDER_LAYOUT_CODE = 'project_folder_description'
    # Stable craftjs node id for the Consultations folder's "other folders" Selection widget, so
    # re-running replaces it in place rather than appending a duplicate.
    OTHER_FOLDERS_NODE_ID = 'other-folders-selection'
    # Homepage card previews are short; keep them to a sentence-ish length, broken on a word boundary.
    PREVIEW_LENGTH = 280

    def run
      folder = find_or_create_folder
      moved = move_top_level_projects_into(folder)
      provision_folders
      link_other_folders_from(folder)
      configure_nav_bar(folder)
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

    # Gives every folder the platform's standard description layout — folder title, description text
    # and a `Published`-projects widget listing the folder's projects — and a homepage card preview.
    def provision_folders
      ProjectFolders::Folder.find_each do |folder|
        ContentBuilder::DescriptionLayoutService.new.provision_for(folder)
        ensure_homepage_description(folder)
      end
    end

    # Sets the folder's homepage card description (`description_preview_multiloc`) when it has none:
    # a plain-text lead from the folder description, falling back to its title.
    def ensure_homepage_description(folder)
      return if multiloc_present?(folder.description_preview_multiloc)

      folder.update!(description_preview_multiloc: homepage_description_for(folder))
    end

    def homepage_description_for(folder)
      preview = preview_from_description(folder.description_multiloc)
      multiloc_present?(preview) ? preview : folder.title_multiloc
    end

    def preview_from_description(description_multiloc)
      (description_multiloc || {}).each_with_object({}) do |(locale, html), preview|
        text = ActionView::Base.full_sanitizer.sanitize(html.to_s).squish
        preview[locale] = text.truncate(PREVIEW_LENGTH, separator: ' ') if text.present?
      end
    end

    def multiloc_present?(multiloc)
      multiloc.is_a?(Hash) && multiloc.values.any?(&:present?)
    end

    # The Consultations folder is the catch-all landing folder, so on top of its own projects (the
    # `Published` widget) it links out to every other folder — except Assemblies, which reaches users
    # through its own nav bar item. We add a `Selection` widget listing those folders to its standard
    # layout, replacing any earlier one so re-running stays idempotent.
    def link_other_folders_from(consultations_folder)
      layout = ContentBuilder::Layout.find_by(content_buildable: consultations_folder, code: FOLDER_LAYOUT_CODE)
      return unless layout

      ids = other_folder_admin_publication_ids(consultations_folder)
      craftjs = layout.craftjs_json.deep_dup
      if ids.any?
        craftjs['ROOT']['nodes'] |= [OTHER_FOLDERS_NODE_ID]
        craftjs[OTHER_FOLDERS_NODE_ID] = selection_node(ids)
      else
        craftjs['ROOT']['nodes'].delete(OTHER_FOLDERS_NODE_ID)
        craftjs.delete(OTHER_FOLDERS_NODE_ID)
      end
      layout.update!(craftjs_json: craftjs)
    end

    # The admin publication ids of every folder except the Consultations folder itself and Assemblies.
    def other_folder_admin_publication_ids(consultations_folder)
      excluded = [consultations_folder.id, assemblies_folder&.id].compact
      AdminPublication
        .where(publication_type: 'ProjectFolders::Folder').where.not(publication_id: excluded)
        .order(:ordering).pluck(:id).map(&:to_s)
    end

    # An empty `titleMultiloc` lets the widget fall back to its built-in "Selected projects and
    # folders" heading, so no untranslated copy is introduced here.
    def selection_node(admin_publication_ids)
      {
        'type' => { 'resolvedName' => 'Selection' }, 'nodes' => [],
        'props' => { 'titleMultiloc' => {}, 'adminPublicationIds' => admin_publication_ids },
        'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
        'displayName' => 'Selection', 'linkedNodes' => {}
      }
    end

    # Rebuilds the nav bar to just Home, the Consultations folder and (when it exists) the Assemblies
    # folder — every other default item (Projects, Events, All input, …) is removed so the imported
    # tenant navigates purely through the two folders.
    def configure_nav_bar(consultations_folder)
      kept = [consultations_folder, assemblies_folder].compact.map { |folder| folder_nav_item(folder) }
      NavBarItem.top_level.where.not(code: 'home').where.not(id: kept.map(&:id)).destroy_all
    end

    def folder_nav_item(folder)
      folder.nav_bar_item || NavBarItem.create!(code: 'custom', project_folder: folder)
    end

    def assemblies_folder
      @assemblies_folder ||= ProjectFolders::Folder.find_by(slug: ASSEMBLIES_FOLDER_SLUG)
    end
  end
end
