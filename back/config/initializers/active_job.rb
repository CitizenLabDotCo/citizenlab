require Rails.root.join('lib/spherical_point_impl_active_job_serializer')

Rails.application.config.active_job.custom_serializers << SphericalPointImplActiveJobSerializer
