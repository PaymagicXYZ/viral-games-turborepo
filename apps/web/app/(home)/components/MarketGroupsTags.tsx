'use client';

import LinkButton from '@/components/ui/link-button';
import useTagsQuery from '@/lib/hooks/react-query/queries/useTagsQuery';
import { useQueryState } from 'nuqs';

export default function MarketGroupsTags() {
  const [selectedFilter, setSelectedFilter] = useQueryState('filter');
  const { data: tags } = useTagsQuery();

  const handleFilterClick = (value: string) => {
    setSelectedFilter(selectedFilter !== value ? value : null);
  };

  return (
    <div className='w-full space-x-4'>
      {tags?.map((tag) => (
        <Tag
          key={tag.id}
          label={tag.label}
          value={tag.value}
          isSelected={selectedFilter === tag.value}
          onClick={() => handleFilterClick(tag.value)}
        />
      ))}
    </div>
  );
}

type TagProps = {
  label: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
};

function Tag({ label, value, isSelected, onClick }: TagProps) {
  return (
    <LinkButton
      href={`?filter=${isSelected ? '' : value}`}
      className={`${isSelected ? 'bg-green-600 hover:bg-green-700' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {label}
    </LinkButton>
  );
}
