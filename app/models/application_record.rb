class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true


  # @param [Symbol,String] name The name of the polymorphic type
  # @return [Array<Class>] List of classes
  def self.all_polymorphic_types(name)
    @reverse_polymorphic_types ||= Hash.new { |h, k| h[k] = [] }.tap do |hash|
      ActiveRecord::Base.descendants.each do |klass|
        polymorphic_types_of(klass).compact.each { |type| hash[type] << klass }
      end
    end
    @reverse_polymorphic_types[name.to_sym]
  end

  private

  # @param [Class] klass
  # @return [Array<Symbol>] List of polymorphic types
  def self.polymorphic_types_of(klass)
    klass.reflect_on_all_associations
         .map { |assoc_reflection| assoc_reflection.options[:as] }
         .uniq.compact
  end

end


