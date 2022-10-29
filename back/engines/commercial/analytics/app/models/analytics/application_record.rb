# frozen_string_literal: true

module Analytics
  class ApplicationRecord < ActiveRecord::Base
    self.abstract_class = true
  end
end
