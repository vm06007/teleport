// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import  { Suspense } from 'react';
import Spinner from '../../../../views/spinner/Spinner';

const Loadable = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
