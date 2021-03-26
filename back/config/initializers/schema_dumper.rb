# Fix from:
# https://github.com/thoughtbot/scenic/issues/134
#
# Otherwise, these shared_extensions views are undesirably 
# added to schema.rb, causing db:schema:load to fail.

ActiveRecord::SchemaDumper.ignore_tables += ["shared_extensions.geography_columns","shared_extensions.geometry_columns","shared_extensions.raster_columns","shared_extensions.raster_overviews"]