class DropInitiativesTables < ActiveRecord::Migration[7.1]
  def change
    %i[
      areas_initiatives
      initiatives_topics
      cosponsors_initiatives
      initiative_files
      initiative_images
      initiative_status_changes
      initiative_statuses
      initiatives
    ].each do |table_name|
      drop_table table_name
    end
  end
end
