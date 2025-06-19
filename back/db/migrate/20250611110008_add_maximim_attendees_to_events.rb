class AddMaximimAttendeesToEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :events, :maximum_attendees, :integer, default: nil, null: true
    add_index :events, :maximum_attendees
  end
end
