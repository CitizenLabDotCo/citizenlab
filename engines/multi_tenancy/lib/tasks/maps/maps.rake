
namespace :maps do

  desc "Change the default tile provider to the given value"
  task :change_default_tile_provider, [:new_tile_provider] => [:environment] do |t, args|
    failed = []
    skipped = []
    Tenant.all.each do |tn| 
      Apartment::Tenant.switch(tn.schema_name) do
        maps = tn.settings['maps']
        if maps
          maps['tile_provider'] = args[:new_tile_provider]
          puts "Updating tile provider for #{tn.host}"
          failed += [tn.host] if !tn.save
        else
          skipped << tn.host
        end
      end
    end
    if skipped.present?
      puts "Skipped: #{failed.join(', ')}"
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end
end
