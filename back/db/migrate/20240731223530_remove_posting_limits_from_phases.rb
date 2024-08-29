# frozen_string_literal: true

class RemovePostingLimitsFromPhases < ActiveRecord::Migration[7.0]
  class Phase < ApplicationRecord
    self.table_name = 'phases'
  end

  def change
    reversible do |dir|
      dir.up do
        remove_column :phases, :posting_method, :string, null: false, default: 'unlimited'
        remove_column :phases, :posting_limited_max, :integer, default: 1
      end

      dir.down do
        add_column :phases, :posting_method, :string, null: false, default: 'unlimited'
        add_column :phases, :posting_limited_max, :integer, default: 1
        Phase.where(participation_method: 'native_surveys').update_all(posting_method: 'limited')
      end
    end
  end
end
