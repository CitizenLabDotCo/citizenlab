# frozen_string_literal: true

class AddFirstPublishedAtToAdminPublications < ActiveRecord::Migration[7.0]
  def change
    add_column :admin_publications, :first_published_at, :datetime

    ActiveRecord::Base.connection.execute(<<~SQL.squish)
      UPDATE admin_publications
      SET first_published_at = first_pub_activities.acted_at
      FROM (
        SELECT item_id, MIN(acted_at) AS acted_at
        FROM activities
        WHERE item_type = 'Project' AND action = 'published'
        GROUP BY item_id
      ) AS first_pub_activities
      WHERE admin_publications.publication_id = first_pub_activities.item_id
    SQL

    ActiveRecord::Base.connection.execute(<<~SQL.squish)
      UPDATE admin_publications
      SET first_published_at = admin_publications.created_at
      WHERE admin_publications.publication_status = 'published'
      AND admin_publications.first_published_at IS NULL
    SQL
  end
end
