# frozen_string_literal: true

namespace :migrate_nav_bar_items do
  desc "Migration scripts for migrating nav bar items.\
    1. Set page codes.\
    2. Add default NavBarItems and migrate from settings.\
    3. Migrate homepage info.\
    4. Delete cookie policy and success stories.\
    5. Delete migrated tenant settings through separate release."

  task :set_page_codes, [] => [:environment] do
    codes_and_slugs = [
      %w[about information],
      %w[privacy-policy privacy-policy],
      %w[terms-and-conditions terms-and-conditions],
      %w[faq faq]
    ]
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        codes_and_slugs.each do |code, slug|
          unless StaticPage.find_by(slug: slug)&.update_column(:code, code)
            puts "Failed to set code #{code} for page #{slug}"
          end
        end
      end
    end
  end

  task :add_default_items, [] => [:environment] do
    codes_and_feature_names = [%w[all_input ideas_overview], %w[events events_page]]
    codes_and_slugs = [%w[about information], %w[faq faq]]
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        unless NavBarItem.exists?
          config = AppConfiguration.instance
          NavBarItemService.new.default_items.each do |item|
            puts "Failed to add nav bar item #{item.code}" unless item.save
          end
          codes_and_feature_names.each do |code, feature_name|
            unless config.feature_activated?(feature_name) && !NavBarItem.find_by(code: code)&.destroy && NavBarItem.find_by(code: code)
              puts "Failed to remove nav bar item #{code}"
            end
          end
          codes_and_slugs.each do |code, slug|
            next unless (page = StaticPage.find_by slug: slug)

            item = NavBarItem.new code: 'custom', static_page: page
            unless item.save
              puts "Failed to add nav bar item #{code}"
            end
          end
        end
      end
    end
  end
end
