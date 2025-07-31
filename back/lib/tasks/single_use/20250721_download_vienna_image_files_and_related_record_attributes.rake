# Very specific tasks for:
# 1. Creating a file of targeted file records attributes + related s3 file paths
# 2. Downloading the base (not resized) image files from the paths in the file
# created in (1). This second task is intended to be run locally, to download
# the files to a local tmp directory.

namespace :single_use do
  desc 'Save selected file records attributes and related s3 file paths to a json file'
  task :save_vienna_image_file_details, %i[date] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    cutoff_date = args[:date] ? Date.parse(args[:date]) : Time.zone.today
    image_extensions = %w[jpg jpeg gif png webp]
    total_images = 0

    tenant_host = 'mitgestalten.wien.gv.at'

    file_details = { idea_images: [], text_images: [], users_with_avatar_images: [], idea_files: [] }

    Apartment::Tenant.switch(tenant_host.tr('.', '_')) do
      idea_images = IdeaImage.where(updated_at: ...cutoff_date)
      puts "Found #{idea_images.count} idea images updated before #{cutoff_date}"
      total_images += idea_images.count

      idea_images.each do |image|
        file_details[:idea_images] << {
          attributes: image.attributes,
          file_path: image.image.url,
          file_name: image.image.identifier
        }
      end

      text_images = TextImage.where(imageable_type: 'Idea').where(updated_at: ...cutoff_date)
      puts "Found #{text_images.count} text images updated before #{cutoff_date}"
      total_images += text_images.count

      text_images.each do |image|
        file_details[:text_images] << {
          attributes: image.attributes,
          file_path: image.image.url,
          file_name: image.image.identifier
        }
      end

      users_with_avatars = User.where(updated_at: ...cutoff_date).where.not(avatar: nil)
      puts "Found #{users_with_avatars.count} users with avatar images updated before #{cutoff_date}"
      total_images += users_with_avatars.count

      users_with_avatars.each do |user|
        file_details[:users_with_avatar_images] << {
          attributes: user.attributes,
          file_path: user.avatar.url,
          file_name: user.avatar.identifier
        }
      end

      n_idea_files_details_saved = 0

      IdeaFile.all.each do |idea_file|
        extension = idea_file.name.split('.')[1].downcase
        # Do not filter by cutoff date, as idea files that are images have never had metadata stripped
        if image_extensions.include?(extension)
          file_details[:idea_files] << {
            attributes: idea_file.attributes,
            file_path: idea_file.file.url,
            file_name: idea_file.file.identifier
          }
          n_idea_files_details_saved += 1
        end
      end

      puts "Found #{n_idea_files_details_saved} idea files with image extensions updated before #{cutoff_date}"
      total_images += n_idea_files_details_saved

      puts "Total image file record details saved: #{total_images}"
    end

    Rails.root.join('tmp', "vienna_image_files_w_cuttoff_#{cutoff_date}.json")
      .write(JSON.pretty_generate(file_details))

    puts "Saved file details to tmp/vienna_image_files_w_cuttoff_#{cutoff_date}.json"
  end

  desc 'Downloads image files from paths found in provided json file'
  task :download_vienna_image_files, %i[file_path] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    file_path = args[:file_path] if args[:file_path]
    file_contents = File.read(file_path)
    file_details = JSON.parse(file_contents, symbolize_names: true)
    total_downloaded_files = 0
    total_errored_downloads = 0

    puts "n file details: #{file_details.values.sum(&:count)}"

    file_details.each do |collection|
      puts "Processing #{collection} files..."
    end

    file_details.each_value do |array|
      array.each do |details|
        file_path = details[:file_path]
        file_name = details[:file_name]

        begin
          File.binwrite("tmp/#{file_name}", URI.open(file_path).read)
          puts "Downloaded file #{file_name}"
          total_downloaded_files += 1
        rescue StandardError => e
          puts "ERROR downloading or saving #{file_name} from #{file_path}: #{e.class} - #{e.message}"
          total_errored_downloads += 1
        end
      end
    end

    puts "Total files downloaded: #{total_downloaded_files}"
    puts "Total errored downloads: #{total_errored_downloads}"
  end
end
