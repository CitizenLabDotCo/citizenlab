class AddPrescreeningModeToPhases < ActiveRecord::Migration[7.2]
  def change
    # `prescreening_mode` will be backfilled in a follow-up migration once the sync logic
    # between `prescreening_mode` and `prescreening_enabled` is deployed.
    add_column :phases, :prescreening_mode, :string
  end
end
