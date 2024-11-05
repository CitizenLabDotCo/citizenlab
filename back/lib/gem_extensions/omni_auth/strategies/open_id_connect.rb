# frozen_string_literal: true

module GemExtensions
  module OmniAuth
    module Strategies
      module OpenIdConnect
        # Patch +OmniAuth::Strategies::OpenIdConnect+ to allow dynamic specification of the issuer.
        def issuer
          return options.issuer.call(env) if options.issuer.respond_to?(:call)

          super
        end

        # Patched to allow openid_connect without a userinfo endpoint (id_austria)
        def user_info
          return @user_info if @user_info

          if access_token.id_token
            decoded = decode_id_token(access_token.id_token).raw_attributes
            merge_with = JSON::JWS.new({})
            merge_with = access_token.userinfo!.raw_attributes if options.userinfo_endpoint
            @user_info = ::OpenIDConnect::ResponseObject::UserInfo.new merge_with.merge(decoded)
          else
            @user_info = access_token.userinfo!
          end
        end
      end
    end
  end
end
