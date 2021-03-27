class AddOrderingToTopics < ActiveRecord::Migration[5.1]
  def change
    add_column :topics, :ordering, :integer

    Topic.order(created_at: :desc).each.with_index do |topic, index|
      topic.update_column :ordering, index
    end
  end
end