class LayerSerializer
  include FastJsonapi::ObjectSerializer

  attributes :title_multiloc, :geojson, :default_enabled, :marker_svg_url, :ordering, :id
end
