class AddCodeToTopics < ActiveRecord::Migration[6.0]
  def change
    # All existing topics will receive the "custom" code.
    # A separate script needs to be executed to set the
    # correct code for existing topics.
    add_column :topics, :code, :string, null: false, index: true, default: 'custom'
  end
end
