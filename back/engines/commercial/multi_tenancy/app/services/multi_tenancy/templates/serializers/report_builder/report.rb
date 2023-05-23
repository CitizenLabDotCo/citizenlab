# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ReportBuilder
        class Report < Base
          ref_attribute :owner
          attribute :name
        end
      end
    end
  end
end
