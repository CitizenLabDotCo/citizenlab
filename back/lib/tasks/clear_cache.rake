# frozen_string_literal: true

namespace :cl2back do
  desc 'Clears the cache store'
  task clear_cache_store: :environment do
    Rails.logger.info 'cl2back:clear_cache_store started'
    Rails.cache.clear
    Rails.logger.info 'cl2back:clear_cache_store finished'
  end
end
