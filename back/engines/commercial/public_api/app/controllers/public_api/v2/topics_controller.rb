# frozen_string_literal: true

module PublicApi
  # Deprecated controller that merges GlobalTopic and InputTopic data.
  # Use GlobalTopicsController or InputTopicsController instead.
  class V2::TopicsController < PublicApiController
    def index
      # Merge records from both GlobalTopic and InputTopic, ordered by created_at desc
      # We can't use list_items because we're merging two models
      global_topics = GlobalTopic.all
      input_topics = InputTopic.all

      # Apply date filters to both
      global_topics = apply_date_filters(global_topics)
      input_topics = apply_date_filters(input_topics)

      # Combine all records and sort by created_at desc
      all_topics = fetch_and_combine(global_topics, input_topics)

      # Apply pagination
      paginated_topics = Kaminari.paginate_array(all_topics)
        .page(params[:page_number])
        .per(num_per_page)

      render json: paginated_topics,
        each_serializer: V2::TopicSerializer,
        adapter: :json,
        meta: meta_properties(paginated_topics)
    end

    def show
      # Try to find in GlobalTopic first, then InputTopic
      topic = GlobalTopic.find_by(id: params[:id]) || InputTopic.find(params[:id])
      show_item topic, V2::TopicSerializer
    end

    def deleted
      # Combine deleted items from both GlobalTopic and Topic (for backwards compat)
      deleted_items = Activity.where(
        item_type: %w[GlobalTopic InputTopic Topic],
        action: 'deleted'
      )

      if params[:deleted_at]
        deleted_items = deleted_items.where(date_filter_where_clause('acted_at', params[:deleted_at]))
      end

      list_items(deleted_items, V2::DeletedItemSerializer, root_key: :deleted_items)
    end

    private

    def apply_date_filters(scope)
      scope = apply_single_date_filter(scope, 'created_at', params[:created_at]) if params[:created_at]
      scope = apply_single_date_filter(scope, 'updated_at', params[:updated_at]) if params[:updated_at]
      scope
    end

    def apply_single_date_filter(scope, column, filter_value)
      scope.where(date_filter_where_clause(column, filter_value))
    end

    def fetch_and_combine(global_topics, input_topics)
      # Fetch all records and combine them, sorted by created_at desc
      all_records = global_topics.to_a + input_topics.to_a
      all_records.sort_by { |record| -record.created_at.to_i }
    end
  end
end
