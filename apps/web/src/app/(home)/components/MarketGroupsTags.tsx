import LinkButton from '@/components/ui/link-button';
import { getTags } from '@/lib/actions/supabase/tags';
import { Optional } from '@/lib/types';

export default async function MarketGroupsTags({
  filter,
}: {
  filter: Optional<string>;
}) {
  const tags = await getTags();

  return (
    <div className='w-full space-x-4'>
      {tags?.map((tag) => (
        <Tag
          key={tag.id}
          label={tag.label}
          value={tag.value}
          isSelected={filter === tag.value}
        />
      ))}
    </div>
  );
}

type TagProps = {
  label: string;
  value: string;
  isSelected: boolean;
};

function Tag({ label, value, isSelected }: TagProps) {
  const href = isSelected ? '/' : `?filter=${value}`;

  return (
    <LinkButton
      href={href}
      className={`${isSelected ? 'bg-green-600 hover:bg-green-700' : ''}`}
    >
      {label}
    </LinkButton>
  );
}
