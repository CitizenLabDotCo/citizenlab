# frozen_string_literal: true

class ChangeBudgetingPermission < ActiveRecord::Migration[6.1]
  def change
    execute "UPDATE permissions SET action = 'voting' WHERE action = 'budgeting'"
  end
end
