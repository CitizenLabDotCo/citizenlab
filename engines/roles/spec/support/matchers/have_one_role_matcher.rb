module HaveOneRoleMatcher
  class HaveOneRoleMatcher
    attr_reader :role_name

    def initialize(role_name)
      @role_name = role_name
    end

    def matches?(klass)
      klass.method_defined?(:"add_#{role_name}_role") &&
        klass.method_defined?(:"remove_#{role_name}_role") &&
        klass.method_defined?(:"#{role_name}?") &&
        klass.method_defined?(:"#{role_name}_role") &&
        klass.respond_to?(role_name) &&
        klass.respond_to?(:"not_#{role_name}")
    end

    def failure_message
      "shit"
    end

    def failure_message_when_negated
      "shit"
    end
  end

  def have_one_role(klass)
    HaveOneRoleMatcher.new(klass)
  end
end
