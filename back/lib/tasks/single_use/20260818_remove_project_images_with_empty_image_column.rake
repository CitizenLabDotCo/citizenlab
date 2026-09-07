# frozen_string_literal: true

namespace :single_use do
  desc 'Remove project_images with empty image column'
  task :remove_project_images_with_empty_image_column, %i[execute host] => :environment do |_t, args|
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Remove project_images with empty image column ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    TenantScript.run(
      'remove_project_images_with_empty_image_column',
      args: args,
      tenants: Tenant.not_deleted,
      description: 'deleting project images with an empty image column'
    ) do |tenant, script|
      ProjectImage.where(image: [nil, '']).find_each do |image|
        puts "Removing image #{image.id} from project #{image.project_id}"
        script.reporter.add_delete('ProjectImage', image.id, context: { tenant: tenant.host })
        image.destroy! if script.execute?
      end
    end

    puts "\n---------- FINISHED TASK: Remove project_images with empty image column ----------\n\n"
  end
end
