class AddSentimentToIdeas < ActiveRecord::Migration[6.1]
  def change
    add_column :ideas, :sentiment, :string
    add_column :ideas, :sentiment_score, :float, default:nil
  end
end
