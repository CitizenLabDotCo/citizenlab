# https://github.com/rails/rails/blob/main/railties/lib/rails/generators/rails/plugin/plugin_generator.rb
module CitizenLab
  module Generators
    module Plugin
      module GeneratorPatch
        # The intention is to change `rails plugin new` to add things we always use, and remove things we don't.
        # 1. Make it add a feature_specification file
        # 2. Make engines include the `include CitizenLab::Engine` module extension.
        # 3. Remove test folder and an empty spec folder
        # 4. Remove the MIT license, and (maybe) automatically run license finder
        # 5. Remove unused
      end
    end
  end
end
