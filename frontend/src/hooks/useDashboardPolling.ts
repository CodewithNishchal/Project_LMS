import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// 1. Sales Executive Board Polling (5s interval)
export const useSalesQueue = () => {
  return useQuery({
    queryKey: ['salesLeads'],
    queryFn: async () => {
      const res = await api.get('/sales/leads');
      if (Array.isArray(res.data)) {
        return {
          all: res.data,
          unapplied: res.data.filter((l: any) => l.status === 'LEAD'),
          engaged: res.data.filter((l: any) => l.status === 'LEAD_ENGAGED'),
        };
      }
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

export const useSalesLeads = useSalesQueue;

// Sales Mutations
export const useToggleEngageLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, action }: { leadId: string; action: 'ENGAGE' | 'BRING_BACK' }) => {
      const res = await api.post('/sales/engage', { leadId, action });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesLeads'] });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const res = await api.post('/sales/convert', { leadId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesLeads'] });
      queryClient.invalidateQueries({ queryKey: ['sanctionQueue'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });
};

// 2. Sanction Board Actionable Queue Polling (5s interval)
export const useSanctionActionableQueue = () => {
  return useQuery({
    queryKey: ['sanctionQueue', 'actionable'],
    queryFn: async () => {
      const res = await api.get('/sanction/queue?type=actionable');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

// 3. Sanction Board History Polling (5s interval)
export const useSanctionHistoryQueue = () => {
  return useQuery({
    queryKey: ['sanctionQueue', 'history'],
    queryFn: async () => {
      const res = await api.get('/sanction/queue?type=history');
      return res.data;
    },
    refetchInterval: 5000,
  });
};

// 4. Disbursement Board Actionable Queue Polling (5s interval)
export const useDisbursementActionableQueue = () => {
  return useQuery({
    queryKey: ['disbursementQueue', 'actionable'],
    queryFn: async () => {
      const res = await api.get('/disbursement/queue?type=actionable');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

// 5. Disbursement Board History Polling (5s interval)
export const useDisbursementHistoryQueue = () => {
  return useQuery({
    queryKey: ['disbursementQueue', 'history'],
    queryFn: async () => {
      const res = await api.get('/disbursement/queue?type=history');
      return res.data;
    },
    refetchInterval: 5000,
  });
};

// 6. Collection Board Actionable Queue Polling (5s interval)
export const useCollectionQueue = () => {
  return useQuery({
    queryKey: ['collectionQueue', 'actionable'],
    queryFn: async () => {
      const res = await api.get('/collection/loans?type=actionable');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

// 7. Collection Board History Polling (5s interval)
export const useCollectionHistoryQueue = () => {
  return useQuery({
    queryKey: ['collectionQueue', 'history'],
    queryFn: async () => {
      const res = await api.get('/collection/loans?type=history');
      return res.data;
    },
    refetchInterval: 5000,
  });
};

// 8. Admin Executive Multi-Board Overview Metrics Polling (5s interval)
export const useAdminMetrics = () => {
  return useQuery({
    queryKey: ['adminMetrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

// 9. Borrower Dashboard Polling (/borrower/my-loan) (5s interval)
export const useBorrowerDashboard = () => {
  return useQuery({
    queryKey: ['borrowerDashboard'],
    queryFn: async () => {
      const res = await api.get('/borrower/my-loan');
      return res.data;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};
