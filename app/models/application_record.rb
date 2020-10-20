class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # do not rename to will_be_destroyed, it overrides activerecord.
  attr_accessor :to_be_destroyed

  alias to_be_destroyed? to_be_destroyed

  before_destroy prepend: true do
    self.to_be_destroyed = true
  end
end
