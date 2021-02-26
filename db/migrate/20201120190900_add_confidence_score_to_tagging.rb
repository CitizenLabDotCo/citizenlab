class AddConfidenceScoreToTagging < ActiveRecord::Migration[6.0]
  def change
    add_column :tagging_taggings, :confidence_score, :float, default: nil
  end
end
