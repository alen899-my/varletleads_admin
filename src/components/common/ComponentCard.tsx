import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200  dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
    

      {/* Card Body */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 sm:p-6">
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
