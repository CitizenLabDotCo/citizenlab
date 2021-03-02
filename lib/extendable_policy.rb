module ExtendablePolicy
  def self.included(base)
    base.extend ClassMethods

    base.class_eval do
      def self.inherited(subclass)
        super
        subclass.prepend(MonkeyPatch)
      end
    end
  end

  module MonkeyPatch
    def permitted_attributes
      base_attributes = super
      self.class._permitted_attributes.each do |attribute, bool_opts_or_blk|
        if permittable_value?(bool_opts_or_blk)
          base_attributes.push(attribute)
        else
          index = base_attributes.find_index(attribute)
          base_attributes.delete_at(index) if index
        end
      end
      base_attributes
    end

    def permittable_value?(bool_opts_or_blk)
      case bool_opts_or_blk
      when ->(bob) { bob.respond_to?(:call) }
        bool_opts_or_blk.call(user, record)
      when Hash
        bool_opts_or_blk.values_at(:if, :unless).compact.all? { |m| m && send(m) }
      else
        bool_opts_or_blk
      end
    end
  end

  module ClassMethods
    def permit_attribute(attribute, bool_opts_or_blk = true)
      return unless _bool_opts_or_blk_valid?(bool_opts_or_blk)

      _permitted_attributes[attribute] = bool_opts_or_blk
    end

    def _permitted_attributes
      @_permitted_attributes ||= {}
    end

    def _bool_opts_or_blk_valid?(bool_opts_or_blk)
      bool_opts_or_blk.respond_to?(:call) ||
        bool_opts_or_blk.is_a?(TrueClass) ||
        bool_opts_or_blk.is_a?(FalseClass) ||
        _conditional_call?(bool_opts_or_blk)
    end

    def _conditional_call?(bool_opts_or_blk)
      bool_opts_or_blk.is_a?(Hash) && (bool_opts_or_blk.keys & %i[if unless]).any? &&
        bool_opts_or_blk.values_at(:if, :unless).compact.all? { |m| instance_methods.include?(m) }
    end
  end
end
