# frozen_string_literal: true

class EnablePgTrgmExtension < ActiveRecord::Migration[7.1]
  def change
    return unless Apartment::Tenant.current == 'public'

    reversible do |dir|
      dir.up do
        execute 'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA shared_extensions'
      end

      dir.down do
        execute 'DROP EXTENSION IF EXISTS pg_trgm'
      end
    end
  end
end
