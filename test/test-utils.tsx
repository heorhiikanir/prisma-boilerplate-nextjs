import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient } from 'react-query';
import Wrapper, { WrapperProps } from 'test/Wrapper';
import { testSession } from 'test/server/handlers/auth';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

type CustomRenderOptionsType = Omit<RenderOptions, 'wrapper'> & {
  wrapperProps?: WrapperProps;
};

export const customRender = (ui: ReactElement, options?: CustomRenderOptionsType) => {
  const { wrapperProps, ...renderOptions } = options;
  const testQueryClient = createTestQueryClient();

  // dehydratedState: unknown; queryClient.setCache()... - for pages
  // fake-data.ts file maybe common with seed maybe

  const defaultWrapperProps = {
    queryClient: testQueryClient,
    session: testSession,
  };

  return render(ui, {
    wrapper: (props) => <Wrapper {...props} {...defaultWrapperProps} {...wrapperProps} />,
    ...renderOptions,
  });
};