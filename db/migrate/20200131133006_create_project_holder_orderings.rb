class CreateProjectHolderOrderings < ActiveRecord::Migration[6.0]
  def change
    create_table :project_holder_orderings, id: :uuid do |t|
      t.integer :ordering
      t.uuid :project_holder_id
      t.string  :project_holder_type

      t.timestamps
    end
  end
end
