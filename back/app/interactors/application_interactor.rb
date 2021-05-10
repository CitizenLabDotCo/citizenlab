class ApplicationInteractor
  include Interactor
  extend ActiveModel::Naming

  delegate :fail!, to: :context

  def fail_with_error!(resource_or_errors, error_key = :invalid, options = {})
    @errors ||= ActiveModel::Errors.new(self)

    if resource_or_errors.is_a? ActiveModel::Errors
      @errors.merge!(resource_or_errors)
      fail! errors: @errors
    else
      @errors.add(resource_or_errors, error_key, options)
      fail! errors: @errors
    end
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
