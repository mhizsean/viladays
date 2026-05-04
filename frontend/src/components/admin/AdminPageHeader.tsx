import { Button } from "../Button";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  showNewButton: boolean;
  onNewClick: () => void;
};

export function AdminPageHeader({
  title,
  description,
  showNewButton,
  onNewClick,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      {showNewButton && (
        <Button
          variant="solid"
          className="px-4"
          text="+ New event"
          onClick={onNewClick}
        />
      )}
    </div>
  );
}
