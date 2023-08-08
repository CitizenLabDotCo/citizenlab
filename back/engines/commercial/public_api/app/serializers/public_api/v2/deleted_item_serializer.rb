# frozen_string_literal: true

class PublicApi::V2::DeletedItemSerializer < PublicApi::V2::BaseSerializer
  attribute :item_id, key: :id
  attribute :item_type, key: :type
  attribute :acted_at, key: :deleted_at
end
