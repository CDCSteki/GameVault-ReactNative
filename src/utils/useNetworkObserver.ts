import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export enum NetworkStatus {
  Available = 'Available',
  Unavailable = 'Unavailable'
}

export function useNetworkObserver(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(NetworkStatus.Available);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      setStatus(isConnected ? NetworkStatus.Available : NetworkStatus.Unavailable);
    });

    return () => unsubscribe();
  }, []);

  return status;
}