import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function useErrorToast() {
  const { toast } = useToast();

  const triggerErrorToast = ({ message }: { message: string }) => {
    return toast({
      action: (
        <div>
          <div className='mb-4 flex items-center gap-1 text-orange-500'>
            <Image
              src='/viral-game/error_cross_icon.svg'
              alt='error_icon'
              width={20}
              height={20}
            />
            <Label>{message}</Label>
          </div>
        </div>
      ),
      className: 'bg-neutral-900 block',
      style: {
        borderLeftColor: '#EF4444',
        borderLeftWidth: 10,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRight: 0,
        color: '#ef4444',
        borderRadius: 0,
        background: '#e5e7eb',
        boxShadow: 'none',
        padding: 0,
        paddingTop: 20,
        paddingBottom: 20,
      },
    });
  };

  return { triggerErrorToast };
}
