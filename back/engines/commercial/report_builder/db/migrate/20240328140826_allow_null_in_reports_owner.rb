class AllowNullInReportsOwner < ActiveRecord::Migration[7.0]
  def change
    change_column_null :report_builder_reports, :owner_id, true
  end
end
