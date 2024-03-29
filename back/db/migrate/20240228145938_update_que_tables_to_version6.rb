# frozen_string_literal: true

class UpdateQueTablesToVersion6 < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up { Que.migrate!(version: 6) }
      dir.down { Que.migrate!(version: 5) }
    end
  end
end
