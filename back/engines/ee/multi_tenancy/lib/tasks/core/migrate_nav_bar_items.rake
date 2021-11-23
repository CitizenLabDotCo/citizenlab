namespace :migrate_nav_bar_items do
  desc "Migration scripts for migrating nav bar items.\
    1. Set page codes.\
    2. Add default NavBarItems and migrate from settings.\
    3. Migrate homepage info.\
    4. Delete cookie policy and success stories.\
    5. Delete migrated tenant settings through separate release."

  task :set_page_codes, [] => [:environment] do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        [%w[about information], %w[privacy-policy privacy-policy], %w[terms-and-conditions terms-and-conditions],
         %w[faq faq], %w[proposals initiatives]].each do |code, slug|
          Page.find_by(slug: slug)&.update! code: code
        end
      end
    end
  end

  task :add_default_items, [] => [:environment] do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        if NavBarItem.exist?
          config = AppConfiguration.instance
          NavBarItemService.new.default_items.each(&:save!)
          [%w[proposals initiatives], %w[all_input ideas_overview], %w[events events_page]].each do |code, feature_name|
            NavBarItem.find_by(code: code)&.destroy! if !config.feature_activated? feature_name
          end
          [%w[about information], %w[faq faq]].each do |code, slug|
            if (page = Page.find_by slug: slug)
              NavBarItem.create!(
                code: 'custom',
                static_page: page,
                title_multiloc: MultilocService.new.i18n_to_multiloc(
                  "nav_bar_items.#{code}.title",
                  locales: CL2_SUPPORTED_LOCALES
                )
              )
            end
          end
        end
      end
    end
  end

  task :move_homepage_info, [] => [:environment] do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        page = Page.find_by slug: 'homepage-info'
        if page
          config = AppConfiguration.instance
          config.update! homepage_info_multiloc: page.body_multiloc
          page.text_images.update_all(
            imageable_id: config.id,
            imageable_type: AppConfiguration.name,
            imageable_field: 'homepage_info_multiloc'
          )
          page.destroy!
        end
      end
    end
  end

  task :delete_cookie_policy_success_stories, [] => [:environment] do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Page.find_by(slug: 'cookie-policy')&.destroy!
        config = AppConfiguration.instance
        Page.where(
          slug: config.settings.dig('initiatives', 'success_stories').map { |s| s['page_slug'] }
        ).each(&:destroy!)
      end
    end
  end
end
