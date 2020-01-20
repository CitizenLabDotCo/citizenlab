namespace :fix_existing_tenants do
  desc "Delete new idea/initiative/comment for admin notifications"
  task :delete_admin_new_content_notifications => [:environment] do |t, args|
    failures = []
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        types = ["Notifications::NewIdeaForAdmin", "Notifications::NewCommentForAdmin", "Notifications::NewInitiativeForAdmin"]
        Notification.where(type: type).destroy_all
      end
    end
  end
end