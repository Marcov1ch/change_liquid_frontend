import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function ShareVehicleDialog({ vehicle, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: share, isLoading } = useQuery({
    queryKey: ['share', vehicle?.id],
    queryFn: () => api.getShareLink(vehicle!.id),
    enabled: !!vehicle,
  });

  useEffect(() => {
    setCopied(false);
  }, [share?.share_url]);

  const invalidate = () => {
    if (vehicle) queryClient.invalidateQueries({ queryKey: ['share', vehicle.id] });
  };

  const enableMutation = useMutation({
    mutationFn: () => api.enableShareLink(vehicle!.id),
    onSuccess: () => {
      invalidate();
      toast.success('Публичная ссылка создана');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rotateMutation = useMutation({
    mutationFn: () => api.rotateShareLink(vehicle!.id),
    onSuccess: () => {
      invalidate();
      toast.success('Ссылка обновлена, старый QR больше не работает');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const disableMutation = useMutation({
    mutationFn: () => api.disableShareLink(vehicle!.id),
    onSuccess: () => {
      invalidate();
      toast.success('Публичный доступ отключён');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCopy = async () => {
    if (!share?.share_url) return;
    try {
      await navigator.clipboard.writeText(share.share_url);
      setCopied(true);
      toast.success('Ссылка скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleRotate = () => {
    if (!confirm('Обновить ссылку? Старый QR-код перестанет работать.')) return;
    rotateMutation.mutate();
  };

  const handleDisable = () => {
    if (!confirm('Отключить публичный доступ? Ссылка и QR-код перестанут работать.')) return;
    disableMutation.mutate();
  };

  return (
    <Modal isOpen={!!vehicle} onClose={onClose} title="Поделиться историей">
      {!vehicle || isLoading ? (
        <p className="text-body-md text-outline">Загрузка...</p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-body-md text-outline m-0">
            Покажите QR-код или отправьте ссылку - так вы поделитесь историей обслуживания и трат автомобиля{' '}
            <span className="text-surface-on font-semibold">
              {vehicle.brand} {vehicle.model}
            </span>.
          </p>

          {share?.enabled && share.share_url ? (
            <>
              <div className="flex justify-center bg-white p-4 rounded-md3-md">
                <QRCodeSVG value={share.share_url} size={220} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-lg text-surface-on">Ссылка</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={share.share_url}
                    className="md3-field flex-1 !text-body-sm"
                    onFocus={(e) => e.target.select()}
                  />
                  <button onClick={handleCopy} className="md3-btn-tonal !px-4 shrink-0">
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
              </div>

              <p className="text-body-sm text-outline m-0">
                Любой, у кого есть ссылка, увидит данные автомобиля, историю замен, ремонтов
                и прочие траты. При обновлении ссылки старый QR-код перестаёт работать.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRotate}
                  disabled={rotateMutation.isPending}
                  className="md3-btn-tonal"
                >
                  {rotateMutation.isPending ? 'Обновление...' : 'Обновить ссылку'}
                </button>
                <button
                  onClick={handleDisable}
                  disabled={disableMutation.isPending}
                  className="md3-btn-danger"
                >
                  {disableMutation.isPending ? 'Отключение...' : 'Отключить доступ'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-body-md text-surface-on m-0">
                Публичный доступ сейчас выключен.
              </p>
              <button
                onClick={() => enableMutation.mutate()}
                disabled={enableMutation.isPending}
                className="md3-btn-primary self-start"
              >
                {enableMutation.isPending ? 'Создание...' : 'Создать ссылку и QR'}
              </button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
