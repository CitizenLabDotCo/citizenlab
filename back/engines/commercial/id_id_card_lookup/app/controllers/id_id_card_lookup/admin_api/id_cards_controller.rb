# frozen_string_literal: true

# The bulk_replace method is invoked by cl2-admin/lib/admin_api.rb#verification_id_cards_replace_all
# and it seems we need to require CSV.
require 'csv'

module IdIdCardLookup
  module AdminApi
    class IdCardsController < ::AdminApi::AdminApiController
      def bulk_replace
        file = params[:id_cards][:file]
        parts = file.match(%r{\Adata:([-\w]+/[-\w+.]+)?;base64,(.*)}m) || []
        if parts[2].present?
          IdCard.delete_all
          CSV.parse(Base64.decode64(parts[2])).each_slice(500) do |rows|
            card_ids = rows.pluck(0)
            LoadIdCardsJob.perform_later(card_ids)
          end
          head :created
        else
          head :unprocessable_entity
        end
      end

      def count
        render json: { count: IdCard.count }
      end
    end
  end
end
