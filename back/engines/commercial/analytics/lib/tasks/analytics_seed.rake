# frozen_string_literal: true

namespace :analytics do
  desc 'Fixes the dimension seeding that cannot be done through the template system because they reference views'
  task seed: :environment do
    Tenant.not_deleted.each do |tenant|
      tenant.switch do
        # Add projects, locales & users to the facts created by template
        project1, project2 = Analytics::DimensionProject.take(2)
        user = Analytics::DimensionUser.last
        locale1, locale2 = Analytics::DimensionLocale.take(2)
        visit1, visit2 = Analytics::FactVisit.take(2)

        if visit1
          visit1.dimension_user = user unless user.nil?
          visit1.dimension_projects << project1 unless project1.nil?
          visit1.dimension_locales << locale1 unless locale1.nil?
        end

        if visit2
          visit2.dimension_user = user unless user.nil?
          visit2.dimension_projects << project2 unless project2.nil?
          visit2.dimension_locales << locale2 unless locale2.nil?
        end
      end
    end
  end
end
