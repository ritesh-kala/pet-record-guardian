
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarClock, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MedicalRecordCardProps {
  recordId?: string;
  petId?: string;
  petName?: string;
  date: string;
  veterinarian: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  hasAttachments?: boolean;
  status?: 'upcoming' | 'completed' | 'overdue';
  type?: string;
  onClick?: () => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  recordId,
  petId,
  petName,
  date,
  veterinarian,
  reason,
  diagnosis,
  treatment,
  hasAttachments = false,
  status = 'completed',
  type,
  onClick,
}) => {
  return (
    <Card className={cn(
      "overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer",
      status === 'upcoming' ? "border-l-info" : 
      status === 'overdue' ? "border-l-destructive" : 
      "border-l-success"
    )}
    onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          
          {type && (
            <Badge variant="secondary" className="text-xs">
              {type}
            </Badge>
          )}
          
          {status && (
            <Badge variant={
              status === 'upcoming' ? "default" : 
              status === 'overdue' ? "destructive" : 
              "secondary"
            } className="text-xs">
              {status === 'upcoming' ? "Upcoming" : 
              status === 'overdue' ? "Overdue" : 
              "Completed"}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {petName && (
            <div className="text-sm font-medium">
              <span className="text-muted-foreground">Pet:</span> {petName}
            </div>
          )}
          
          <h4 className="font-medium">{reason || 'Medical Visit'}</h4>
          
          {diagnosis && (
            <div className="text-sm">
              <span className="font-medium">Diagnosis:</span> {diagnosis}
            </div>
          )}
          
          {treatment && (
            <div className="text-sm">
              <span className="font-medium">Treatment:</span> {treatment}
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Dr. {veterinarian}</span>
          </div>
          
          {hasAttachments && (
            <div className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              <span>Attachments</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalRecordCard;
