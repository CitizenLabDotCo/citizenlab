class AddDefaultToMultilocs < ActiveRecord::Migration[5.2]
  def change
    change_column_default :groups, :title_multiloc, {}
    change_column_default :idea_statuses, :title_multiloc, {}
    change_column_default :initiative_statuses, :title_multiloc, {}
    change_column_default :initiative_statuses, :description_multiloc, {}
    change_column_default :initiatives, :title_multiloc, {}
    change_column_default :initiatives, :body_multiloc, {}
  end
end
