export type DeviceTypesResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      counts_per_device_type: Record<
        'mobile' | 'tablet' | 'desktop_or_other',
        number
      >;
    };
  };
};
