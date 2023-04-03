# frozen_string_literal: true

module GemExtensions
  module ActiveRecord
    module Migrator
      def generate_migrator_advisory_lock_id
        ::ActiveRecord::Base.connection.generate_advisory_lock_id
      end
    end
  end
end
