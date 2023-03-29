# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Volunteering
        class Cause < Base
          ref_attribute :participation_context
          upload_attribute :image
          attributes %i[description_multiloc ordering title_multiloc]
        end
      end
    end
  end
end
