require 'rubocop'

# NOTE: We deliberately do NOT `require 'rubocop/rspec/support'`. That file runs
# an `RSpec.configure` block that does a *global* `config.include CopHelper`
# (and others), which leaks CopHelper#configuration -> RuboCop::Config into every
# example group in the process. Depending on spec-file load order that shadows
# unrelated specs' own `let(:configuration)` and breaks them (only on CI, where
# files share a process). Instead we require the helper files directly (no global
# side effects) and include everything scoped to `:config`-tagged cop specs.
require 'rubocop/rspec/cop_helper'
require 'rubocop/rspec/expect_offense'
require 'rubocop/rspec/shared_contexts'

RSpec.configure do |config|
  config.include CopHelper, :config
  config.include RuboCop::RSpec::ExpectOffense, :config
  config.include_context 'config', :config
end
