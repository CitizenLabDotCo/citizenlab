# Re-uploads citizen images, to ensure the relatively new metadata stripping is
# applied. Primarily for use with the Vienna tenant, but tenant is selectable
# to enable testing on a demo.
namespace :single_use do
  desc 'Re-uploads user images to ensure metadata stripping is applied.'
  task :reupload_user_images, %i[host date] => [:environment] do |_t, args|
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    cutoff_date = args[:date] ? Date.parse(args[:date]) : Time.zone.today + 1.day
    total_images = 0
    successful = 0
    failed = 0

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      users_with_avatars = User.where(updated_at: ...cutoff_date).where.not(avatar: nil)
      puts "Found #{users_with_avatars.count} users with avatar images updated before #{cutoff_date}"
      total_images += users_with_avatars.count

      users_with_avatars.each do |user|
        if user.avatar.present?
          file_path = user.avatar.url
          file_name = user.avatar.identifier

          begin
            File.binwrite("tmp/#{file_name}", URI.open(file_path).read)
          rescue StandardError => e
            puts "ERROR downloading or saving #{file_name} from #{file_path}: #{e.class} - #{e.message}"
          end

          begin
            image_path = Rails.root.join("tmp/#{file_name}")
            image_file = File.open(image_path)
            user.avatar = image_file
            if user.save
              puts "Successfully re-uploaded avatar for user #{user.id} (#{user.email})"
              successful += 1
            else
              puts "Failed to save user #{user.id} (#{user.email}) after re-uploading avatar: #{user.errors.full_messages.join(', ')}"
              failed += 1
            end
          rescue StandardError => e
            puts "ERROR re-uploading avatar for user #{user.id} (#{user.email}): #{e.class} - #{e.message}"
            failed += 1
          end
        end
      end

      puts "Total image uploads attempted: #{total_images}"
      puts "Total successful uploads: #{successful}"
      puts "Total failed uploads: #{failed}"
    end
  end
end