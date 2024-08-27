import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function useGenericToast() {
  const { toast } = useToast();

  const triggerToast = ({ message }: { message: string }) => {
    return toast({
      action: (
        <div>
          <div className='flex items-center gap-1 text-orange-500'>
            <Image
              src='/error_cross_icon.svg'
              alt='error_icon'
              width={20}
              height={20}
            />
            <Label className='text-orange-200'>{message}</Label>
          </div>
        </div>
      ),
      className: 'bg-neutral-900 block',
      style: {
        borderLeftColor: '#eab308',
        borderLeftWidth: 10,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRight: 0,
        color: '#eab308',
        borderRadius: 0,
        background: '#e5e7eb',
        boxShadow: 'none',
        padding: 0,
        paddingTop: 20,
        paddingBottom: 20,
      },
    });
  };

  return { triggerToast };
}
