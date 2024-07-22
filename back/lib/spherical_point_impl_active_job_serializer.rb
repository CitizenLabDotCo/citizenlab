# https://blog.saeloun.com/2019/09/11/rails-6-custom-serializers-for-activejob-arguments/
# https://api.rubyonrails.org/classes/ActiveJob/Serializers/ObjectSerializer.html
class SphericalPointImplActiveJobSerializer < ActiveJob::Serializers::ObjectSerializer
  def serialize(point)
    hash = {
      'x' => point.x,
      'y' => point.y
    }
    hash['z'] = point.z if point.z
    hash['m'] = point.m if point.m

    super(hash)
  end

  def deserialize(hash)
    factory = RGeo::Geographic.spherical_factory(srid: 4326, has_z_coordinate: !!hash['z'], has_m_coordinate: !!hash['m'])
    attrs = [hash['x'], hash['y']]
    attrs << hash['z'] if hash['z']
    attrs << hash['m'] if hash['m']

    factory.point(*attrs)
  end

  private

  def klass
    RGeo::Geographic::SphericalPointImpl
  end
end
