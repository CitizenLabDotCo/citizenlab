namespace :migrate_nav_bar_items do
  desc "Migration scripts for migrating nav bar items.\
    1. Set page codes.\
    2. Add default NavBarItems and migrate from settings.\
    3. Migrate homepage info.\
    4. Delete cookie policy and success stories.\
    5. Delete migrated tenant settings through separate release."

  task :set_page_codes, [] => [:environment] do
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        [%w[about information], %w[privacy-policy privacy-policy], %w[terms-and-conditions terms-and-conditions],
         %w[faq faq], %w[proposals initiatives]].each do |code, slug|
          if !StaticPage.find_by(slug: slug)&.update_column(:code, code)
            puts "Failed to set code #{code} for page #{slug}"
          end
        end
      end
    end
  end

  task :add_default_items, [] => [:environment] do
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        if !NavBarItem.exists?
          config = AppConfiguration.instance
          NavBarItemService.new.default_items.each do |item|
            puts "Failed to add nav bar item #{item.code}" if !item.save
          end
          [%w[proposals initiatives], %w[all_input ideas_overview], %w[events events_page]].each do |code, feature_name|
            if !config.feature_activated? feature_name
              if !NavBarItem.find_by(code: code)&.destroy
                puts "Failed to remove nav bar item #{code}" if NavBarItem.find_by(code: code)
              end
            end
          end
          [%w[about information], %w[faq faq]].each do |code, slug|
            if (page = StaticPage.find_by slug: slug)
              item = NavBarItem.new code: 'custom', static_page: page
              if !item.save
                puts "Failed to add nav bar item #{code}"
              end
            end
          end
        end
      end
    end
  end

  task :move_homepage_info, [] => [:environment] do
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        page = StaticPage.find_by slug: 'homepage-info'
        if page
          config = AppConfiguration.instance
          if !config.update_column(:homepage_info_multiloc, page.body_multiloc)
            puts 'Failed move homepage info'
          end
          page.text_images.update_all(
            imageable_id: config.id,
            imageable_type: AppConfiguration.name,
            imageable_field: 'homepage_info_multiloc'
          )
          if !page.destroy
            puts 'Failed delete homepage info'
          end
        end
      end
    end
  end

  task :delete_referenced_success_stories, [] => [:environment] do
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        config = AppConfiguration.instance
        slugs = config.settings.dig('initiatives', 'success_stories')&.map { |s| s['page_slug'] } || []
        StaticPage.where(slug: slugs).each do |page|
          if !page.destroy
            puts "Failed to delete page #{page.slug}"
          end
        end
      end
    end
  end

  task :delete_cookie_policy_success_stories, [] => [:environment] do
    Tenant.all.each do |tenant|
      puts tenant.host
      Apartment::Tenant.switch(tenant.schema_name) do
        if !StaticPage.find_by(slug: 'cookie-policy')&.destroy
          puts 'Failed to delete cookie policy'
        end
        slugs = %w[initiatives-success-1 initiatives-success-2 initiatives-success-3 initiatives-success-4]
        StaticPage.where(slug: slugs).each do |page|
          if !page.destroy
            puts "Failed to delete page #{page.slug}"
          end
        end
      end
    end
  end
end
