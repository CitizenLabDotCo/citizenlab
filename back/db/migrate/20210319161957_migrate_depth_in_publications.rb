class MigrateDepthInPublications < ActiveRecord::Migration[6.0]
  def change
    AdminPublication.find_each { |admin_publication| admin_publication.send(:set_depth_for_self_and_descendants!) }
  end
end
