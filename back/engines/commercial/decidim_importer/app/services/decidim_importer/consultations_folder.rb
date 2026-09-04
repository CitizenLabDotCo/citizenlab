# frozen_string_literal: true

module DecidimImporter
  # Post-import step (runs in the target tenant, after the template is applied): gathers every
  # top-level project (not already in a folder/group) into a new "Consultations" folder, gives every
  # folder the standard description layout plus a homepage preview, adds a widget to the Consultations
  # folder linking out to the other folders (except Assemblies), and rebuilds the nav bar down to Home
  # plus the Consultations and Assemblies folders.
  #
  # Runs post-import because folder layouts and nav bar reference ids that only exist once the template
  # is applied. Idempotent: re-running reuses the existing folder, moves any remaining top-level
  # projects, and leaves already-built layouts, previews and nav items in place.
  class ConsultationsFolder
    FOLDER_SLUG = 'consultations'
    # Assemblies folder is created during import (title from {ExportReader::ASSEMBLIES_FOLDER_TITLE});
    # located here by the slug that title slugifies to.
    ASSEMBLIES_FOLDER_SLUG = 'assemblies'
    FOLDER_LAYOUT_CODE = ContentBuilder::LayoutProvisioningService::FOLDER_LAYOUT_CODE
    # Stable craftjs node id for the "other folders" Selection widget, so re-running replaces it in
    # place rather than appending a duplicate.
    OTHER_FOLDERS_NODE_ID = 'other-folders-selection'
    # Homepage card previews are short; keep them to a sentence-ish length, broken on a word boundary.
    PREVIEW_LENGTH = 280

    def run
      folder = find_or_create_folder
      moved = move_top_level_projects_into(folder)
      provision_folders
      localize_assemblies_title
      link_other_folders_from(folder)
      configure_nav_bar(folder)
      { folder: folder, moved_projects: moved }
    end

    private

    def find_or_create_folder
      ProjectFolders::Folder.find_by(slug: FOLDER_SLUG) ||
        ProjectFolders::Folder.create!(
          title_multiloc: structural_title_multiloc('consultations'),
          # Pin the slug so it stays `consultations` regardless of how the title translates per locale
          # (find-or-create relies on it, and the model would otherwise slugify a translated title).
          slug: FOLDER_SLUG,
          admin_publication_attributes: { publication_status: 'published' }
        )
    end

    # The Assemblies folder is created at template time from the plain-string
    # {ExportReader::ASSEMBLIES_FOLDER_TITLE} (single locale only). Give it the same translated title as
    # Consultations now that the tenant's locales are known. Its slug (`assemblies`) is untouched.
    def localize_assemblies_title
      assemblies_folder&.update!(title_multiloc: structural_title_multiloc('assemblies'))
    end

    # A structural folder title (not drawn from the export) translated into every tenant locale from
    # `decidim_importer.<key>` — English source in en.yml, the rest filled by Polyglit. Each locale falls
    # back to the English source so none is left blank before translations land.
    def structural_title_multiloc(key)
      full_key = "decidim_importer.#{key}"
      english = I18n.t(full_key, locale: 'en')
      AppConfiguration.instance.settings('core', 'locales').index_with do |locale|
        I18n.t(full_key, locale: locale, default: english)
      end
    end

    # Every project not already in a folder (admin publication has no parent) moves under the folder.
    # Captured before moving, since reparenting sets `parent_id`. Returns the moved projects.
    def move_top_level_projects_into(folder)
      projects = Project.joins(:admin_publication).where(admin_publications: { parent_id: nil }).to_a
      projects.each { |project| project.update!(folder_id: folder.id) }
      projects
    end

    # Gives every folder the standard description layout (title, description, `Published`-projects
    # widget) plus a homepage card preview.
    def provision_folders
      ProjectFolders::Folder.find_each do |folder|
        ensure_standard_layout(folder)
        ensure_homepage_description(folder)
      end
    end

    # {Extractors::FoldersExtractor} stages an imported description as a description-only layout,
    # because the `FolderTitle`/`Published` widgets need a folder id that only exists now. Complete it
    # here, keeping the staged description. Idempotent: a layout that already has the widgets is left be.
    def ensure_standard_layout(folder)
      layout = folder_layout(folder)
      return ContentBuilder::LayoutProvisioningService.new.provision_for(folder) if layout.nil?
      return if node_names(layout).include?('FolderTitle')

      layout.update!(
        enabled: true,
        craftjs_json: ContentBuilder::LayoutProvisioningService.new
          .default_folder_craftjs_json(folder, staged_description(layout))
      )
    end

    def folder_layout(folder)
      ContentBuilder::Layout.find_by(content_buildable: folder, code: FOLDER_LAYOUT_CODE)
    end

    def node_names(layout)
      layout.craftjs_json.each_value.filter_map do |node|
        node['type']['resolvedName'] if node.is_a?(Hash) && node['type'].is_a?(Hash)
      end
    end

    def staged_description(layout)
      layout.craftjs_json.dig('TEXT', 'props', 'text') || {}
    end

    # Sets `description_preview_multiloc` when absent: a plain-text lead from the description, falling
    # back to the title.
    def ensure_homepage_description(folder)
      return if multiloc_present?(folder.description_preview_multiloc)

      folder.update!(description_preview_multiloc: homepage_description_for(folder))
    end

    # Runs after {#ensure_standard_layout}, so the description sits in the layout's `TEXT` node.
    def homepage_description_for(folder)
      layout = folder_layout(folder)
      preview = layout ? preview_from_description(staged_description(layout)) : {}
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

    # The catch-all landing folder links out to every other folder except Assemblies (which has its
    # own nav bar item), via a `Selection` widget added to its standard layout. Replaces any earlier
    # one so re-running stays idempotent.
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

    # Empty `titleMultiloc` lets the widget use its built-in "Selected projects and folders" heading,
    # avoiding untranslated copy here.
    def selection_node(admin_publication_ids)
      {
        'type' => { 'resolvedName' => 'Selection' }, 'nodes' => [],
        'props' => { 'titleMultiloc' => {}, 'adminPublicationIds' => admin_publication_ids },
        'custom' => {}, 'hidden' => false, 'parent' => 'ROOT', 'isCanvas' => false,
        'displayName' => 'Selection', 'linkedNodes' => {}
      }
    end

    # Rebuilds the nav bar to just Home, Consultations and (when it exists) Assemblies — every other
    # default item (Projects, Events, All input, …) is removed so the tenant navigates through the two
    # folders.
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
