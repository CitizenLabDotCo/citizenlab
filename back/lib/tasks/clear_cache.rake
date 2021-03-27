
namespace :cl2back do

  desc "Clears the cache store"
  task :clear_cache_store => :environment do
    Rails.logger.debug "Clearing the cache"
    Rails.cache.clear
    Rails.logger.debug "Cleared the cache"
  end
end
