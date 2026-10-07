# frozen_string_literal: true

class AddAIGenerationSummaryToProjects < ActiveRecord::Migration[7.1]
  def change
    # Plain-language "here's what I drafted and why" the project assistant shows
    # back in the dock after a generation. Manager-facing copy only (no internal
    # archetype / lever / rubric terms); shape: { "what" => ..., "why" => ... }.
    add_column :projects, :ai_generation_summary, :jsonb
  end
end
