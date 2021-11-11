class AreasFilteringService
  include Filterer

  add_filter('only_selected') do |scope, options|
    next scope unless ['true', true, '1'].include? options[:only_selected]

    scope # No-op
  end
end