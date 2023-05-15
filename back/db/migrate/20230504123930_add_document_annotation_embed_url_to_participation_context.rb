# frozen_string_literal: true

class AddDocumentAnnotationEmbedUrlToParticipationContext < ActiveRecord::Migration[6.1]
  def change
    add_column :phases, :document_annotation_embed_url, :string, default: nil, null: true
    add_column :projects, :document_annotation_embed_url, :string, default: nil, null: true
  end
end
