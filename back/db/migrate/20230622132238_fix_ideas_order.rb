# frozen_string_literal: true

class FixIdeasOrder < ActiveRecord::Migration[7.0]
  def up
    tablenames = %i[projects phases]
    tablenames.each do |tablename|
      execute "UPDATE #{tablename} SET ideas_order = NULL WHERE participation_method NOT IN ('ideation', 'voting') AND ideas_order IS NOT NULL"
      execute "UPDATE #{tablename} SET ideas_order = 'trending' WHERE participation_method = 'ideation' AND ideas_order IS NULL"
      execute "UPDATE #{tablename} SET ideas_order = 'random' WHERE participation_method = 'voting' AND ideas_order != 'random'"
    end
  end
end
