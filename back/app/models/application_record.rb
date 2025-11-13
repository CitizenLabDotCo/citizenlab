# frozen_string_literal: true

class ApplicationRecord < ActiveRecord::Base
  include Sluggable
  include Imageable

  self.abstract_class = true

  # do not rename to will_be_destroyed, it overrides activerecord.
  attr_accessor :to_be_destroyed

  alias to_be_destroyed? to_be_destroyed

  before_destroy prepend: true do
    self.to_be_destroyed = true
  end

  def self.disable_inheritance
    initial_inheritance_column = inheritance_column
    self.inheritance_column = :_type_disabled
    yield
    self.inheritance_column = initial_inheritance_column
  end

  def valid_attribute?(attribute_name)
    valid?
    errors[attribute_name].blank?.tap { |_| errors.clear }
  end
end
