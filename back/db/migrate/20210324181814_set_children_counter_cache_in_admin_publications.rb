class SetChildrenCounterCacheInAdminPublications < ActiveRecord::Migration[6.0]
  def up
    AdminPublication.find_each { |admin_publication| admin_publication.send(:update_counter_cache) }
  end
end
