class AddSentimentToComments < ActiveRecord::Migration[6.1]
  def change
    add_column :comments, :sentiment, :string
    add_column :comments, :sentiment_score, :float, default:nil
  end
end
