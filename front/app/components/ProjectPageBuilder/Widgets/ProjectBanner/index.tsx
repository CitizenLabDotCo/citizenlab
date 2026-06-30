import React, { useState, useEffect, useRef } from 'react';

import { Box, Label, IconTooltip } from '@citizenlab/cl2-component-library';
import { UserComponent, useNode } from '@craftjs/core';
import { Multiloc, UploadFile } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import imageMessages from 'components/admin/ContentBuilder/Widgets/ImageMultiloc/messages';
import {
  HeaderImage,
  HeaderImageContainer,
} from 'components/ProjectableHeader';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import LockedHeaderNote from '../LockedHeaderNote';
import messages from '../messages';
import useCanModerateProject from '../useCanModerateProject';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyBanner from './EmptyBanner';

type ImageValue = {
  dataCode?: string;
  imageUrl?: string;
};

type Props = {
  image?: ImageValue;
  alt?: Multiloc;
};

// Locked "Project image" widget. Cannot be moved or deleted. Renders the
// project's header image by default; admins can override it per page by
// uploading a different image (same picker as the content Image widget).
const ProjectBanner: UserComponent<Props> = ({ image, alt }) => {
  const projectId = useWidgetProjectId();
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const canModerate = useCanModerateProject(projectId);

  if (!project) {
    return null;
  }

  const imageUrl = image?.imageUrl || project.data.attributes.header_bg.large;
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

// Mirrors the content Image widget's settings (dropzone + alt text), but seeds
// the dropzone with the project's current header image when there is no override,
// so admins see and can replace the image that is actually showing.
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
    image: node.data.props.image as ImageValue | undefined,
    alt: node.data.props.alt as Multiloc | undefined,
  }));
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);

  // Seed the dropzone once with the image currently showing (override, else the
  // project image), then let add/remove drive it. Seeding only once is what lets
  // "remove" actually empty the dropzone instead of immediately re-showing the
  // project image.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    const initialUrl =
      image?.imageUrl || project?.data.attributes.header_bg.large;
    if (!image?.imageUrl && !project) return; // wait until the source is known
    seeded.current = true;
    if (initialUrl) {
      convertUrlToUploadFile(initialUrl).then(
        (file) => file && setImageFiles([file])
      );
    }
  }, [image?.imageUrl, project]);

  const handleAdd = async (files: UploadFile[]) => {
    setImageFiles(files);
    try {
      const response = await addContentBuilderImage(files[0].base64);
      setProp((props: Props) => {
        props.image = {
          dataCode: response.data.attributes.code,
          imageUrl: response.data.attributes.image_url,
        };
      });
    } catch {
      // Ignore upload failures; the dropzone keeps the previous image.
    }
  };

  // Empties the dropzone and clears the per-page override; the banner falls back
  // to the project image until a new one is uploaded.
  const handleRemove = () => {
    setImageFiles([]);
    setProp((props: Props) => {
      props.image = {};
    });
  };

  const handleAltChange = (value: Multiloc) => {
    setProp((props: Props) => {
      props.alt = value;
    });
  };

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
          valueMultiloc={alt}
          onChange={handleAltChange}
        />
      </Box>
      <LockedHeaderNote />
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
