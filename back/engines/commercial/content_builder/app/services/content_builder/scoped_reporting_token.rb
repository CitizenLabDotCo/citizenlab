# frozen_string_literal: true

module ContentBuilder
  # A short-lived token that permits reading one layout's reporting data, and nothing
  # else.
  #
  # The custom block sandbox renders a block in a real browser to see whether it
  # works, and that browser has no session. Handing it an admin's JWT would hand a container
  # running model-generated JavaScript the full rights of the admin who started the
  # run. This token cannot sign in, cannot read any other layout, and expires in
  # minutes.
  class ScopedReportingToken
    SCOPE = 'reporting_queries'
    ALGORITHM = 'HS256'
    DEFAULT_TTL = 10.minutes

    class << self
      def mint(layout_id:, user_id:, ttl: DEFAULT_TTL)
        JWT.encode(
          {
            scope: SCOPE,
            layout_id: layout_id,
            user_id: user_id,
            tenant: Tenant.current.id,
            exp: ttl.from_now.to_i
          },
          secret,
          ALGORITHM
        )
      end

      # @return [Boolean] whether this token permits reading that layout's data, here
      #   and now. Fails closed on anything it cannot verify (BE-6).
      def permits?(token, layout_id:)
        return false if token.blank? || layout_id.blank?

        payload = decode(token)
        return false if payload.nil?

        payload['scope'] == SCOPE &&
          payload['layout_id'] == layout_id &&
          payload['tenant'] == Tenant.current.id
      end

      private

      def decode(token)
        JWT.decode(token, secret, true, algorithm: ALGORITHM).first
      rescue JWT::DecodeError
        nil
      end

      def secret
        Rails.application.secret_key_base
      end
    end
  end
end
