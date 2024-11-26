'use client';

import dynamic from 'next/dynamic';

const TrackingForm = dynamic(() => import('./tracking-form'), {
  ssr: false,
});

export function TrackingFormWrapper() {
  return <TrackingForm />;
}
