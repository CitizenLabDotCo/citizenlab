import React, { useEffect, useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { parse } from 'qs';
import { useLocation } from 'react-router-dom';
import { ILocationInfo } from 'typings';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import PageLayout from 'components/InitiativeForm/PageLayout';
import PageNotFound from 'components/PageNotFound';
import GoBackButton from 'components/UI/GoBackButton';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { reverseGeocode } from 'utils/locationTools';

import InitiativesNewFormWrapper from './InitiativesNewFormWrapper';
import InitiativesNewMeta from './InitiativesNewMeta';

const InitiativesNewPage = () => {
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const location = useLocation();
  const [locationInfo, setLocationInfo] = useState<ILocationInfo | null>(null);

  useEffect(() => {
    if (authUser === null) {
      clHistory.replace('/');
    }
  }, [authUser]);

  useEffect(() => {
    const { lat, lng } = parse(location.search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    });

    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNilOrError(locale)
    ) {
      // When an idea is posted through the map, we Google Maps gets an approximate address,
      // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
      // and doesn't readjust together with the address correction/approximation
      reverseGeocode(lat, lng, locale).then((address) => {
        setLocationInfo({
          location_description: address,
          location_point_geojson: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      });
    } else {
      setLocationInfo(null);
    }
  }, [location, locale]);

  if (!authUser) return null;

  return (
    <>
      <InitiativesNewMeta />
      <Box background={colors.background} p="32px" pb="0">
        <GoBackButton
          onClick={() => {
            clHistory.goBack();
          }}
        />
      </Box>
      <main>
        <PageLayout>
          <InitiativesNewFormWrapper locationInfo={locationInfo} />
        </PageLayout>
      </main>
    </>
  );
};

export default () => {
  const initiativesEnabled = useFeatureFlag({ name: 'initiatives' });

  if (!initiativesEnabled) {
    return <PageNotFound />;
  }

  return <InitiativesNewPage />;
};
