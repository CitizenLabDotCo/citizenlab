class AddCheckConstraintPhasesStartBeforeEnd < ActiveRecord::Migration[7.1]
  def change
    check = 'start_at IS NULL OR end_at IS NULL OR start_at <= end_at'
    add_check_constraint :phases, check, name: 'phases_start_before_end', validate: false
  end
end
