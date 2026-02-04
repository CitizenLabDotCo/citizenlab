# frozen_string_literal: true

module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnect
        # Patch +OmniAuth::Strategies::OpenIdConnect+

        # Patched to allow dynamic specification of the issuer.
        def issuer
          return options.issuer.call(env) if options.issuer.respond_to?(:call)

          super
        end

        # Patched to allow openid_connect without a userinfo endpoint (id_austria)
        def user_info
          return super unless name == 'id_austria'
          return @user_info if @user_info

          if access_token.id_token
            decoded = decode_id_token(access_token.id_token).raw_attributes
            @user_info = ::OpenIDConnect::ResponseObject::UserInfo.new decoded
          end
        end
      end
    end
  end
end
