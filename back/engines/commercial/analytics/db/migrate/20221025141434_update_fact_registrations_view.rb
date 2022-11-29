# frozen_string_literal: true

class UpdateFactRegistrationsView < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_registrations, version: 2, revert_to_version: 1
  end
end
