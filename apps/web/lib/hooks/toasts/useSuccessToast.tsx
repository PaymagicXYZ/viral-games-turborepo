import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function useSuccessToast() {
  const { toast } = useToast();

  const triggerSuccessToast = ({
    txHash,
    message,
  }: {
    txHash?: string;
    message: string;
  }) => {
    return toast({
      action: (
        <div>
          <div className='mb-4 flex items-center text-green-500'>
            <Image
              src='/success_checkmark_icon.svg'
              alt='error_icon'
              width={20}
              height={20}
            />
            <Label className='text-xs'>{message}</Label>
          </div>
          {txHash && (
            <Label className='text-green-500'>
              <Link
                target='_blank'
                href={`https://basescan.org/tx/${txHash}`}
                className='cursor-pointer text-xs text-purple-600 underline underline-offset-4'
              >
                Transaction details
              </Link>
            </Label>
          )}
        </div>
      ),
      className: 'bg-neutral-900 block',
      style: {
        borderLeftColor: '#16a34a',
        borderLeftWidth: 10,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRight: 0,
        borderRadius: 0,
        background: '#e5e7eb',
        boxShadow: 'none',
        padding: 0,
        paddingTop: 20,
        paddingBottom: 20,
        color: '#000000',
      },
    });
  };

  return { triggerSuccessToast };
}
