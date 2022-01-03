namespace :cl2back do
  desc "Adds the initiatives page to all platforms"
  task :add_initiatives_page => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding initiatives page for tenant #{tenant.name}"
        StaticPage.create!(
          slug: 'initiatives',
          title_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_title'),
          body_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_body'),
        )
      end
    end
  end

  desc "Updates the initiatives page on all platforms"
  task :update_initiatives_page => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Updating initiatives page for tenant #{tenant.name}"
        page = StaticPage.find_by(slug: 'initiatives')
        if page
          page.update!(
            title_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_title'),
            body_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_body'),
          )
        else
          puts "No initiatives page found for tenant #{tenant.name}, creating it instead"
          StaticPage.create!(
            slug: 'initiatives',
            title_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_title'),
            body_multiloc: multiloc_service.i18n_to_multiloc('static_pages.initiatives_body'),
          )
        end
      end
    end
  end
end
