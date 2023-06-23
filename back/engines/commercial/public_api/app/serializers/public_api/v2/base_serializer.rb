# frozen_string_literal: true

module PublicApi
  module V2
    class BaseSerializer < ActiveModel::Serializer
      delegate :classname_to_type, :type_to_classname, to: :class

      class << self
        def classname_to_type(classname)
          classname.underscore.dasherize
        end

        def type_to_classname(type)
          type.underscore.classify
        end
      end
    end
  end
end
