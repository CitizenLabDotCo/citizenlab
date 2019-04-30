
namespace :cl2back do
  desc "Adds the viewed idea status to all platforms"
  task :add_viewed_idea_status => :environment do
    multiloc_service = MultilocService.new
    failed_tenants = []
    skipped_tenants = []

    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        puts "Adding viewed idea status for tenant #{tenant.name}"
        if !IdeaStatus.find_by(code: 'viewed').present? && !IdeaStatus.find_by(code: 'custom').present?
          success = IdeaStatus.create(
            title_multiloc: multiloc_service.i18n_to_multiloc('statuses.viewed'),
            ordering: 150,
            code: 'viewed',
            color: '#01A1B1',
            description_multiloc: multiloc_service.i18n_to_multiloc('statuses.viewed_description')
            )
          failed_tenants += [tenant.host] if !success
        else
          skipped_tenants += [tenant.host]
        end        
      end
    end

    if failed_tenants.present?
      puts "Failed to add viewed status for #{failed_tenants.join(', ')}"
    else
      puts "Success!"
    end
    if failed_tenants.present?
      puts "Skipped adding viewed status for #{skipped_tenants.join(', ')}"
    end
  end
end
