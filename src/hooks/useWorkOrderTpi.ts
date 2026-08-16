import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export interface WorkOrderTpiComponent {
  id: string;
  name: string;
  unit: string;
  order_number: number;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  approved_photo_id?: string;
}

export interface WorkOrderTpi {
  id: string;
  work_code: string;
  title: string;
  description?: string;
  district_id?: string;
  schemetype: string;
  progress_percentage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  components?: WorkOrderTpiComponent[];
  agreement_id?: string;
  district?: {
    districtname: string;
    district_code: string;
  };
}

export interface UploadTpiPhotoPayload {
  workOrderTpiId: string;
  componentId: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export const tpiAgreementsQueryKey = () => ['tpiAgreements'] as const;
export const tpiWorkOrdersQueryKey = (agreementId?: string) =>
  ['tpiWorkOrders', agreementId] as const;
export const tpiWorkOrderQueryKey = (id: string) =>
  ['tpiWorkOrder', id] as const;

export async function fetchTpiAgreements() {
  const response = await api.get('/work-order-tpi/agreements');
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
}

export async function fetchTpiWorkOrders(agreementId?: string) {
  const response = await api.get('/work-order-tpi', {
    params: agreementId ? { agreement_id: agreementId } : undefined,
  });
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
}

export async function fetchTpiWorkOrder(id: string): Promise<WorkOrderTpi> {
  const response = await api.get(`/work-order-tpi/${id}`);
  return response.data;
}

export async function uploadTpiPhoto(payload: UploadTpiPhotoPayload) {
  const response = await api.post(
    `/work-order-tpi/${payload.workOrderTpiId}/components/${payload.componentId}/photos`,
    {
      image_url: payload.imageUrl,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: payload.timestamp || new Date().toISOString(),
    },
  );
  return response.data;
}

export function useTpiAgreements() {
  return useQuery({
    queryKey: tpiAgreementsQueryKey(),
    queryFn: fetchTpiAgreements,
  });
}

export function useTpiWorkOrders(agreementId?: string) {
  return useQuery({
    queryKey: tpiWorkOrdersQueryKey(agreementId),
    queryFn: () => fetchTpiWorkOrders(agreementId),
  });
}

export function useTpiWorkOrder(id: string) {
  return useQuery({
    queryKey: tpiWorkOrderQueryKey(id),
    queryFn: () => fetchTpiWorkOrder(id),
    enabled: !!id,
  });
}

export function useUploadTpiPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadTpiPhoto,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tpiWorkOrderQueryKey(variables.workOrderTpiId),
      });
      queryClient.invalidateQueries({
        queryKey: ['tpiWorkOrders'],
      });
    },
  });
}
