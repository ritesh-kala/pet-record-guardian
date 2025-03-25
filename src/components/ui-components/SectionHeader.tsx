
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonLink?: string;
  onButtonClick?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  buttonText,
  buttonIcon = <Plus className="h-4 w-4" />,
  buttonLink,
  onButtonClick,
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      navigate(buttonLink);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 animate-slideIn">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {buttonText && (
        <Button onClick={handleClick} className="gap-1">
          {buttonIcon}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default SectionHeader;
