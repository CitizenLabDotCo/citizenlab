# frozen_string_literal: true

require 'custom_id_methods/engine'

# `savon` is used by the COW and ID-card-lookup verification methods. It is
# required here so `Savon` (and `Savon::SpecHelper`) are fully loaded.
require 'savon'

module CustomIdMethods
end
