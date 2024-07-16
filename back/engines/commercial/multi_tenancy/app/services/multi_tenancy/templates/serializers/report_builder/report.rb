# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ReportBuilder
        class Report < Base
          ref_attributes %i[owner phase]
          attributes %i[name visible]
        end
      end
    end
  end
end
