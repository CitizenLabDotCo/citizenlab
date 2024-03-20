# frozen_string_literal: true

require 'active_support/concern'

module CustomFieldCopy
  extend ActiveSupport::Concern
  included do
    # non-persisted attributes to enable form copying
    attribute :temp_id, :string, default: nil
    attribute :new_id, :string, default: nil

    def id
      new_id || super
    end
  end
end
