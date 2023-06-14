# frozen_string_literal: true

module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnect
        # Patch +OmniAuth::Strategies::OpenIDConnect+ to allow dynamic specification of the issuer.
        def issuer
          return options.issuer.call(env) if options.issuer.respond_to?(:call)

          super
        end
      end
    end
  end
end
