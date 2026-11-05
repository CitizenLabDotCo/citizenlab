# frozen_string_literal: true

# Drops the legacy WYSIWYG descriptions of projects and folders.
#
# Both are authored on the Content Builder now — a project in its `project_page`
# layout, a folder in its `project_folder_description` layout — and every tenant
# has been migrated, so nothing reads these columns any more.
#
# `safety_assured` is sound here only because the release before this one put
# `description_multiloc` in both models' `ignored_columns`. Migrations run before the
# new containers take over traffic, so without that step the still-running processes
# would keep naming the column in every INSERT (`partial_inserts` is off under
# `load_defaults 7.2`) and 500 until they restarted. With it, no running process
# selects or inserts the column and the drop is invisible.
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
