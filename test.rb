Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "Examining project_images for tenant #{tenant.name}"

    ProjectImage.all.each do |image|
      puts "    image field blank: #{image.id}" if image.image.blank?
    end
  end
end

Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "Examining project_images for tenant #{tenant.name}"

    ProjectImage.all.each do |image|
      project = Project.find(image.project.id)
      puts "    no associated project exists: #{image.id}" unless project
    end
  end
end

Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "Examining causes for tenant #{tenant.name}"

    Volunteering::Cause.all.each do |cause|
      context = cause.participation_context_type.constantize.find_by(id: cause.participation_context_id)
      puts "    no associated project exists: #{cause.id} #{cause.participation_context_type} #{cause.participation_context_id}" unless context
    end
  end
end

Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "Examining layout_images for tenant #{tenant.name}"

    ContentBuilder::LayoutImage.all.each do |image|
      puts "    image field blank: #{image.id}" if image.image.blank?
    end
  end
end

Tenant.all.each do |tenant|
  Apartment::Tenant.switch(tenant.schema_name) do
    puts "Examining text_images for tenant #{tenant.name}"

    TextImage.all.each do |image|
      puts "    image field blank: #{image.id}" if image.image.blank?
    end
  end
end