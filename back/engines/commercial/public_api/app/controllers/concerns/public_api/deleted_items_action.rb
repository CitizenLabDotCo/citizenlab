# frozen_string_literal: true

module PublicApi
  module DeletedItemsAction
    def deleted
      deleted_items = Activity.where(
        item_type: controller_name.classify,
        action: 'deleted'
      )

      if params[:deleted_at]
        deleted_items = deleted_items.where(date_filter_where_clause('acted_at', params[:deleted_at]))
      end

      list_items(deleted_items, V2::DeletedItemSerializer, root_key: :deleted_items)
    end
  end
end
