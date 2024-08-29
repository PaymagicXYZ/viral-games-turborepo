'use client';

import { Button } from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import { Skeleton } from '@/components/ui/skeleton';
import useTagsQuery from '@/lib/hooks/react-query/queries/useTagsQuery';
import { useQueryState } from 'nuqs';

function MarketGroupsTagsLoadingSkeleton() {
  return (
    <div className='w-full space-x-4'>
      {Array.from({ length: 5 }, (_, index) => (
        <Button className='w-[180px]' key={index} disabled>
          <Skeleton className='w-full h-full' />
        </Button>
      ))}
    </div>
  );
}

export default function MarketGroupsTags() {
  const [selectedFilter, setSelectedFilter] = useQueryState('filter');
  const { data: tags, isLoading } = useTagsQuery();

  const handleFilterClick = (value: string) => {
    setSelectedFilter(selectedFilter !== value ? value : null);
  };

  if (isLoading) {
    return <MarketGroupsTagsLoadingSkeleton />;
  }

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
