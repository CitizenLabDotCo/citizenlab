class AddSearchIndexToPosts < ActiveRecord::Migration[6.0]

  # Based on https://github.com/Casecommons/pg_search/wiki/Building-indexes
  def change
    add_index :ideas, %[(to_tsvector('simple', coalesce("title_multiloc"::text, '')) || to_tsvector('simple', coalesce("body_multiloc"::text, '')))], using: :gin, name: "index_ideas_search"
    add_index :initiatives, %[(to_tsvector('simple', coalesce("title_multiloc"::text, '')) || to_tsvector('simple', coalesce("body_multiloc"::text, '')))], using: :gin, name: "index_initiatives_search"
  end


end
