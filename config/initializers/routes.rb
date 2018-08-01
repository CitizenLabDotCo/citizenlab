# After https://stackoverflow.com/a/50703034/3585671
# 
# MONKEY PATCH!!!
# https://github.com/rails/rails/pull/32296
#
# Fixes:
# * Development mode deadlocks
# * ArgumentError: unknown firstpos: NilClass (upon hot reloading)
#
# Allows use of "config.eager_load = true"


module ActionDispatch
  module Journey
    class Routes
      def simulator
        @simulator ||= begin
          gtg = GTG::Builder.new(ast).transition_table unless ast.blank?
          GTG::Simulator.new(gtg)
        end
      end
    end
  end
end