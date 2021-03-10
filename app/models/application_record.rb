class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # do not rename to will_be_destroyed, it overrides activerecord.
  attr_accessor :to_be_destroyed

  alias to_be_destroyed? to_be_destroyed

  before_destroy prepend: true do
    self.to_be_destroyed = true
  end

  def self.polymorphic_associations name, as
    ActiveRecord::Base.descendants.select do |claz|
      claz.reflect_on_all_associations.select{|asc| asc.name == name.to_sym && asc.options[:as] == as.to_sym}.present?
    end
  end
end
