import { useEffect, useState } from 'react';

/**
 * A hook that returns true if the component has mounted on the client.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
