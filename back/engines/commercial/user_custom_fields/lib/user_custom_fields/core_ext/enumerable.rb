# frozen_string_literal: true

module Enumerable
  # From https://stackoverflow.com/a/8016041
  def sorted?
    each_cons(2).all? { |a, b| (a <=> b) <= 0 }
  end
end
