# frozen_string_literal: true

# required for db:schema:load
unless defined?(Tenant)
  class Tenant < ApplicationRecord; end
end
