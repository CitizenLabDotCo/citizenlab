# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Craftjs::MultilocsInVisualOrder do
  subject(:service) { described_class.new(json) }

  let(:json) do
    {
      'ROOT' => {
        'type' => 'div',
        'nodes' => %w[Jq-CCgrq-q 0f2iV4vLcr cOTUZaRUhq M-lM_fn2Ha zr3oCwVDIz aA5GjRj3I_ OqxV6yxJHh JwYVABZlsM'],
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'custom' => {},
        'hidden' => false,
        'isCanvas' => true,
        'displayName' => 'div',
        'linkedNodes' => {}
      },
      '-7Lp-VhE2t' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsA: Para 1 col 1</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'oGp7hWFKl4',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      '-DBh5Ia0lE' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['OWm2InOHHQ'],
        'props' => { 'id' => 'right' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'Bbml_6eeWj',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      '-lgdbhS-wA' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['DkA1k-pPgk'],
        'props' => { 'id' => 'right' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'KGOG3VlnS9',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      '0cVEJ3cBcj' => {
        'type' => { 'resolvedName' => 'WhiteSpace' },
        'nodes' => [],
        'props' => { 'size' => 'small' },
        'custom' => { 'title' => { 'id' => 'app.containers.AdminPage.ProjectDescription.whiteSpace', 'defaultMessage' => 'White space' } },
        'hidden' => false,
        'parent' => 'rtu-ubxCSV',
        'isCanvas' => false,
        'displayName' => 'WhiteSpace',
        'linkedNodes' => {}
      },
      '0f2iV4vLcr' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => [],
        'props' => { 'columnLayout' => '1-1' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => { 'left' => 'oGp7hWFKl4', 'right' => 'TIszj7Nd0b' }
      },
      '4l45_2ONGK' => {
        'type' => { 'resolvedName' => 'ImageMultiloc' },
        'nodes' => [],
        'props' => { 'image' => { 'dataCode' => 'a9d46e47-a2b3-47b9-8e72-400eef6268f2' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.imageMultiloc', 'defaultMessage' => 'Image' } },
        'hidden' => false,
        'parent' => 'cHD5Vn8wxf',
        'isCanvas' => false,
        'displayName' => 'Image',
        'linkedNodes' => {}
      },
      '5YdWetHeNh' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-BE' => '<p>2colsA: Para 2 col 1</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'oGp7hWFKl4',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      '6YZn3Vhww7' => {
        'type' => { 'resolvedName' => 'ImageMultiloc' },
        'nodes' => [],
        'props' => { 'image' => { 'dataCode' => '10e308cd-b1f6-4f2a-9fb9-ec2dead976de' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.imageMultiloc', 'defaultMessage' => 'Image' } },
        'hidden' => false,
        'parent' => 'haW3VhFvzZ',
        'isCanvas' => false,
        'displayName' => 'Image',
        'linkedNodes' => {}
      },
      '6ztK3BmFwJ' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsA: Para 1a col 1 (inserted)</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'oGp7hWFKl4',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      '8Z8cOz8Zcu' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[ZML33UcYWO y_gYPg36HG HkhSdTtxNM],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'aA5GjRj3I_',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      '8ikVyrfYqS' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>3colsA: Para 1 col 1</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'khV_r3t1EY',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      '9nvUTg8LIS' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>3colsA: Para 1 col 3</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'aVze-6sy-t',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'Ahu2f_ti7Y' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsC: Para 1 col1 </p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'l_V1yAzOSh',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'B9aFpMhAS0' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[Fvyx3EQkKU Z_Mpi5aWlp],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'cOTUZaRUhq',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'Bbml_6eeWj' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => ['sgAa5OKvZm', '-DBh5Ia0lE'],
        'props' => { 'columnLayout' => '2-1' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'gX7qsPUb4L',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      },
      'Bwdu83IsPA' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => %w[ZTxuYbWgsx EGTUkRENuR],
        'props' => { 'columnLayout' => '2-1' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'gX7qsPUb4L',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      },
      'C4YOmQhBbQ' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['m76mN1NuaF'],
        'props' => { 'id' => 'right' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'eeO27iQPm-',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'CvabfA4J03' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['EhHyH4R-8Q'],
        'props' => { 'id' => 'left' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'KGOG3VlnS9',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'CxY-HtpwOt' => {
        'type' => { 'resolvedName' => 'WhiteSpace' },
        'nodes' => [],
        'props' => { 'size' => 'small' },
        'custom' => { 'title' => { 'id' => 'app.containers.AdminPage.ProjectDescription.whiteSpace', 'defaultMessage' => 'White space' } },
        'hidden' => false,
        'parent' => 'gX7qsPUb4L',
        'isCanvas' => false,
        'displayName' => 'WhiteSpace',
        'linkedNodes' => {}
      },
      'D5q8flk-be' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianD text</p>' }, 'title' => { 'en' => 'accordianD title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => 'ZTxuYbWgsx',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      },
      'DkA1k-pPgk' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>imageAndTextC text</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => '-lgdbhS-wA',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'EGTUkRENuR' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => [],
        'props' => { 'id' => 'right' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'Bwdu83IsPA',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'Ec22fjwJ6S' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>infoAndAccordians text</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'sgAa5OKvZm',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'EhHyH4R-8Q' => {
        'type' => { 'resolvedName' => 'ImageMultiloc' },
        'nodes' => [],
        'props' => { 'image' => { 'dataCode' => '6d1b8bfe-ed00-4c83-bd0f-ef9dab97632b' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.imageMultiloc', 'defaultMessage' => 'Image' } },
        'hidden' => false,
        'parent' => 'CvabfA4J03',
        'isCanvas' => false,
        'displayName' => 'Image',
        'linkedNodes' => {}
      },
      'FjlHjNGKGW' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianF text</p>' }, 'title' => { 'en' => 'accordianF title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => 'ZTxuYbWgsx',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      },
      'Fvyx3EQkKU' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>3colsA: Para 1 col 2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'B9aFpMhAS0',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'HkhSdTtxNM' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianC text</p>' }, 'title' => { 'en' => 'accordianC title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => '8Z8cOz8Zcu',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      },
      'I93FNshdvY' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>imageAndTextB text</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'WJzj70JVmn',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'Jq-CCgrq-q' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<h2>Title 1</h2>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'JwYVABZlsM' => {
        'type' => { 'resolvedName' => 'ImageTextCards' },
        'nodes' => [],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'ImageTextCards',
        'linkedNodes' => { 'image-text-cards' => 'rtu-ubxCSV' }
      },
      'KGOG3VlnS9' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => ['CvabfA4J03', '-lgdbhS-wA'],
        'props' => { 'columnLayout' => '1-2' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'rtu-ubxCSV',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      },
      'M-lM_fn2Ha' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<h2>Title 2</h2>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'MZVcetPJ0b' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsC: Para 1 col2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'zR5q5gXVRR',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'OWm2InOHHQ' => {
        'type' => { 'resolvedName' => 'AboutBox' },
        'nodes' => [],
        'props' => { 'hideParticipationAvatars' => false },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.participationBox', 'defaultMessage' => 'Participation Box' }, 'noPointerEvents' => true },
        'hidden' => false,
        'parent' => '-DBh5Ia0lE',
        'isCanvas' => false,
        'displayName' => 'AboutBox',
        'linkedNodes' => {}
      },
      'OqxV6yxJHh' => {
        'type' => { 'resolvedName' => 'InfoWithAccordions' },
        'nodes' => [],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'InfoWithAccordions',
        'linkedNodes' => { 'info-with-accordions' => 'gX7qsPUb4L' }
      },
      'QaTbTFCSpg' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianE text</p>' }, 'title' => { 'en' => 'accordianE title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => 'ZTxuYbWgsx',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      },
      'TCGNh7rNT6' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => %w[haW3VhFvzZ WJzj70JVmn],
        'props' => { 'columnLayout' => '1-2' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'rtu-ubxCSV',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      },
      'TIszj7Nd0b' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['gB5XxeaLup'],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => '0f2iV4vLcr',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'WJzj70JVmn' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['I93FNshdvY'],
        'props' => { 'id' => 'right' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'TCGNh7rNT6',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'ZML33UcYWO' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsB: Para 1 col2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => '8Z8cOz8Zcu',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'ZTxuYbWgsx' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[D5q8flk-be QaTbTFCSpg FjlHjNGKGW],
        'props' => { 'id' => 'left' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'Bwdu83IsPA',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'Z_Mpi5aWlp' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>3colsA: Para 2 col 2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'B9aFpMhAS0',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'aA5GjRj3I_' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => [],
        'props' => { 'columnLayout' => '1-1' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => { 'left' => 'nE_FRJUK5n', 'right' => '8Z8cOz8Zcu' }
      },
      'aVze-6sy-t' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['9nvUTg8LIS'],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'cOTUZaRUhq',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'cHD5Vn8wxf' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['4l45_2ONGK'],
        'props' => { 'id' => 'left' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'eeO27iQPm-',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'cOTUZaRUhq' => {
        'type' => { 'resolvedName' => 'ThreeColumn' },
        'nodes' => [],
        'props' => {},
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.threeColumnLayout', 'defaultMessage' => '3 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'ThreeColumn',
        'linkedNodes' => { 'column1' => 'khV_r3t1EY', 'column2' => 'B9aFpMhAS0', 'column3' => 'aVze-6sy-t' }
      },
      'eeO27iQPm-' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => %w[cHD5Vn8wxf C4YOmQhBbQ],
        'props' => { 'columnLayout' => '1-2' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'rtu-ubxCSV',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => {}
      },
      'gB5XxeaLup' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsA: Para 1 col 2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'TIszj7Nd0b',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'gJPBf8x6Qm' => {
        'type' => { 'resolvedName' => 'WhiteSpace' },
        'nodes' => [],
        'props' => { 'size' => 'small' },
        'custom' => { 'title' => { 'id' => 'app.containers.AdminPage.ProjectDescription.whiteSpace', 'defaultMessage' => 'White space' } },
        'hidden' => false,
        'parent' => 'rtu-ubxCSV',
        'isCanvas' => false,
        'displayName' => 'WhiteSpace',
        'linkedNodes' => {}
      },
      'gX7qsPUb4L' => {
        'type' => { 'resolvedName' => 'Box' },
        'nodes' => %w[Bbml_6eeWj CxY-HtpwOt Bwdu83IsPA],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'OqxV6yxJHh',
        'isCanvas' => true,
        'displayName' => 'Box',
        'linkedNodes' => {}
      },
      'haW3VhFvzZ' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['6YZn3Vhww7'],
        'props' => { 'id' => 'left' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'TCGNh7rNT6',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'jLvX2Cd3Zr' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsC: Para 2 col1</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'l_V1yAzOSh',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'khV_r3t1EY' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['8ikVyrfYqS'],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'cOTUZaRUhq',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'l_V1yAzOSh' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[Ahu2f_ti7Y jLvX2Cd3Zr],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'tkjAV5kHJy',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'm76mN1NuaF' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>imageAndTextA text</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'C4YOmQhBbQ',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'nE_FRJUK5n' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[xo9x7NZoEk tkjAV5kHJy],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'aA5GjRj3I_',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'oGp7hWFKl4' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['-7Lp-VhE2t', '6ztK3BmFwJ', '5YdWetHeNh'],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => '0f2iV4vLcr',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'pp5g3dOiC-' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsC: Para 2 col2</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'zR5q5gXVRR',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'rtu-ubxCSV' => {
        'type' => { 'resolvedName' => 'Box' },
        'nodes' => %w[eeO27iQPm- 0cVEJ3cBcj TCGNh7rNT6 gJPBf8x6Qm KGOG3VlnS9],
        'props' => { 'style' => { 'margin' => '0 auto', 'padding' => '0px 0px', 'maxWidth' => '1200px' } },
        'custom' => {},
        'hidden' => false,
        'parent' => 'JwYVABZlsM',
        'isCanvas' => true,
        'displayName' => 'Box',
        'linkedNodes' => {}
      },
      'sgAa5OKvZm' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => ['Ec22fjwJ6S'],
        'props' => { 'id' => 'left' },
        'custom' => {},
        'hidden' => false,
        'parent' => 'Bbml_6eeWj',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'tkjAV5kHJy' => {
        'type' => { 'resolvedName' => 'TwoColumn' },
        'nodes' => [],
        'props' => { 'columnLayout' => '1-1' },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout', 'defaultMessage' => '2 column' }, 'hasChildren' => true },
        'hidden' => false,
        'parent' => 'nE_FRJUK5n',
        'isCanvas' => false,
        'displayName' => 'TwoColumn',
        'linkedNodes' => { 'left' => 'l_V1yAzOSh', 'right' => 'zR5q5gXVRR' }
      },
      'xo9x7NZoEk' => {
        'type' => { 'resolvedName' => 'TextMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>2colsB: Para 1 col1</p>' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.textMultiloc', 'defaultMessage' => 'Text' } },
        'hidden' => false,
        'parent' => 'nE_FRJUK5n',
        'isCanvas' => false,
        'displayName' => 'TextMultiloc',
        'linkedNodes' => {}
      },
      'y_gYPg36HG' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianB text</p>' }, 'title' => { 'en' => 'accordianB title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => '8Z8cOz8Zcu',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      },
      'zR5q5gXVRR' => {
        'type' => { 'resolvedName' => 'Container' },
        'nodes' => %w[MZVcetPJ0b pp5g3dOiC-],
        'props' => {},
        'custom' => {},
        'hidden' => false,
        'parent' => 'tkjAV5kHJy',
        'isCanvas' => true,
        'displayName' => 'Container',
        'linkedNodes' => {}
      },
      'zr3oCwVDIz' => {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'nodes' => [],
        'props' => { 'text' => { 'en' => '<p>accordianA text</p>' }, 'title' => { 'en' => 'accordianA title' } },
        'custom' => { 'title' => { 'id' => 'app.containers.admin.ContentBuilder.accordionMultiloc', 'defaultMessage' => 'Accordion' } },
        'hidden' => false,
        'parent' => 'ROOT',
        'isCanvas' => false,
        'displayName' => 'Accordion',
        'linkedNodes' => {}
      }
    }
  end

  describe '#multilocs_in_natural_order' do
    it 'returns the multilocs in natural order' do
      expect(service.extract).to eq(
        [
          { 'en' => '<h2>Title 1</h2>' },
          { 'en' => '<p>2colsA: Para 1 col 1</p>' },
          { 'en' => '<p>2colsA: Para 1a col 1 (inserted)</p>' },
          { 'en' => '<p>2colsA: Para 2 col 1</p>', 'nl-BE' => '<p>2colsA: Para 2 col 1</p>' },
          { 'en' => '<p>2colsA: Para 1 col 2</p>' },
          { 'en' => '<p>3colsA: Para 1 col 1</p>' },
          { 'en' => '<p>3colsA: Para 1 col 2</p>' },
          { 'en' => '<p>3colsA: Para 2 col 2</p>' },
          { 'en' => '<p>3colsA: Para 1 col 3</p>' },
          { 'en' => '<h2>Title 2</h2>' },
          { 'en' => 'accordianA title' },
          { 'en' => '<p>accordianA text</p>' },
          { 'en' => '<p>2colsB: Para 1 col1</p>' },
          { 'en' => '<p>2colsC: Para 1 col1 </p>' },
          { 'en' => '<p>2colsC: Para 2 col1</p>' },
          { 'en' => '<p>2colsC: Para 1 col2</p>' },
          { 'en' => '<p>2colsC: Para 2 col2</p>' },
          { 'en' => '<p>2colsB: Para 1 col2</p>' },
          { 'en' => 'accordianB title' },
          { 'en' => '<p>accordianB text</p>' },
          { 'en' => 'accordianC title' },
          { 'en' => '<p>accordianC text</p>' },
          { 'en' => '<p>infoAndAccordians text</p>' },
          { 'en' => 'accordianD title' },
          { 'en' => '<p>accordianD text</p>' },
          { 'en' => 'accordianE title' },
          { 'en' => '<p>accordianE text</p>' },
          { 'en' => 'accordianF title' },
          { 'en' => '<p>accordianF text</p>' },
          { 'en' => '<p>imageAndTextA text</p>' },
          { 'en' => '<p>imageAndTextB text</p>' },
          { 'en' => '<p>imageAndTextC text</p>' }
        ]
      )
    end
  end
end
