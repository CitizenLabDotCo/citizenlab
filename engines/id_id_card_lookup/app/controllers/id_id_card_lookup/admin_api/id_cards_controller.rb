module IdIdCardLookup
  module AdminApi
    class IdCardsController < ::AdminApi::AdminApiController

      def bulk_replace
        file = params[:id_cards][:file]
        parts = file.match(/\Adata:([-\w]+\/[-\w\+\.]+)?;base64,(.*)/m) || []
        if parts[2].present?
          IdCard.delete_all
          CSV.parse(Base64.decode64(parts[2])).each_slice(500) do |rows|
            card_ids = rows.map{|r| r[0]}
            LoadIdCardsJob.perform_later(card_ids)
          end
          head 201
        else
          head 422
        end
      end

      def count
        render json: {count: IdCard.count}
      end

    end
  end
end
