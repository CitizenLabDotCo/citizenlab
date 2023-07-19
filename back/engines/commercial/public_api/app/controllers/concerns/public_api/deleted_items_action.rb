# frozen_string_literal: true

module PublicApi
  module DeletedItemsAction
    def deleted
      deleted_items = Activity.where(
        item_type: controller_name.classify,
        action: 'deleted',
      )

      list_items(deleted_items, V2::DeletedItemSerializer, root_key: :deleted_items)
    end
  end
end
