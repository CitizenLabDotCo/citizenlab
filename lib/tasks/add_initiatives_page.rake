
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
end
