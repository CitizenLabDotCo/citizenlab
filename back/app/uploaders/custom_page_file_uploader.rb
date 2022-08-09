# frozen_string_literal: true

class CustomPageFileUploader < BaseFileUploader
  def size_range
    (1.byte)..(50.megabytes)
  end
end
