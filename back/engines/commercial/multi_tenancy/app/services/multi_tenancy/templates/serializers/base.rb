# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Base
        include Core

        def self.serialize_timestamp(ts)
          ts&.to_s
        end

        attribute('created_at') { |record| serialize_timestamp(record.created_at) }
        attribute('updated_at') { |record| serialize_timestamp(record.updated_at) }
      end
    end
  end
end
