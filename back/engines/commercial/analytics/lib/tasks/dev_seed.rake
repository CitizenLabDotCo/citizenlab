# frozen_string_literal: true

namespace :analytics do
  desc 'Seed some dummy data for dev'
  task seed_dev_data: :environment do
    Apartment::Tenant.switch('localhost') do
      puts "Seeding some visits data for localhost"

      # delete any we've already created
      Analytics::DimensionChannel.delete_all
      Analytics::DimensionLocale.delete_all
      Analytics::FactVisit.delete_all

      project = Analytics::DimensionProject.first
      user_id = User.first.id
      date = Analytics::DimensionDate.first

      # Create a channel & locale
      channel = Analytics::DimensionChannel.create!(name_multiloc: '{"en": "Website", "fr-BE": "Website", "nl-BE": "Website"}')
      locale = Analytics::DimensionLocale.create!(name: 'en')

      # Insert 2 visits (same user)
      visit = Analytics::FactVisit.create!(
        visitor_id: '1234',
        user_id: user_id,
        channel: channel,
        first_action_date: date,
        last_action_date: date,
        duration: 300,
        pages_visited: 6,
        matomo_visit_id: '1246',
        last_action_timestamp: 1255256326,
      )
      visit.project << project
      visit.locale << locale

      # Visit 2
      visit = Analytics::FactVisit.create!(
        visitor_id: '1234',
        user_id: user_id,
        channel: channel,
        first_action_date: date,
        last_action_date: date,
        duration: 600,
        pages_visited: 12,
        matomo_visit_id: '1247',
        last_action_timestamp: 1255259999,
        )
      visit.project << project
      visit.locale << locale

    end
  end
end
