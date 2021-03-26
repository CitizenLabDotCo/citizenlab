class ChangeEventsLocationMultilocToJsonb < ActiveRecord::Migration[6.0]
  def change
    change_column :events, :location_multiloc, :jsonb
  end
end
