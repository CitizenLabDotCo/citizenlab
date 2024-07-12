# https://blog.saeloun.com/2019/09/11/rails-6-custom-serializers-for-activejob-arguments/
# https://api.rubyonrails.org/classes/ActiveJob/Serializers/ObjectSerializer.html
class SphericalPointImplActiveJobSerializer < ActiveJob::Serializers::ObjectSerializer
  def serialize(point)
    super(
      'x' => point.x,
      'y' => point.y
    )
  end

  def deserialize(hash)
    RGeo::Geographic.spherical_factory(srid: 4326).point(hash['x'], hash['y'])
  end

  private

  def klass
    RGeo::Geographic::SphericalPointImpl
  end
end
