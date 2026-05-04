import { PillButton } from "./PillButton";

export type CategoryFilterProps<T extends string> = {
  categories: readonly T[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  allLabel?: string;
  className?: string;
  isDisabled?: boolean;
};

export function CategoryFilter<T extends string>({
  categories,
  value,
  onChange,
  allLabel = "All",
  className,
  isDisabled,
}: CategoryFilterProps<T>) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-gray-50 px-2 py-2 shadow-sm ring-1 ring-gray-900/5">
        <PillButton
          isActive={!value}
          onClick={() => onChange(undefined)}
          disabled={isDisabled}
        >
          {allLabel}
        </PillButton>
        {categories.map((cat) => (
          <PillButton
            key={cat}
            isActive={value === cat}
            onClick={() => onChange(cat)}
            className="capitalize"
            disabled={isDisabled}
          >
            {cat}
          </PillButton>
        ))}
      </div>
    </div>
  );
}
