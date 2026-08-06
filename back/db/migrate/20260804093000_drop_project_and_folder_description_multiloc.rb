# frozen_string_literal: true

# Drops the legacy WYSIWYG descriptions of projects and folders.
#
# Both are authored on the Content Builder now — a project in its `project_page`
# layout, a folder in its `project_folder_description` layout — and every tenant
# has been migrated, so nothing reads these columns any more.
#
# The `TextImage` records extracted from those columns are kept: the migrated
# RichTextMultiloc bridge widgets still reference them by `text_reference`
# (extraction is skipped for images that already carry a reference), so deleting
# them would break inline images on live pages.
class DropProjectAndFolderDescriptionMultiloc < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      remove_column :projects, :description_multiloc
      remove_column :project_folders_folders, :description_multiloc
    end
  end

  def down
    add_column :projects, :description_multiloc, :jsonb, default: {}
    add_column :project_folders_folders, :description_multiloc, :jsonb
  end
end
