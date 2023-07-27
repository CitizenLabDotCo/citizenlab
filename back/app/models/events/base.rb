# frozen_string_literal: true

module Events
  class Base < ApplicationRecord
    self.abstract_class = true
    self.table_name_prefix = 'events_'
  end
end
