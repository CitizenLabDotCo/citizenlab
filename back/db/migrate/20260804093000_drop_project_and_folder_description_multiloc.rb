# frozen_string_literal: true

# Drops the legacy WYSIWYG descriptions of projects and folders.
#
# Both are authored on the Content Builder now — a project in its `project_page`
# layout, a folder in its `project_folder_description` layout — and every tenant
# has been migrated, so nothing reads these columns any more.
#
# The `TextImage` records extracted from those columns go with them: they are only
# reachable through the dropped fields (images inside migrated Content Builder
# content were re-extracted against the layout, under `craftjs_json`).
class DropProjectAndFolderDescriptionMultiloc < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      execute(<<~SQL.squish)
        DELETE FROM text_images
        WHERE imageable_field = 'description_multiloc'
          AND imageable_type IN ('Project', 'ProjectFolders::Folder');
      SQL

      remove_column :projects, :description_multiloc
      remove_column :project_folders_folders, :description_multiloc
    end
  end

  def down
    add_column :projects, :description_multiloc, :jsonb, default: {}
    add_column :project_folders_folders, :description_multiloc, :jsonb, default: {}
  end
end
