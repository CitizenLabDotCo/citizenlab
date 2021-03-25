
namespace :cl2back do
  desc "Adds the initiatives page to all platforms"
  task :add_initiatives_page => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding initiatives page for tenant #{tenant.name}"
        Page.create!(
          slug: 'initiatives',
          title_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_title'),
          body_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_body'),
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
        page = Page.find_by(slug: 'initiatives')
        if page
          page.update!(
            title_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_title'),
            body_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_body'),
          )
        else
          puts "No initiatives page found for tenant #{tenant.name}, creating it instead"
          Page.create!(
            slug: 'initiatives',
            title_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_title'),
            body_multiloc: multiloc_service.i18n_to_multiloc('pages.initiatives_body'),
          )
        end
      end
    end
  end

  desc "Adds the initiatives success stories to all platforms"
  task :add_success_stories_pages => :environment do
    multiloc_service = MultilocService.new

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding succes stories pages for tenant #{tenant.name}"

        (1..3).each do |i|
          Page.create!(
            slug: "initiatives-success-#{i}",
            title_multiloc: multiloc_service.i18n_to_multiloc("pages.initiatives_success_#{i}_title"),
            body_multiloc: multiloc_service.i18n_to_multiloc("pages.initiatives_success_#{i}_body"),
          )
        end
      end
    end
  end
end
