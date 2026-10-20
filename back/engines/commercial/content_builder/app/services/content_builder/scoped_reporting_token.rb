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
    # One render's worth: the sandbox client abandons the render after 90s, so a token
    # that outlives that by much is only a window in which a stolen one still works.
    DEFAULT_TTL = 2.minutes

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
          payload['tenant'] == Tenant.current.id &&
          minter_still_active?(payload['user_id'])
      end

      private

      # The token is minted for a person, so it stops working when they do: blocking
      # someone should not leave a credential of theirs running for its full life.
      def minter_still_active?(user_id)
        user_id.present? && User.find_by(id: user_id)&.active? == true
      end

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
