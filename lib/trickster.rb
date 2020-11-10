# frozen_string_literal: true

#
# An idiomatic way of importing multiple modules at once.
#
# ==== Usage
#
#     include Trickster
#
#     tricks AModule, AnotherModule, ...
#
module Trickster
  def tricks(*mixins)
    mixins.each do |mixin|
      class_eval do |base|
        base.include mixin
      end
    end
  end
end
