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
    <div className={["flex gap-2 flex-wrap", className ?? ""].join(" ")}>
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
  );
}

