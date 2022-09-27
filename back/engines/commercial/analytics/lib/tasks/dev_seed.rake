# frozen_string_literal: true

# Temporary file to seed some data whilst developing data model
namespace :analytics do
  desc 'Seed some dummy data for dev'
  task seed_dev_data: :environment do
    Apartment::Tenant.switch('localhost') do
      puts 'Seeding some visits data for localhost'

      # delete any we've already created
      Analytics::FactVisit.delete_all
      Analytics::DimensionReferrerType.delete_all
      Analytics::DimensionLocale.delete_all

      # Create static dimensions - locale / channel
      Rake::Task['analytics:populate_locale_dimension'].execute(host: 'localhost')
      locale1 = Analytics::DimensionLocale.first
      locale2 = Analytics::DimensionLocale.last
      referrer_type1 = Analytics::DimensionReferrerType.create!(key: 'website', name: 'Website')
      referrer_type2 = Analytics::DimensionReferrerType.create!(key: 'social', name: 'Social')

      # Get some other dimensions
      project = Analytics::DimensionProject.first
      user = Analytics::DimensionUser.first
      date1 = Analytics::DimensionDate.first
      date2 = Analytics::DimensionDate.find('2022-09-05')

      # Insert 2 visits (same user)
      visit = Analytics::FactVisit.create!(
        visitor_id: '1',
        dimension_user: user,
        dimension_referrer_type: referrer_type1,
        dimension_date_first_action: date1,
        dimension_date_last_action: date1,
        duration: 300,
        pages_visited: 5,
        matomo_visit_id: 101,
        matomo_last_action_time: '2022-09-05 18:08:39.0'
      )
      visit.dimension_projects << project
      visit.dimension_locales << locale1

      # Visit 2
      visit = Analytics::FactVisit.create!(
        visitor_id: '1',
        dimension_user: user,
        dimension_referrer_type: referrer_type1,
        dimension_date_first_action: date1,
        dimension_date_last_action: date1,
        duration: 600,
        pages_visited: 10,
        matomo_visit_id: 102,
        matomo_last_action_time: '2022-09-05 18:08:39.0'
      )
      visit.dimension_projects << project
      visit.dimension_locales << locale2

      # Visit 3 - no user, no project
      visit = Analytics::FactVisit.create!(
        visitor_id: '2',
        dimension_referrer_type: referrer_type2,
        dimension_date_first_action: date2,
        dimension_date_last_action: date2,
        duration: 900,
        pages_visited: 15,
        returning_visitor: false,
        matomo_visit_id: 103,
        matomo_last_action_time: '2022-09-05 18:08:39.0'
      )
      visit.dimension_locales << locale2
    end
  end
end
