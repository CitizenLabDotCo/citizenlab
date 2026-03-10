module MultiTenancy
  module Templates
    module Serializers
      class Space < Base
        attributes %i[title_multiloc description_multiloc]
      end
    end
  end
end
