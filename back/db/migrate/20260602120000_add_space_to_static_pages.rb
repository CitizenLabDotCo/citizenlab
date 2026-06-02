class AddSpaceToStaticPages < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_reference :static_pages, :space, type: :uuid, foreign_key: true, index: true
    end
  end
end
