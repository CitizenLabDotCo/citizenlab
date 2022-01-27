class AddAttendancesCountToEvents < ActiveRecord::Migration[6.1]
  def change
    add_column :events, :attendances_count, :integer, null: false, default: 0
  end
end
