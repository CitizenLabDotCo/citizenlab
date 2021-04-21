class ApplicationInteractor
  include Interactor
  extend ActiveModel::Naming

  delegate :fail!, to: :context

  def fail_with_error!(resource, error_key, options = {})
    errors.add(resource, error_key, options)
    fail! errors: errors
  end

  def errors
    @errors ||= ActiveModel::Errors.new(self)
  end

  def read_attribute_for_validation(attribute)
    context[attribute]
  end

  def self.lookup_ancestors
    [self]
  end

  def self.human_attribute_name(attribute, options = {})
    attribute
  end
end
