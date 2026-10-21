# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # A block as the toolbox lists it: what it is called, and the version a new
      # placement should pin. Nothing about any version's code; that is the version
      # endpoint's business, and a report can be public.
      class CustomBlockSerializer < ::WebApi::V1::BaseSerializer
        set_type :custom_block

        attributes :title_multiloc, :status, :created_at

        # Through the loaded association, not +latest_version+, which orders in SQL
        # and would query once per block.
        attribute :latest_version do |block|
          block.versions.max_by(&:number)&.number
        end

        attribute :targets do |block|
          block.versions.max_by(&:number)&.manifest&.dig('targets') || []
        end
      end
    end
  end
end
