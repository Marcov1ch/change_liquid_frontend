import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useBrands() {
    return useQuery({
        queryKey: ['enums', 'brands'],
        queryFn: api.getBrands,
        staleTime: Infinity,
    });
}

export function useModels(brand: string) {
    return useQuery({
        queryKey: ['enums', 'models', brand],
        queryFn: () => api.getModels(brand),
        enabled: !!brand,
        staleTime: Infinity,
    });
}

export function useComponentConfigs() {
    return useQuery({
        queryKey: ['enums', 'component-configs'],
        queryFn: api.getComponentConfigs,
        staleTime: Infinity,
    });
}
