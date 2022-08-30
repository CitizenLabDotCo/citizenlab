# frozen_string_literal: true

# https://github.com/Casecommons/pg_search/issues/252#issuecomment-840959889
module PgSearchPatch
  def initialize(column_name, weight, model)
    super

    # Re-set this field if it is a SqlLiteral (super sets it with .to_s)
    @column_name = column_name if column_name.is_a?(Arel::Nodes::SqlLiteral)
  end

  def full_name
    if @column_name.is_a?(Arel::Nodes::SqlLiteral)
      @column_name
    else
      super
    end
  end
end

PgSearch::Configuration::Column.prepend PgSearchPatch
