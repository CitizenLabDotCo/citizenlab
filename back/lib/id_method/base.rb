# frozen_string_literal: true

module IdMethod
  class Base
    def sso_method?
      false
    end

    def verification_method?
      false
    end
  end
end
