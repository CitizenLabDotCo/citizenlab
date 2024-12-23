class AddUniquenessConstraintToAreasProjects < ActiveRecord::Migration[7.0]
  def change
    ActiveRecord::Base.connection.execute(
      # After https://stackoverflow.com/a/12963112/3585671
      <<-SQL.squish
      DELETE FROM areas_projects to_delete USING (
        SELECT MIN(id::text) AS id, project_id, area_id
          FROM areas_projects 
          GROUP BY (project_id, area_id) HAVING COUNT(*) > 1
        ) keep_from_duplicates
        WHERE to_delete.project_id = keep_from_duplicates.project_id
        AND to_delete.area_id = keep_from_duplicates.area_id
        AND to_delete.id::text <> keep_from_duplicates.id
      SQL
    )
    add_index :areas_projects, %i[project_id area_id], unique: true
  end
end
