# frozen_string_literal: true

module UserConfirmation
  module Patches
    module Frontend
      module UrlService
        def reset_confirmation_code_url(options = {})
          "#{home_url(options)}/reset-confirmation-code"
        end
      end
    end
  end
end
