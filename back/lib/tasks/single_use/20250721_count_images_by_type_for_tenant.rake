# Counts images by type for a tenant, with an optional latest date.
# If a date is provided, it counts images created before that date.
# If no date is provided, it counts all images.

namespace :single_use do
  desc 'Counts the images of a tenant by type, with optional latest date.'
  task :count_images_by_type, %i[host date] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    cutoff_date = args[:date] ? Date.parse(args[:date]) : Time.zone.today

    image_extensions = %w[jpg jpeg gif png webp]

    total_images = 0
    total_possibly_user_images = 0

    content_builder_layout_images = 0
    custom_field_option_images = 0
    event_images = 0
    idea_images = 0
    project_folders_images = 0
    project_images = 0
    project_header_bg_images = 0
    project_folders_header_bg_images = 0
    static_pages_header_bg_images = 0
    text_images = 0
    user_avatar_images = 0
    idea_files_of_image_type = 0
    files_of_image_type = 0
    event_files_of_image_type = 0
    project_files_of_image_type = 0
    phase_files_of_image_type = 0
    project_folders_files_of_image_type = 0
    static_page_files_of_image_type = 0
    files_project_files_of_image_type = 0

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      puts "Processing tenant #{Tenant.current.host} \n"
      puts "cutoff_date: #{cutoff_date.inspect}"

      content_builder_layout_images = ContentBuilder::LayoutImage.where(updated_at: ...cutoff_date).count
      puts "ContentBuilder::LayoutImage count: #{content_builder_layout_images}"
      total_images += content_builder_layout_images

      custom_field_option_images = CustomFieldOptionImage.where(updated_at: ...cutoff_date).count
      puts "CustomFieldOptionImage count: #{custom_field_option_images}"
      total_images += custom_field_option_images

      event_images = EventImage.where(updated_at: ...cutoff_date).count
      puts "EventImage count: #{event_images}"
      total_images += event_images

      idea_images = IdeaImage.where(updated_at: ...cutoff_date).count
      puts "IdeaImage count: #{idea_images}"
      total_images += idea_images
      total_possibly_user_images += idea_images

      project_folders_images = ProjectFolders::Image.where(updated_at: ...cutoff_date).count
      puts "ProjectFolders::Image count: #{project_folders_images}"
      total_images += project_folders_images

      project_images = ProjectImage.where(updated_at: ...cutoff_date).count
      puts "ProjectImage count: #{project_images}"
      total_images += project_images

      project_header_bg_images = Project.where(updated_at: ...cutoff_date).where.not(header_bg: nil).count
      puts "Project header background images count: #{project_header_bg_images}"
      total_images += project_header_bg_images

      project_folders_header_bg_images = ProjectFolders::Folder.where(updated_at: ...cutoff_date).where.not(header_bg: nil).count
      puts "ProjectFolders header background images count: #{project_folders_header_bg_images}"
      total_images += project_folders_header_bg_images

      static_pages_header_bg_images = StaticPage.where(updated_at: ...cutoff_date).where.not(header_bg: nil).count
      puts "StaticPage header background images count: #{static_pages_header_bg_images}"
      total_images += static_pages_header_bg_images

      text_images = TextImage.where(imageable_type: 'Idea').where(updated_at: ...cutoff_date).count
      puts "TextImage count: #{text_images}"
      total_images += text_images
      total_possibly_user_images += text_images

      user_avatar_images = User.where(updated_at: ...cutoff_date).where.not(avatar: nil).count
      puts "User avatar images count: #{user_avatar_images}"
      total_images += user_avatar_images
      total_possibly_user_images += user_avatar_images

      IdeaFile.all.each do |idea_file|
        extension = idea_file.name.split('.')[1].downcase
        idea_files_of_image_type += 1 if idea_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "IdeaFile images count: #{idea_files_of_image_type}"
      total_images += idea_files_of_image_type
      total_possibly_user_images += idea_files_of_image_type

      Files::File.all.each do |file|
        extension = file.name.split('.')[1].downcase
        files_of_image_type += 1 if file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "Files::File images count: #{files_of_image_type}"
      total_images += files_of_image_type

      EventFile.all.each do |event_file|
        extension = event_file.name.split('.')[1].downcase
        event_files_of_image_type += 1 if event_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "EventFile images count: #{event_files_of_image_type}"
      total_images += event_files_of_image_type

      ProjectFile.all.each do |project_file|
        extension = project_file.name.split('.')[1].downcase
        project_files_of_image_type += 1 if project_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "ProjectFile images count: #{project_files_of_image_type}"
      total_images += project_files_of_image_type

      PhaseFile.all.each do |phase_file|
        extension = phase_file.name.split('.')[1].downcase
        phase_files_of_image_type += 1 if phase_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "PhaseFile images count: #{phase_files_of_image_type}"
      total_images += phase_files_of_image_type

      ProjectFolders::File.all.each do |project_folders_file|
        extension = project_folders_file.name.split('.')[1].downcase
        project_folders_files_of_image_type += 1 if project_folders_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "ProjectFolders::File images count: #{project_folders_files_of_image_type}"
      total_images += project_folders_files_of_image_type

      StaticPageFile.all.each do |static_page_file|
        extension = static_page_file.name.split('.')[1].downcase
        static_page_files_of_image_type += 1 if static_page_file.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "StaticPageFile images count: #{static_page_files_of_image_type}"
      total_images += static_page_files_of_image_type

      Files::FilesProject.all.each do |files_project|
        extension = files_project.name.split('.')[1].downcase
        files_project_files_of_image_type += 1 if files_project.updated_at < cutoff_date && image_extensions.include?(extension)
      end
      puts "Files::FilesProject images count: #{files_project_files_of_image_type}"
      total_images += files_project_files_of_image_type
    end

    puts "\nTotal images: #{total_images}"
    puts "Total possibly user images: #{total_possibly_user_images}"
  end
end
