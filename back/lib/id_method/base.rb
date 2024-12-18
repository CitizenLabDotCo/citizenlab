# frozen_string_literal: true

module IdMethod
  class Base
    def auth?
      false
    end

    def verification?
      false
    end
  end
end
