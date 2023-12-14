# frozen_string_literal: true

namespace :single_use do
  # Testing:
  # ProjectFolders::Folder.find('d92dada6-1c1e-4684-9916-3d84b84e11e7').images.each { _1.update!(ordering: 1) }.each { _1.dup.update!(ordering: 100) }
  # Project.find('d9acd994-9907-4443-b913-7697d4508d13').project_images.each { _1.update!(ordering: 1) }.each { _1.dup.update!(ordering: 100) }
  #
  # docker-compose run --rm web bin/rails 'data_migrate:remove_unused_project_images[true]'
  task :remove_unused_project_images, [:live_run] => :environment do |_t, args|
    live_run = !!ActiveModel::Type::Boolean.new.cast(args[:live_run])
    puts "Live run: #{live_run}"

    Tenant.switch_each do |tenant|
      puts "Processing tenant #{tenant.host}"

      ids = Project.joins(:project_images).group('projects.id')
        .having('COUNT(project_images.id) > 1').pluck(:id)
      Project.where(id: ids).includes(:project_images).find_each do |project|
        project.project_images[1..].each do |image|
          puts "Removing image #{image.id} from project #{project.id}"
          image.destroy! if live_run
        end
      end

      ids = ProjectFolders::Folder.joins(:images).group('project_folders_folders.id')
        .having('COUNT(project_folders_images.id) > 1').pluck(:id)
      ProjectFolders::Folder.where(id: ids).includes(:images).find_each do |folder|
        folder.images[1..].each do |image|
          puts "Removing image #{image.id} from folder #{folder.id}"
          image.destroy! if live_run
        end
      end
    end
  end
end
