# frozen_string_literal: true

# Temporary file to seed some data whilst developing data model
namespace :analytics do
  desc 'Seed some dummy data for dev'
  task seed_dev_data: :environment do
    Apartment::Tenant.switch('localhost') do
      puts "Seeding some visits data for localhost"

      # delete any we've already created
      Analytics::DimensionChannel.delete_all
      Analytics::DimensionLocale.delete_all
      Analytics::FactVisit.delete_all

      # Create static dimensions - locale / channel
      Rake::Task['analytics:populate_locale_dimension'].execute(host: 'localhost')
      locale = Analytics::DimensionLocale.first
      channel = Analytics::DimensionChannel.create!(name_multiloc: '{"en": "Website", "fr-BE": "Website", "nl-BE": "Website"}')

      # Get some other dimensions
      project = Analytics::DimensionProject.first
      user_id = User.first.id
      date1 = Analytics::DimensionDate.first
      date2 = Analytics::DimensionDate.find('2022-09-05')

      # Insert 2 visits (same user)
      visit = Analytics::FactVisit.create!(
        visitor_id: '1',
        user_id: user_id,
        channel: channel,
        first_action_date: date1,
        last_action_date: date1,
        duration: 300,
        pages_visited: 5,
        matomo_visit_id: '101',
        last_action_timestamp: 1255256326,
      )
      visit.project << project
      visit.locale << locale

      # Visit 2
      visit = Analytics::FactVisit.create!(
        visitor_id: '1',
        user_id: user_id,
        channel: channel,
        first_action_date: date1,
        last_action_date: date1,
        duration: 600,
        pages_visited: 10,
        matomo_visit_id: '102',
        last_action_timestamp: 1255259999,
        )
      visit.project << project
      visit.locale << locale

      # Visit 3 - no project
      visit = Analytics::FactVisit.create!(
        visitor_id: '2',
        channel: channel,
        first_action_date: date2,
        last_action_date: date2,
        duration: 900,
        pages_visited: 15,
        matomo_visit_id: '103',
        last_action_timestamp: 1255259999,
        )
      visit.locale << locale

    end
  end

end
