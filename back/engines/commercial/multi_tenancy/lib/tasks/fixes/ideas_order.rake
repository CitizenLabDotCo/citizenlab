# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix ideas order after validation constraint changes'
  task :ideas_order, [] => [:environment] do
    %i[projects phases].each do |tablename|
      ActiveRecord::Base.connection.execute "UPDATE #{tablename} SET ideas_order = NULL WHERE participation_method NOT IN ('ideation', 'voting') AND ideas_order IS NOT NULL"
      ActiveRecord::Base.connection.execute "UPDATE #{tablename} SET ideas_order = 'trending' WHERE participation_method = 'ideation' AND ideas_order IS NULL"
      ActiveRecord::Base.connection.execute "UPDATE #{tablename} SET ideas_order = 'random' WHERE participation_method = 'voting' AND ideas_order != 'random'"
    end
  end
end
