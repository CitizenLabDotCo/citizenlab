# frozen_string_literal: true

module GemExtensions
  module ActiveRecord
    module ConnectionAdapters
      module AbstractAdapter
        def generate_advisory_lock_id; end
      end
    end
  end
end