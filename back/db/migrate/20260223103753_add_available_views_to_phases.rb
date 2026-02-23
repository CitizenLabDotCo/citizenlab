class AddAvailableViewsToPhases < ActiveRecord::Migration[7.2]
  def up
    add_column :phases, :available_views, :string, array: true, default: ['card'], null: false

    # Backfill: before this feature, all views were implicitly enabled.
    Phase.reset_column_information
    Phase.find_each do |phase|
      views = if phase.presentation_mode == 'feed'
        %w[card map feed]
      else
        %w[card map]
      end
      phase.update_column(:available_views, views)
    end
  end

  def down
    remove_column :phases, :available_views
  end
end
