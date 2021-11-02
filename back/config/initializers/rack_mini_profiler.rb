if Rack.const_defined? 'MiniProfiler'
  Rack::MiniProfiler.config.max_traces_to_show = 100
end
