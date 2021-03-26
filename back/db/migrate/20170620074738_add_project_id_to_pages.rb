class AddProjectIdToPages < ActiveRecord::Migration[5.0]
  def change
    add_reference :pages, :project, foreign_key: true, type: :uuid
  end
end
