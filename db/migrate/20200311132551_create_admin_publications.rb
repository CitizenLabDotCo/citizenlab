class CreateAdminPublications < ActiveRecord::Migration[6.0]
  def change
    create_table :admin_publications, id: :uuid do |t|
      t.uuid :parent_id, null: true, index: true
      t.integer :lft, null: false, index: true
      t.integer :rgt, null: false, index: true
      t.integer :children_count, null: false, default: 0

      t.uuid :publication_id
      t.string  :publication_type
      t.integer :ordering

      t.timestamps
    end

    # ProjectHolderOrdering.order(:ordering).each.with_index do |pho, index|
    #   # [:publication_type, :publication_id, ordering: index]
    #   AdminPublication.create!()
    # end

    # Project.where('folder_id IS NOT NULL').each do prrt
    #   ordering????
    # end

    drop_table :project_holder_orderings
    remove_column :projects, :folder_id, :uuid
    remove_column :projects, :ordering, :integer
    remove_column :project_folders, :projects_count, :integer
  end
end
