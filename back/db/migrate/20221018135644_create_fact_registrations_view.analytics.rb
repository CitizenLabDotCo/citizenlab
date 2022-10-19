# frozen_string_literal: true

# This migration comes from analytics (originally 20221017164207)

class CreateFactRegistrationsView < ActiveRecord::Migration[6.1]
  def change
    add_index(:users, :registration_completed_at)
    create_view :analytics_fact_registrations
  end
end
