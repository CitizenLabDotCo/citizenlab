# frozen_string_literal: true

require 'zlib'

module GemExtensions
  module ActiveRecord
    module ConnectionAdapters
      module PostgreSqlAdapter
        def generate_advisory_lock_id
          db_name_hash = Zlib.crc32("#{current_schema}:#{current_database}")
          ::ActiveRecord::Migrator::MIGRATOR_SALT * db_name_hash
        end
      end
    end
  end
end
