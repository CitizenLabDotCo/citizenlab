# frozen_string_literal: true

class ClaimTokenService
  class << self
    # Generate a claim token for an item that has no author.
    # @param item [ClaimableParticipation] the item to generate a token for
    # @return [ClaimToken, nil] the created token, or nil if item has an author
    def generate(item)
      return nil if item_has_owner?(item)

      ClaimToken.find_or_create_by!(item: item)
    end

    # Mark claim tokens for a user. Sets `pending_claimer_id` so tokens can be claimed
    # after email confirmation.
    # @param user [User, String] the user to mark tokens for
    # @param tokens [Array<String>] array of token strings
    # @return [ClaimToken::ActiveRecord_Relation] tokens that were successfully marked
    def mark(user, tokens)
      return ClaimToken.none if tokens.blank?

      user_id = user.is_a?(User) ? user.id : user

      ClaimToken
        .not_expired
        .where(token: tokens)
        .update_all(pending_claimer_id: user_id)

      ClaimToken.where(token: tokens, pending_claimer_id: user_id)
    end

    # Complete all pending claims for a user.
    # Transfers ownership and destroys the claim tokens.
    # @param user [User] the user whose pending claims to complete
    # @return [Array<ClaimableParticipation>] items that were claimed
    def complete(user)
      user.claim_tokens.map { |claim_token| claim_item(claim_token) }
    end

    # Claim items for a user. Only marks tokens if the user requires confirmation.
    # Effectively claims items if the user does not require confirmation.
    # @param user [User] the user to claim items for
    # @param tokens [Array<String>] array of token strings
    # @return [Array<ClaimableParticipation>, nil] claimed items, or nil if pending confirmation
    def claim(user, tokens)
      mark(user, tokens)
      complete(user) unless user.confirmation_required?
    end

    # Delete all expired tokens.
    # @return [Integer] number of tokens deleted
    def cleanup_expired
      ClaimToken.expired.delete_all
    end

    private

    def item_has_owner?(item)
      # Currently, we only support ideas.
      !!item.author_id
    end

    def claim_item(claim_token)
      item = claim_token.item
      user = claim_token.pending_claimer
      owner_attr = item.respond_to?(:author_id=) ? :author_id : :user_id

      ClaimToken.transaction do
        # NOTE: The AnonymousParticipation concern will automatically set
        # anonymous = false and recalculate author_hash via before_validation
        item.update!(owner_attr => user.id)
        LogActivityJob.perform_later(item, 'claimed', user, Time.current.to_i)
        claim_token.destroy!
      end

      item
    end
  end
end
