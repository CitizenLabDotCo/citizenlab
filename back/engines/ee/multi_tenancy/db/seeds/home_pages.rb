# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class HomePages < Base
      def run
        # Since we add a default home_pages record from the base template,
        # we simply update that record to add a header image to the homepage.
        HomePage.first.update!({
          header_bg: Rails.root.join('spec/fixtures/header.jpg').open
        })
      end
    end
  end
end
