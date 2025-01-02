# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Cosponsorship < Base
        attribute :status
        ref_attributes %i[idea user]
      end
    end
  end
end
