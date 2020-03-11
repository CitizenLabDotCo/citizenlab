class CreateAdminPublications < ActiveRecord::Migration[6.0]
  def change
    # Create admin publications
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

    # Migrate existing data
    folder_to_publication_id = {}
    sql = %q(
      SELECT project_holder_id, project_holder_type, ordering 
      FROM project_holder_orderings
      ORDER BY ordering DESC;
    )
    ActiveRecord::Base.connection.execute(sql).each do |pho|
      publication = AdminPublication.create!(
        publication_id:   pho['project_holder_id'],
        publication_type: pho['project_holder_type'],
        ordering:         pho['ordering']
        )
      if pho['project_holder_type'] == 'ProjectFolder'
        folder_to_publication_id[pho['project_holder_id']] = publication.id
      end
    end

    sql = %q(
      SELECT id, project_holder_type, ordering, folder_id
      FROM projects
      WHERE folder_id IS NOT NULL
      ORDER BY ordering DESC;
    )
    ActiveRecord::Base.connection.execute(sql).each do |pho|
      AdminPublication.create!(
        publication_id:   pho['id'],
        publication_type: 'Project',
        ordering:         pho['ordering'],
        parent_id: folder_to_publication_id[pho['folder_id']]
        )
    end

    # Remove project holder modelling
    drop_table :project_holder_orderings
    remove_column :projects, :folder_id, :uuid
    remove_column :projects, :ordering, :integer
    remove_column :project_folders, :projects_count, :integer
  end
end
