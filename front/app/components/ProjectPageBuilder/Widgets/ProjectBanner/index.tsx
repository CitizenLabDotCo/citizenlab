import React, { useState, useEffect, useRef } from 'react';

import { Box, Label, IconTooltip } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { Multiloc, UploadFile } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { IMAGE_UPLOADING_EVENT } from 'components/admin/ContentBuilder/constants';
import imageMessages from 'components/admin/ContentBuilder/Widgets/ImageMultiloc/messages';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';
import { BannerImageDraft } from 'components/ProjectPageBuilder/projectAttributeDrafts';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { usePermission } from 'utils/permissions';

import LockedNote from '../LockedNote';
import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyBanner from './EmptyBanner';

type Props = {
  image?: BannerImageDraft;
  alt?: Multiloc;
};

const ProjectBanner: UserComponent<Props> = ({ image, alt }) => {
  const projectId = useWidgetProjectId();
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const canModerate = usePermission({
    item: project?.data ?? null,
    action: 'moderate',
  });

  if (!project) {
    return null;
  }

  const imageUrl =
    image?.imageUrl ||
    (image?.removed ? undefined : project.data.attributes.header_bg.large);
  const altText =
    (alt && localize(alt)) ||
    localize(project.data.attributes.header_bg_alt_text_multiloc);

  if (!imageUrl) {
    return canModerate ? <EmptyBanner /> : null;
  }

  return (
    <Box id="e2e-project-page-banner" mb="24px">
      <HeaderImageContainer>
        <HeaderImage
          src={imageUrl}
          cover
          fadeIn={false}
          isLazy={false}
          placeholderBg="transparent"
          alt={altText}
        />
      </HeaderImageContainer>
    </Box>
  );
};

const ProjectBannerSettings = () => {
  const { formatMessage } = useIntl();
  const projectId = useWidgetProjectId();
  const { data: project } = useProjectById(projectId);
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const {
    actions: { setProp },
    image,
    alt,
  } = useNode((node) => ({
    image: node.data.props.image as BannerImageDraft | undefined,
    alt: node.data.props.alt as Multiloc | undefined,
  }));
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    const initialUrl =
      image?.imageUrl ||
      (image?.removed ? undefined : project?.data.attributes.header_bg.large);
    if (!image?.imageUrl && !project) return; // wait until the source is known
    seeded.current = true;
    if (initialUrl) {
      convertUrlToUploadFile(initialUrl).then(
        (file) => file && setImageFiles([file])
      );
    }
  }, [image?.imageUrl, image?.removed, project]);

  const handleAdd = async (files: UploadFile[]) => {
    const previousFiles = imageFiles;
    setImageFiles(files);
    eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);
    try {
      const response = await addContentBuilderImage(files[0].base64);
      setProp((props: Props) => {
        props.image = {
          dataCode: response.data.attributes.code,
          imageUrl: response.data.attributes.image_url,
        };
      });
    } catch {
      setImageFiles(previousFiles);
    } finally {
      eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
    }
  };

  const handleRemove = () => {
    setImageFiles([]);
    setProp((props: Props) => {
      props.image = { removed: true };
    });
  };

  const handleAltChange = (value: Multiloc) => {
    setProp((props: Props) => {
      props.alt = value;
    });
  };

  const altValue =
    alt && Object.keys(alt).length > 0
      ? alt
      : project?.data.attributes.header_bg_alt_text_multiloc;

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <ImagesDropzone
        images={imageFiles}
        imagePreviewRatio={1 / 2}
        maxImagePreviewWidth="360px"
        objectFit="contain"
        acceptedFileTypes={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <Box>
        <Label>
          {formatMessage(imageMessages.imageMultilocAltTextLabel)}
          <IconTooltip
            content={formatMessage(imageMessages.imageMultilocAltTextTooltip)}
          />
        </Label>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={altValue}
          onChange={handleAltChange}
        />
      </Box>
      <LockedNote message={messages.lockedHeaderNote} />
    </Box>
  );
};

ProjectBanner.craft = {
  props: {
    image: {},
    alt: {},
  },
  related: {
    settings: ProjectBannerSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.bannerWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

export default ProjectBanner;
