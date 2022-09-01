# frozen_string_literal: true

module Analytics
  class ApplicationView < ApplicationRecord
    self.abstract_class = true
    def readonly?
      true
    end
  end
end
