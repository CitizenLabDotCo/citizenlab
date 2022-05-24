# frozen_string_literal: true

class StaticPageFileUploader < BaseFileUploader
  def size_range
    (1.byte)..(50.megabytes)
  end
end
