class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  attr_accessor :will_be_destroyed

  alias will_be_destroyed? will_be_destroyed

  before_destroy prepend: true do
    self.will_be_destroyed = true
  end
end
