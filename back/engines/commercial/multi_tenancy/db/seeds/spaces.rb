require_relative 'base'

module MultiTenancy
  module Seeds
    class Spaces < Base
      def run
        2.times do |i|
          ::Space.create!(
            title_multiloc: { 'en' => "Space#{i + 1}" },
            description_multiloc: runner.rand_description_multiloc
          )
        end
      end
    end
  end
end
