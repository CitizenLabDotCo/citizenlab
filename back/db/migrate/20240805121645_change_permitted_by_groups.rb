# frozen_string_literal: true

class ChangePermittedByGroups < ActiveRecord::Migration[7.0]
  def change
    Permission.where(permitted_by: 'groups').update_all(permitted_by: 'users')
  end
end
