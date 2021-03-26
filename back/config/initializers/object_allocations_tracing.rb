
require_rbstrace = ENV.fetch('REQUIRE_RBTRACE', nil)
enable_object_allocation_tracing = ENV.fetch('ENABLE_OBJECT_ALLOCATION_TRACING', nil)

if require_rbstrace
  require "rbtrace"
end

if enable_object_allocation_tracing
  require "rbtrace"
  require "objspace"
  ObjectSpace.trace_object_allocations_start
end