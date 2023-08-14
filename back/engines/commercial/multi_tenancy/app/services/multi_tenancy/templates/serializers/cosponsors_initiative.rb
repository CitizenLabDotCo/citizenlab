# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CosponsorsInitiative < Base
        ref_attributes %i[initiative user]
      end
    end
  end
end
