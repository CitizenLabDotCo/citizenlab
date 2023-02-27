# frozen_string_literal: true

module GemExtensions
  module ActiveRecord
    module ConnectionAdapters
      module AbstractAdapter
        def generate_advisory_lock_id
          # Each connection adapter must provide its own implementation.
          # For instance, this could look like to:
          #   def generate_advisory_lock_id
          #     db_name_hash = Zlib.crc32(current_database)
          #     Migrator::MIGRATOR_SALT * db_name_hash
          #   end
          raise NotImplementedError
        end
      end
    end
  end
end
