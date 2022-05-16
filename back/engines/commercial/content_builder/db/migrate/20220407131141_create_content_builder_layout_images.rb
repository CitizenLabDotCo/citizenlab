# frozen_string_literal: true

class CreateContentBuilderLayoutImages < ActiveRecord::Migration[6.1]
  def change
    create_table :content_builder_layout_images, id: :uuid do |t|
      t.string :image
      t.string :code

      t.timestamps
    end
  end
end
