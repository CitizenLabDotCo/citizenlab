namespace :carrierwave do
  desc "Recreate images when versions have changed"
  task recreate_versions: :environment do
    MODELS = {
      IdeaImage => ['image'],
      User => ['avatar'],
      ProjectImage => ['image'],
      Tenant => ['logo', 'header_bg'],
      Project => ['header_bg']
    }

    each_tenant do |tenant|
      begin
        puts("Seeding #{tenant} tenant")
        Apartment::Tenant.switch(tenant) do
          MODELS.each do |claz, attributes|
            claz.all.each do |instance|
              attributes.each do |attribute|
                puts "Recreating #{tenant} #{claz.name} #{instance.id} #{attribute} versions"
                begin
                  instance.send(attribute).recreate_versions! if instance.send("#{attribute}?")
                rescue NoMethodError
                  # Needed to get past this bug https://github.com/carrierwaveuploader/carrierwave/issues/828
                  puts "Something went wrong, recreate_version failed!"
                end
              end
            end
          end
        end
      rescue Apartment::TenantNotFound => e
        puts e.message
      end
    end
  end

  def each_tenant(&block)
    tenants.each do |tenant|
      block.call(tenant)
    end
  end

  def tenants
    ENV['DB'] ? ENV['DB'].split(',').map { |s| s.strip } : Apartment.tenant_names || []
  end

end
