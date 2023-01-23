# frozen_string_literal: true

class CreateFactRegistrationsView < ActiveRecord::Migration[6.1]
  def change
    add_index(:users, :registration_completed_at)
    create_view :analytics_fact_registrations
  end
end
